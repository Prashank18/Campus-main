import test from "node:test";
import assert from "node:assert/strict";
import { authTestHelpers, handleAuth } from "../server/auth.js";

const { hashPassword, validateRegistration, verifyPassword } = authTestHelpers;

test("password hashes use independent salts and verify correctly", () => {
  const first = hashPassword("a-long-test-password");
  const second = hashPassword("a-long-test-password");

  assert.notEqual(first, second);
  assert.equal(verifyPassword("a-long-test-password", first), true);
  assert.equal(verifyPassword("incorrect-password", first), false);
});

test("registration accepts only complete student or teacher requests", () => {
  const valid = validateRegistration({
    role: "student",
    name: "Test Student",
    phone: "+1 555 0100",
    email: "student@example.edu",
    password: "a-long-test-password",
  });
  assert.equal(valid.error, undefined);
  assert.equal(valid.email, "student@example.edu");

  const invalid = validateRegistration({
    role: "administrator",
    name: "Test Admin",
    phone: "555",
    email: "not-an-email",
    password: "short",
  });
  assert.ok(invalid.error);
});

test("production auth returns JSON when its database is not configured", async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const response = {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = JSON.parse(body);
    },
  };

  try {
    await handleAuth({ headers: {}, method: "GET" }, response, "session");
    assert.equal(response.statusCode, 503);
    assert.match(response.headers["Content-Type"], /application\/json/);
    assert.match(response.body.error, /database is not configured/i);
  } finally {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  }
});
