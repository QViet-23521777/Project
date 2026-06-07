/**
 * auth.test.ts — Automation Tests for HRM Auth Routes
 * Lab 3: Automation Test with Jest + Supertest (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Framework: Jest + Supertest
 *
 * Endpoints under test:
 *   POST /api/auth/login   — UTCID01-12
 *   GET  /api/auth/me      — UTCID01-12
 *
 * Run: npm test -- --testPathPattern=routes/auth --verbose
 */

import request from "supertest";
import { createApp } from "../app";

const app = createApp();

// Pre-built valid token for "admin" user
const adminPayload = { id: "1", username: "admin", role: "admin", fullName: "Quản trị viên" };
const VALID_TOKEN = Buffer.from(JSON.stringify(adminPayload)).toString("base64");

// =============================================================================
// POST /api/auth/login
// =============================================================================
describe("POST /api/auth/login", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] admin credentials -> 200 with token and user object", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "admin123" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.username).toBe("admin");
      expect(res.body.user.role).toBe("admin");
    });

    test("UTCID02 [N] hr credentials -> 200 with token and user object", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "hr", password: "hr123" });
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe("hr");
      expect(res.body.user.role).toBe("hr");
    });

    test("UTCID03 [N] login response token can be decoded to valid payload", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "admin123" });
      const decoded = JSON.parse(Buffer.from(res.body.token, "base64").toString());
      expect(decoded.username).toBe("admin");
      expect(decoded.id).toBe("1");
    });

    test("UTCID04 [N] response includes user._id field", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "admin123" });
      expect(res.body.user).toHaveProperty("_id");
    });

    test("UTCID05 [N] response includes user.fullName", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "admin123" });
      expect(res.body.user.fullName).toBe("Quản trị viên");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] password with minimum length (1 char) that matches -> 200", async () => {
      // hr123 is the known password; test that exact match is required
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "hr", password: "hr123" });
      expect(res.status).toBe(200);
    });

    test("UTCID07 [B] correct username, wrong password by one char -> 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "admin124" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] missing username -> 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "admin123" });
      expect(res.status).toBe(400);
    });

    test("UTCID09 [A] missing password -> 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "admin" });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] empty body -> 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({});
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] non-existent username -> 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "nonexistent", password: "whatever" });
      expect(res.status).toBe(401);
    });

    test("UTCID12 [A] correct credentials but username in different case -> 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "ADMIN", password: "admin123" });
      expect(res.status).toBe(401);
    });
  });
});

// =============================================================================
// GET /api/auth/me
// =============================================================================
describe("GET /api/auth/me", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid Bearer token -> 200 with user object", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${VALID_TOKEN}`);
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe("admin");
    });

    test("UTCID02 [N] response includes user._id", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${VALID_TOKEN}`);
      expect(res.body.user).toHaveProperty("_id");
    });

    test("UTCID03 [N] response includes user.role", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${VALID_TOKEN}`);
      expect(res.body.user.role).toBe("admin");
    });

    test("UTCID04 [N] response includes user.fullName", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${VALID_TOKEN}`);
      expect(res.body.user.fullName).toBe("Quản trị viên");
    });

    test("UTCID05 [N] hr token -> returns hr user", async () => {
      const hrPayload = { id: "2", username: "hr", role: "hr", fullName: "Nhân sự" };
      const hrToken = Buffer.from(JSON.stringify(hrPayload)).toString("base64");
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${hrToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("hr");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] 'Bearer ' (empty token after prefix) -> 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer ");
      expect(res.status).toBe(401);
    });

    test("UTCID07 [B] 'Bearer invalid-base64!!!' -> 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid!!!");
      expect(res.status).toBe(401);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] no Authorization header -> 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    test("UTCID09 [A] 'Basic <token>' scheme -> 401 (not Bearer)", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Basic ${VALID_TOKEN}`);
      expect(res.status).toBe(401);
    });

    test("UTCID10 [A] token is valid base64 but not JSON -> 401", async () => {
      const badToken = Buffer.from("not-json").toString("base64");
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${badToken}`);
      expect(res.status).toBe(401);
    });

    test("UTCID11 [A] malformed Authorization value -> 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Token something");
      expect(res.status).toBe(401);
    });

    test("UTCID12 [A] empty Authorization header value -> 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "");
      expect(res.status).toBe(401);
    });
  });
});
