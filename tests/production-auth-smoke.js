import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const baseUrl = (process.env.PRODUCTION_URL || "https://campus-venue-management.vercel.app")
  .replace(/\/+$/, "");
const adminId = process.env.ADMIN_LOGIN_ID;
const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;

if (!adminId || !adminPassword) {
  throw new Error("Load the production admin credentials before running this smoke test.");
}

const email = `auth-smoke-${randomUUID()}@example.com`;
const password = `Smoke-${randomUUID()}-Account`;
const name = "Production Auth Smoke Test";
let adminCookie = "";
let studentCookie = "";

async function request(path, { method = "GET", body, cookie = "" } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json();
  return { response, payload };
}

async function expectStatus(path, options, status) {
  const result = await request(path, options);
  assert.equal(result.response.status, status, `${path}: ${JSON.stringify(result.payload)}`);
  return result;
}

try {
  await expectStatus("/api/auth/session", undefined, 401);

  await expectStatus("/api/auth/register", {
    method: "POST",
    body: {
      role: "student",
      name,
      phone: "+1 555 0100",
      email,
      password,
    },
  }, 201);

  await expectStatus("/api/auth/login", {
    method: "POST",
    body: { role: "student", identifier: email, password },
  }, 403);

  const adminLogin = await expectStatus("/api/auth/login", {
    method: "POST",
    body: { role: "administrator", identifier: adminId, password: adminPassword },
  }, 200);
  adminCookie = adminLogin.response.headers.get("set-cookie")?.split(";", 1)[0] || "";
  assert.ok(adminCookie.startsWith("campusos_session="), "Admin session cookie was not set.");

  const list = await expectStatus("/api/admin/registrations", { cookie: adminCookie }, 200);
  const registration = list.payload.registrations.find((item) => item.email === email);
  assert.ok(registration, "New registration did not appear in the admin queue.");
  assert.equal(registration.status, "Pending");
  assert.equal("passwordHash" in registration, false);
  assert.equal("password_hash" in registration, false);

  await expectStatus(`/api/admin/registrations/${encodeURIComponent(registration.id)}`, {
    method: "PATCH",
    cookie: adminCookie,
    body: { status: "Approved" },
  }, 200);

  const studentLogin = await expectStatus("/api/auth/login", {
    method: "POST",
    body: { role: "student", identifier: email, password },
  }, 200);
  studentCookie = studentLogin.response.headers.get("set-cookie")?.split(";", 1)[0] || "";
  assert.ok(studentCookie.startsWith("campusos_session="), "Student session cookie was not set.");
  assert.equal(studentLogin.payload.account.role, "student");

  const session = await expectStatus("/api/auth/session", { cookie: studentCookie }, 200);
  assert.equal(session.payload.account.email, email);
  await expectStatus("/api/admin/registrations", { cookie: studentCookie }, 403);
  await expectStatus(`/api/admin/registrations/${encodeURIComponent(registration.id)}`, {
    method: "PATCH",
    cookie: adminCookie,
    body: { status: "Rejected" },
  }, 200);
  await expectStatus("/api/auth/session", { cookie: studentCookie }, 401);
  await expectStatus("/api/auth/logout", { method: "POST", cookie: studentCookie }, 200);
  await expectStatus("/api/auth/session", { cookie: studentCookie }, 401);
  await expectStatus("/api/auth/logout", { method: "POST", cookie: adminCookie }, 200);

  console.log("PASS: registration, pending-login denial, admin approval, student login, session, RBAC, and logout.");
} finally {
  if (adminCookie) {
    const list = await request("/api/admin/registrations", { cookie: adminCookie });
    if (list.response.ok) {
      const smokeRegistrations = list.payload.registrations.filter((item) =>
        item.name === name && item.email.startsWith("auth-smoke-")
      );
      for (const registration of smokeRegistrations) {
        if (registration.status !== "Rejected") {
          await expectStatus(`/api/admin/registrations/${encodeURIComponent(registration.id)}`, {
            method: "PATCH",
            cookie: adminCookie,
            body: { status: "Rejected" },
          }, 200);
        }
        await expectStatus(`/api/admin/registrations/${encodeURIComponent(registration.id)}`, {
          method: "DELETE",
          cookie: adminCookie,
        }, 200);
      }
    }
    await request("/api/auth/logout", { method: "POST", cookie: adminCookie });
  }
}
