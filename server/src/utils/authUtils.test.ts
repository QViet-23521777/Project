/**
 * authUtils.test.ts — Automation Tests for HRM Authentication Utility Functions
 * Lab 3: Automation Test with Jest + ts-jest (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Framework: Jest + ts-jest
 *
 * Functions under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   Function1 : generateToken(payload)   — LOC 3
 *   Function2 : verifyToken(token)       — LOC 5
 *
 * Run: npm test -- --testPathPattern=authUtils --verbose
 */

import { generateToken, verifyToken, UserPayload } from "./authUtils";

// =============================================================================
// Function1 : generateToken(payload)
// Returns   : Base64 string of JSON.stringify(payload)
// LOC       : 3  |  Lab-2 sheet : Function1
// =============================================================================
describe("generateToken(payload)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] standard user payload -> non-empty base64 string", () => {
      const payload = { id: "1", username: "admin", role: "admin", fullName: "Admin" };
      const token = generateToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    test("UTCID02 [N] token is valid base64 (no whitespace/special chars outside base64 alphabet)", () => {
      const payload = { id: "2", username: "hr", role: "hr", fullName: "HR" };
      const token = generateToken(payload);
      expect(token).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    test("UTCID03 [N] decoded token matches original payload (round-trip)", () => {
      const payload = { id: "1", username: "admin", role: "admin", fullName: "Quản trị viên" };
      const token = generateToken(payload);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded).toEqual(payload);
    });

    test("UTCID04 [N] payload with optional employeeId is preserved", () => {
      const payload = { id: "3", username: "emp1", role: "employee", employeeId: "EMP001", fullName: "Nguyen Van A" };
      const token = generateToken(payload);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded.employeeId).toBe("EMP001");
    });

    test("UTCID05 [N] two different payloads produce two different tokens", () => {
      const t1 = generateToken({ id: "1", username: "admin", role: "admin", fullName: "A" });
      const t2 = generateToken({ id: "2", username: "hr", role: "hr", fullName: "B" });
      expect(t1).not.toBe(t2);
    });

    test("UTCID06 [N] same payload always produces the same token (deterministic)", () => {
      const payload = { id: "1", username: "admin", role: "admin", fullName: "A" };
      expect(generateToken(payload)).toBe(generateToken(payload));
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] empty object payload -> non-empty base64 (encodes '{}')", () => {
      const token = generateToken({});
      expect(token).toBe(Buffer.from("{}").toString("base64"));
    });

    test("UTCID08 [B] payload with unicode fullName is preserved after round-trip", () => {
      const payload = { id: "5", username: "viet", role: "hr", fullName: "Nguyễn Văn Việt" };
      const token = generateToken(payload);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded.fullName).toBe("Nguyễn Văn Việt");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] nested objects in payload are preserved", () => {
      const payload = { id: "1", meta: { dept: "IT" }, role: "admin", username: "a", fullName: "a" };
      const token = generateToken(payload as object);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded.meta).toEqual({ dept: "IT" });
    });

    test("UTCID10 [A] payload with array value is preserved", () => {
      const payload = { id: "1", roles: ["admin", "hr"], username: "a", fullName: "a" };
      const token = generateToken(payload as object);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded.roles).toEqual(["admin", "hr"]);
    });

    test("UTCID11 [A] payload with numeric id is preserved", () => {
      const payload = { id: 99, username: "x", role: "employee", fullName: "X" };
      const token = generateToken(payload as object);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded.id).toBe(99);
    });

    test("UTCID12 [A] payload with boolean value is preserved", () => {
      const payload = { id: "1", active: true, username: "a", role: "admin", fullName: "A" };
      const token = generateToken(payload as object);
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      expect(decoded.active).toBe(true);
    });
  });
});

// =============================================================================
// Function2 : verifyToken(token)
// Returns   : UserPayload | null
// LOC       : 5  |  Lab-2 sheet : Function2
// =============================================================================
describe("verifyToken(token)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid admin token -> returns correct payload", () => {
      const payload: UserPayload = { id: "1", username: "admin", role: "admin", fullName: "Admin" };
      const token = generateToken(payload);
      expect(verifyToken(token)).toEqual(payload);
    });

    test("UTCID02 [N] valid hr token -> returns correct payload", () => {
      const payload: UserPayload = { id: "2", username: "hr", role: "hr", fullName: "Nhân sự" };
      const token = generateToken(payload);
      expect(verifyToken(token)).toEqual(payload);
    });

    test("UTCID03 [N] token with employeeId -> employeeId preserved", () => {
      const payload: UserPayload = { id: "3", username: "emp", role: "employee", employeeId: "EMP001", fullName: "Emp" };
      const token = generateToken(payload);
      const result = verifyToken(token);
      expect(result?.employeeId).toBe("EMP001");
    });

    test("UTCID04 [N] decoded id matches original", () => {
      const payload: UserPayload = { id: "42", username: "test", role: "admin", fullName: "Test" };
      const token = generateToken(payload);
      expect(verifyToken(token)?.id).toBe("42");
    });

    test("UTCID05 [N] decoded role matches original", () => {
      const payload: UserPayload = { id: "1", username: "admin", role: "admin", fullName: "Admin" };
      const token = generateToken(payload);
      expect(verifyToken(token)?.role).toBe("admin");
    });

    test("UTCID06 [N] decoded fullName matches original (unicode)", () => {
      const payload: UserPayload = { id: "1", username: "viet", role: "hr", fullName: "Nguyễn Quốc Việt" };
      const token = generateToken(payload);
      expect(verifyToken(token)?.fullName).toBe("Nguyễn Quốc Việt");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] empty string token -> returns null", () => {
      expect(verifyToken("")).toBeNull();
    });

    test("UTCID08 [B] valid base64 but non-JSON content -> returns null", () => {
      const notJson = Buffer.from("not-json-string").toString("base64");
      expect(verifyToken(notJson)).toBeNull();
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] completely invalid string -> returns null", () => {
      expect(verifyToken("!!!invalid!!!")).toBeNull();
    });

    test("UTCID10 [A] base64 of JSON array (not object) -> returns parsed array (not null)", () => {
      const token = Buffer.from(JSON.stringify([1, 2, 3])).toString("base64");
      const result = verifyToken(token);
      expect(result).not.toBeNull();
    });

    test("UTCID11 [A] base64 of truncated JSON (invalid JSON) -> returns null", () => {
      const truncated = Buffer.from('{"id":"1","username":').toString("base64");
      expect(verifyToken(truncated)).toBeNull();
    });

    test("UTCID12 [A] whitespace-only string -> returns null", () => {
      expect(verifyToken("   ")).toBeNull();
    });
  });
});
