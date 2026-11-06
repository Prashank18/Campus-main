import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const sessionCookie = "campusos_session";
const sessionLifetime = 8 * 60 * 60;
const dataDirectory = resolve(process.cwd(), ".local-data");
const registrationsFile = resolve(dataDirectory, "registrations.json");

function readRegistrations() {
  mkdirSync(dataDirectory, { recursive: true });
  try {
    const registrations = JSON.parse(readFileSync(registrationsFile, "utf8"));
    return Array.isArray(registrations) ? registrations : [];
  } catch {
    return [];
  }
}

function writeRegistrations(registrations) {
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(registrationsFile, JSON.stringify(registrations, null, 2), "utf8");
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
  const [salt, expectedHash] = (storedHash || "").split(":");
  if (!salt || !expectedHash) return false;
  const actualHash = scryptSync(password, salt, 64);
  const expectedBytes = Buffer.from(expectedHash, "hex");
  return actualHash.length === expectedBytes.length && timingSafeEqual(actualHash, expectedBytes);
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const separator = part.indexOf("=");
    return separator < 0
      ? [part.trim(), ""]
      : [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
  }));
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw new Error("Request is too large.");
  }
  return body ? JSON.parse(body) : {};
}

function authApi(env) {
  const sessions = new Map();
  const attempts = new Map();

  function limitLogin(request) {
    const key = request.socket.remoteAddress || "local";
    const now = Date.now();
    const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60_000);
    if (recent.length >= 10) return false;
    recent.push(now);
    attempts.set(key, recent);
    return true;
  }

  function getSession(request) {
    const token = parseCookies(request.headers.cookie)[sessionCookie];
    const session = token && sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token);
      return null;
    }
    return session.account;
  }

  function setSession(response, account, request) {
    const token = randomBytes(32).toString("base64url");
    sessions.set(token, { account, expiresAt: Date.now() + sessionLifetime * 1000 });
    const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
    response.setHeader("Set-Cookie", `${sessionCookie}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetime}${secure}`);
  }

  async function handle(request, response, next) {
    const url = new URL(request.url, "http://localhost");
    const path = url.pathname;
    if (!path.startsWith("/api/auth/") && !path.startsWith("/api/admin/registrations")) return next();

    try {
      if (request.method === "GET" && path === "/api/auth/session") {
        const account = getSession(request);
        return sendJson(response, account ? 200 : 401, account ? { account } : { error: "Not signed in." });
      }

      if (request.method === "POST" && path === "/api/auth/logout") {
        const token = parseCookies(request.headers.cookie)[sessionCookie];
        if (token) sessions.delete(token);
        response.setHeader("Set-Cookie", `${sessionCookie}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
        return sendJson(response, 200, { ok: true });
      }

      if (request.method === "POST" && path === "/api/auth/register") {
        const body = await readJson(request);
        const role = body.role;
        const name = String(body.name || "").trim();
        const phone = String(body.phone || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!["student", "teacher"].includes(role)) return sendJson(response, 400, { error: "Choose Student or Teacher registration." });
        if (name.length < 2 || name.length > 100 || !/^[+()\d\s.-]{7,24}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return sendJson(response, 400, { error: "Enter a valid name, phone number, and email." });
        }
        if (password.length < 10 || password.length > 200) return sendJson(response, 400, { error: "Password must be at least 10 characters." });
        const registrations = readRegistrations();
        if (registrations.some((item) => item.email === email)) {
          return sendJson(response, 409, { error: "An account or request already exists for this email." });
        }
        registrations.unshift({
          id: randomUUID(),
          name,
          phone,
          email,
          role,
          passwordHash: hashPassword(password),
          status: "Pending",
          createdAt: new Date().toISOString(),
        });
        writeRegistrations(registrations);
        return sendJson(response, 201, { ok: true, message: "Registration sent to the administrator for approval." });
      }

      if (request.method === "POST" && path === "/api/auth/login") {
        if (!limitLogin(request)) return sendJson(response, 429, { error: "Too many login attempts. Try again in 15 minutes." });
        const body = await readJson(request);
        const role = String(body.role || "");
        const identifier = String(body.identifier || "").trim();
        const password = String(body.password || "");
        let account;

        if (role === "administrator") {
          const configuredId = env.ADMIN_LOGIN_ID || "";
          const configuredPassword = env.ADMIN_LOGIN_PASSWORD || "";
          if (!configuredId || !configuredPassword) return sendJson(response, 503, { error: "Administrator credentials are not configured on the local server." });
          if (!safeEqual(identifier, configuredId) || !safeEqual(password, configuredPassword)) {
            return sendJson(response, 401, { error: "Administrator ID or password is incorrect." });
          }
          account = { role, name: "Administrator", email: "" };
        } else if (["student", "teacher"].includes(role)) {
          const registration = readRegistrations().find((item) => item.email === identifier.toLowerCase() && item.role === role);
          if (!registration) return sendJson(response, 401, { error: "No registration was found. Register first." });
          if (registration.status !== "Approved") return sendJson(response, 403, { error: "Your registration is awaiting administrator approval." });
          if (!verifyPassword(password, registration.passwordHash)) return sendJson(response, 401, { error: "Email or password is incorrect." });
          account = { role, name: registration.name, email: registration.email };
        } else {
          return sendJson(response, 400, { error: "Choose a valid account type." });
        }

        setSession(response, account, request);
        return sendJson(response, 200, { account });
      }

      const admin = getSession(request);
      if (admin?.role !== "administrator") return sendJson(response, 403, { error: "Administrator access required." });

      if (request.method === "GET" && path === "/api/admin/registrations") {
        const registrations = readRegistrations()
          .sort((left, right) => (left.status === "Pending" ? -1 : 1) - (right.status === "Pending" ? -1 : 1))
          .map(({ passwordHash, ...registration }) => registration);
        return sendJson(response, 200, { registrations });
      }

      const registrationId = path.match(/^\/api\/admin\/registrations\/([^/]+)$/)?.[1];
      if (request.method === "PATCH" && registrationId) {
        const { status } = await readJson(request);
        if (!["Approved", "Rejected"].includes(status)) return sendJson(response, 400, { error: "Choose Approved or Rejected." });
        const registrations = readRegistrations();
        const index = registrations.findIndex((item) => item.id === registrationId);
        if (index < 0) return sendJson(response, 404, { error: "Registration not found." });
        registrations[index] = { ...registrations[index], status, reviewedAt: new Date().toISOString() };
        writeRegistrations(registrations);
        const { passwordHash, ...registration } = registrations[index];
        return sendJson(response, 200, { registration });
      }

      return sendJson(response, 404, { error: "API route not found." });
    } catch (error) {
      return sendJson(response, error instanceof SyntaxError ? 400 : 500, { error: error instanceof SyntaxError ? "Invalid request body." : "Local authentication service error." });
    }
  }

  return {
    name: "campus-local-auth",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void handle(request, response, next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  plugins: [authApi(env), react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return "react-vendor";
          if (/node_modules\/(@mui|@emotion)\//.test(id)) return "mui-vendor";
          if (/node_modules\/(recharts|d3-[^/]+)\//.test(id)) return "charts-vendor";
          if (id.includes("node_modules/lucide-react/")) return "icons-vendor";
        },
      },
    },
  },
  };
});
