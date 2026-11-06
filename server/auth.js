import { neon } from "@neondatabase/serverless";
import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const sessionCookie = "campusos_session";
const sessionLifetimeSeconds = 8 * 60 * 60;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s.-]{7,24}$/;

let schemaReady;

function sendJson(response, status, payload, headers = {}) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  for (const [name, value] of Object.entries(headers)) {
    response.setHeader(name, value);
  }
  response.end(JSON.stringify(payload));
}

function safeEqual(left, right) {
  const leftBytes = Buffer.from(String(left));
  const rightBytes = Buffer.from(String(right));
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash || "").split(":");
  if (!salt || !expectedHash || !/^[a-f0-9]{128}$/i.test(expectedHash)) return false;
  const actualHash = scryptSync(password, salt, 64);
  const expectedBytes = Buffer.from(expectedHash, "hex");
  return actualHash.length === expectedBytes.length && timingSafeEqual(actualHash, expectedBytes);
}

function validateRegistration(body) {
  const role = body?.role;
  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!["student", "teacher"].includes(role)) {
    return { error: "Choose Student or Teacher registration." };
  }
  if (
    name.length < 2 ||
    name.length > 100 ||
    !phonePattern.test(phone) ||
    !emailPattern.test(email)
  ) {
    return { error: "Enter a valid name, phone number, and email." };
  }
  if (password.length < 10 || password.length > 200) {
    return { error: "Password must be at least 10 characters." };
  }
  return { role, name, phone, email, password };
}

function requestBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") {
    if (Buffer.byteLength(request.body, "utf8") > 16_384) return null;
    try {
      return JSON.parse(request.body);
    } catch {
      return null;
    }
  }
  return {};
}

function getCookie(request, cookieName) {
  const cookies = String(request.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0 || cookie.slice(0, separator).trim() !== cookieName) continue;
    try {
      return decodeURIComponent(cookie.slice(separator + 1).trim());
    } catch {
      return "";
    }
  }
  return "";
}

function cookieHeader(token, request, maxAge) {
  const secure = process.env.NODE_ENV === "production" ||
    request.headers["x-forwarded-proto"] === "https";
  return `${sessionCookie}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const sql = neon(connectionString);
  schemaReady ??= initializeSchema(sql).catch((error) => {
    schemaReady = undefined;
    throw error;
  });
  await schemaReady;
  return sql;
}

async function initializeSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS campus_registrations (
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(24) NOT NULL,
      email VARCHAR(254) NOT NULL UNIQUE,
      role VARCHAR(16) NOT NULL CHECK (role IN ('student', 'teacher')),
      password_hash TEXT NOT NULL,
      status VARCHAR(16) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS campus_sessions (
      token_hash CHAR(64) PRIMARY KEY,
      role VARCHAR(16) NOT NULL CHECK (role IN ('administrator', 'student', 'teacher')),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(254) NOT NULL DEFAULT '',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS campus_login_limits (
      key_hash CHAR(64) PRIMARY KEY,
      window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attempts INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS campus_registrations_status_created_idx
    ON campus_registrations (status, created_at DESC)
  `;
}

function clientKey(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "");
  const address = forwarded.split(",")[0].trim() || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

async function allowLoginAttempt(sql, request) {
  const key = clientKey(request);
  const result = await sql`
    INSERT INTO campus_login_limits (key_hash, window_started_at, attempts)
    VALUES (${key}, NOW(), 1)
    ON CONFLICT (key_hash) DO UPDATE SET
      attempts = CASE
        WHEN campus_login_limits.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
        ELSE campus_login_limits.attempts + 1
      END,
      window_started_at = CASE
        WHEN campus_login_limits.window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE campus_login_limits.window_started_at
      END
    RETURNING attempts
  `;
  return Number(result[0]?.attempts || 0) <= 10;
}

async function clearLoginAttempts(sql, request) {
  const key = clientKey(request);
  await sql`DELETE FROM campus_login_limits WHERE key_hash = ${key}`;
}

async function createSession(sql, response, request, account) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeSeconds * 1000);
  await sql`
    INSERT INTO campus_sessions (token_hash, role, name, email, expires_at)
    VALUES (
      ${tokenHash(token)},
      ${account.role},
      ${account.name},
      ${account.email || ""},
      ${expiresAt.toISOString()}
    )
  `;
  response.setHeader("Set-Cookie", cookieHeader(token, request, sessionLifetimeSeconds));
}

async function sessionAccount(sql, request) {
  const token = getCookie(request, sessionCookie);
  if (!token) return null;
  const hashedToken = tokenHash(token);
  const rows = await sql`
    SELECT role, name, email
    FROM campus_sessions
    WHERE token_hash = ${hashedToken} AND expires_at > NOW()
    LIMIT 1
  `;
  if (rows.length) {
    const account = rows[0];
    if (account.role !== "administrator") {
      const approved = await sql`
        SELECT 1
        FROM campus_registrations
        WHERE email = ${account.email}
          AND role = ${account.role}
          AND status = 'Approved'
        LIMIT 1
      `;
      if (!approved.length) {
        await sql`DELETE FROM campus_sessions WHERE token_hash = ${hashedToken}`;
        return null;
      }
    }
    return account;
  }
  await sql`DELETE FROM campus_sessions WHERE token_hash = ${hashedToken}`;
  return null;
}

function publicRegistration(registration) {
  return {
    id: registration.id,
    name: registration.name,
    phone: registration.phone,
    email: registration.email,
    role: registration.role,
    status: registration.status,
    createdAt: new Date(registration.created_at).toISOString(),
    ...(registration.reviewed_at
      ? { reviewedAt: new Date(registration.reviewed_at).toISOString() }
      : {}),
  };
}

async function handleSession(request, response, sql) {
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed." }, { Allow: "GET" });
  }
  const account = await sessionAccount(sql, request);
  return sendJson(
    response,
    account ? 200 : 401,
    account ? { account } : { error: "Not signed in." },
  );
}

async function handleLogout(request, response, sql) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
  }
  const token = getCookie(request, sessionCookie);
  if (token) {
    await sql`DELETE FROM campus_sessions WHERE token_hash = ${tokenHash(token)}`;
  }
  response.setHeader("Set-Cookie", cookieHeader("", request, 0));
  return sendJson(response, 200, { ok: true });
}

async function handleRegistration(request, response, sql) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
  }
  const body = requestBody(request);
  if (!body) return sendJson(response, 400, { error: "Invalid request body." });
  const registration = validateRegistration(body);
  if (registration.error) return sendJson(response, 400, { error: registration.error });

  try {
    await sql`
      INSERT INTO campus_registrations
        (id, name, phone, email, role, password_hash, status)
      VALUES (
        ${randomUUID()},
        ${registration.name},
        ${registration.phone},
        ${registration.email},
        ${registration.role},
        ${hashPassword(registration.password)},
        'Pending'
      )
    `;
  } catch (error) {
    if (error?.code === "23505") {
      return sendJson(response, 409, {
        error: "An account or request already exists for this email.",
      });
    }
    throw error;
  }
  return sendJson(response, 201, {
    ok: true,
    message: "Registration sent to the administrator for approval.",
  });
}

async function handleLogin(request, response, sql) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
  }
  if (!(await allowLoginAttempt(sql, request))) {
    return sendJson(response, 429, {
      error: "Too many login attempts. Try again in 15 minutes.",
    });
  }
  const body = requestBody(request);
  if (!body) return sendJson(response, 400, { error: "Invalid request body." });
  const role = String(body.role || "");
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");
  let account;

  if (role === "administrator") {
    const configuredId = process.env.ADMIN_LOGIN_ID || "";
    const configuredPassword = process.env.ADMIN_LOGIN_PASSWORD || "";
    if (!configuredId || !configuredPassword) {
      return sendJson(response, 503, {
        error: "Administrator credentials are not configured on the server.",
      });
    }
    if (!safeEqual(identifier, configuredId) || !safeEqual(password, configuredPassword)) {
      return sendJson(response, 401, { error: "Administrator ID or password is incorrect." });
    }
    account = { role, name: "Administrator", email: "" };
  } else if (["student", "teacher"].includes(role)) {
    if (!emailPattern.test(identifier)) {
      return sendJson(response, 401, { error: "Email or password is incorrect." });
    }
    const rows = await sql`
      SELECT id, name, email, role, password_hash, status
      FROM campus_registrations
      WHERE email = ${identifier.toLowerCase()} AND role = ${role}
      LIMIT 1
    `;
    const registration = rows[0];
    if (!registration) {
      return sendJson(response, 401, { error: "No registration was found. Register first." });
    }
    if (registration.status !== "Approved") {
      return sendJson(response, 403, {
        error: "Your registration is awaiting administrator approval.",
      });
    }
    if (!verifyPassword(password, registration.password_hash)) {
      return sendJson(response, 401, { error: "Email or password is incorrect." });
    }
    account = {
      role: registration.role,
      name: registration.name,
      email: registration.email,
    };
  } else {
    return sendJson(response, 400, { error: "Choose a valid account type." });
  }

  await clearLoginAttempts(sql, request);
  await createSession(sql, response, request, account);
  return sendJson(response, 200, { account });
}

async function handleRegistrationList(request, response, sql) {
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed." }, { Allow: "GET" });
  }
  const account = await sessionAccount(sql, request);
  if (account?.role !== "administrator") {
    return sendJson(response, 403, { error: "Administrator access required." });
  }
  const registrations = await sql`
    SELECT id, name, phone, email, role, status, created_at, reviewed_at
    FROM campus_registrations
    ORDER BY CASE WHEN status = 'Pending' THEN 0 ELSE 1 END, created_at DESC
  `;
  return sendJson(response, 200, { registrations: registrations.map(publicRegistration) });
}

async function handleRegistrationDecision(request, response, sql, id) {
  if (!["PATCH", "DELETE"].includes(request.method)) {
    return sendJson(response, 405, { error: "Method not allowed." }, { Allow: "PATCH, DELETE" });
  }
  const account = await sessionAccount(sql, request);
  if (account?.role !== "administrator") {
    return sendJson(response, 403, { error: "Administrator access required." });
  }
  if (request.method === "DELETE") {
    const deleted = await sql`
      DELETE FROM campus_registrations
      WHERE id = ${id} AND status = 'Rejected'
      RETURNING id
    `;
    if (!deleted.length) {
      return sendJson(response, 404, {
        error: "Only rejected registration requests can be deleted.",
      });
    }
    return sendJson(response, 200, { ok: true });
  }

  const body = requestBody(request);
  if (!body) return sendJson(response, 400, { error: "Invalid request body." });
  const status = body.status;
  if (!["Approved", "Rejected"].includes(status)) {
    return sendJson(response, 400, { error: "Choose Approved or Rejected." });
  }
  const rows = await sql`
    UPDATE campus_registrations
    SET status = ${status}, reviewed_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, phone, email, role, status, created_at, reviewed_at
  `;
  if (!rows.length) return sendJson(response, 404, { error: "Registration not found." });
  if (status === "Rejected") {
    await sql`
      DELETE FROM campus_sessions
      WHERE email = ${rows[0].email} AND role = ${rows[0].role}
    `;
  }
  return sendJson(response, 200, { registration: publicRegistration(rows[0]) });
}

export async function handleAuth(request, response, route) {
  let sql;
  try {
    sql = await getDatabase();
  } catch (error) {
    console.error("Campus authentication database initialization failed.", error?.code || "unknown");
    return sendJson(response, 503, { error: "Authentication storage is temporarily unavailable." });
  }
  if (!sql) {
    return sendJson(response, 503, {
      error: "Authentication database is not configured on the production server.",
    });
  }

  try {
    switch (route) {
      case "session":
        return await handleSession(request, response, sql);
      case "logout":
        return await handleLogout(request, response, sql);
      case "register":
        return await handleRegistration(request, response, sql);
      case "login":
        return await handleLogin(request, response, sql);
      case "registrations":
        return await handleRegistrationList(request, response, sql);
      case "registration-decision":
        return await handleRegistrationDecision(
          request,
          response,
          sql,
          String(request.query?.id || ""),
        );
      default:
        return sendJson(response, 404, { error: "API route not found." });
    }
  } catch (error) {
    console.error("Campus authentication request failed.", error?.code || "unknown");
    return sendJson(response, 500, { error: "Authentication request failed. Please try again." });
  }
}

export const authTestHelpers = { hashPassword, validateRegistration, verifyPassword };
