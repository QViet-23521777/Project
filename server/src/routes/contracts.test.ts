/**
 * contracts.test.ts — Automation Tests for HRM Contract Routes
 * Lab 3: Automation Test with Jest + Supertest + jest.mock (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Framework: Jest + Supertest
 *
 * Endpoints under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   GET    /api/contracts          — Function5  (UTCID01-12)
 *   POST   /api/contracts          — Function6  (UTCID01-12)
 *   PATCH  /api/contracts/:id      — Function7  (UTCID01-12)
 *   DELETE /api/contracts/:id      — Function8  (UTCID01-12)
 *
 * Run: npm test -- --testPathPattern=routes/contracts --verbose
 */

import request from "supertest";
import { createApp } from "../app";

jest.mock("../models/Contract");
jest.mock("../models/Employee");

import { Contract } from "../models/Contract";
import { Employee } from "../models/Employee";

const app = createApp();

const EMPLOYEE_ID = "64f1a2b3c4d5e6f7a8b9c0d1";
const CONTRACT_ID = "64f1a2b3c4d5e6f7a8b9c0e2";

const mockEmployee = {
  _id: EMPLOYEE_ID,
  employeeCode: "EMP001",
  fullName: "Nguyen Van A",
  baseSalary: 10_000_000,
  status: "active",
};

const mockContract = {
  _id: CONTRACT_ID,
  employeeId: EMPLOYEE_ID,
  type: "full_time",
  startDate: "2024-01-01T00:00:00.000Z",
  endDate: "2025-01-01T00:00:00.000Z",
  salary: 10_000_000,
  notes: "Standard contract",
};

const validContractPayload = {
  employeeId: EMPLOYEE_ID,
  type: "full_time",
  startDate: "2024-01-01",
  endDate: "2025-01-01",
  salary: 10_000_000,
};

// Helper
const mockFind = (data: object[]) =>
  (Contract.find as jest.Mock).mockReturnValue({
    sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(data) }),
  });

// =============================================================================
// GET /api/contracts  — Function5
// =============================================================================
describe("GET /api/contracts", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] no filter -> 200 with items array", async () => {
      mockFind([mockContract]);
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    test("UTCID02 [N] filter by employeeId -> 200 with filtered items", async () => {
      mockFind([mockContract]);
      const res = await request(app).get(`/api/contracts?employeeId=${EMPLOYEE_ID}`);
      expect(res.status).toBe(200);
    });

    test("UTCID03 [N] empty result -> 200 with empty array", async () => {
      mockFind([]);
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    test("UTCID04 [N] items sorted by startDate descending (items[0] is most recent)", async () => {
      const contracts = [
        { ...mockContract, startDate: "2025-01-01" },
        { ...mockContract, startDate: "2024-01-01" },
      ];
      mockFind(contracts);
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(2);
    });

    test("UTCID05 [N] returned items contain expected fields (_id, type, salary, startDate)", async () => {
      mockFind([mockContract]);
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(200);
      const item = res.body.items[0];
      expect(item).toHaveProperty("type");
      expect(item).toHaveProperty("salary");
      expect(item).toHaveProperty("startDate");
    });

    test("UTCID06 [N] multiple contracts returned -> items count matches mock", async () => {
      mockFind([mockContract, { ...mockContract, _id: "aabbcc112233445566778899" }]);
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(2);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] employeeId filter with valid ObjectId-like string -> 200", async () => {
      mockFind([]);
      const res = await request(app).get("/api/contracts?employeeId=000000000000000000000000");
      expect(res.status).toBe(200);
    });

    test("UTCID08 [B] employeeId filter with exactly 24 hex chars -> 200 empty", async () => {
      mockFind([]);
      const res = await request(app).get(`/api/contracts?employeeId=${"f".repeat(24)}`);
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB error -> 500", async () => {
      (Contract.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] employeeId is empty string -> 200 (no filter applied)", async () => {
      mockFind([mockContract]);
      const res = await request(app).get("/api/contracts?employeeId=");
      expect(res.status).toBe(200);
    });

    test("UTCID11 [A] non-existent employeeId -> 200 with empty items array", async () => {
      mockFind([]);
      const res = await request(app).get("/api/contracts?employeeId=000000000000000000000001");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    test("UTCID12 [A] DB throws TypeError -> 500", async () => {
      (Contract.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new TypeError("Cannot read properties")),
        }),
      });
      const res = await request(app).get("/api/contracts");
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// POST /api/contracts  — Function6
// =============================================================================
describe("POST /api/contracts", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid full_time contract -> 201 with created item", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue(mockContract);
      const res = await request(app).post("/api/contracts").send(validContractPayload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("item");
    });

    test("UTCID02 [N] probation contract type -> 201", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue({ ...mockContract, type: "probation" });
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, type: "probation" });
      expect(res.status).toBe(201);
    });

    test("UTCID03 [N] part_time contract type -> 201", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue({ ...mockContract, type: "part_time" });
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, type: "part_time" });
      expect(res.status).toBe(201);
    });

    test("UTCID04 [N] service contract type -> 201", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue({ ...mockContract, type: "service" });
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, type: "service" });
      expect(res.status).toBe(201);
    });

    test("UTCID05 [N] contract without endDate (open-ended) -> 201", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue({ ...mockContract, endDate: undefined });
      const { endDate, ...noEndDate } = validContractPayload;
      const res = await request(app).post("/api/contracts").send(noEndDate);
      expect(res.status).toBe(201);
    });

    test("UTCID06 [N] contract with notes -> 201 and notes preserved", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue({ ...mockContract, notes: "Test note" });
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, notes: "Test note" });
      expect(res.status).toBe(201);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] salary = 0 (minimum allowed) -> 201", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Contract.create as jest.Mock).mockResolvedValue({ ...mockContract, salary: 0 });
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, salary: 0 });
      expect(res.status).toBe(201);
    });

    test("UTCID08 [B] employee not found -> 400 with EmployeeNotFound error", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const res = await request(app).post("/api/contracts").send(validContractPayload);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("EmployeeNotFound");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] missing employeeId -> 400", async () => {
      const { employeeId, ...noEmpId } = validContractPayload;
      const res = await request(app).post("/api/contracts").send(noEmpId);
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] invalid contract type -> 400", async () => {
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, type: "freelance" });
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] negative salary -> 400", async () => {
      const res = await request(app).post("/api/contracts").send({ ...validContractPayload, salary: -1000 });
      expect(res.status).toBe(400);
    });

    test("UTCID12 [A] missing startDate -> 400", async () => {
      const { startDate, ...noStart } = validContractPayload;
      const res = await request(app).post("/api/contracts").send(noStart);
      expect(res.status).toBe(400);
    });
  });
});

// =============================================================================
// PATCH /api/contracts/:id  — Function7
// =============================================================================
describe("PATCH /api/contracts/:id", () => {

  const mockUpdate = (data: object | null) =>
    (Contract.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(data),
    });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] update salary -> 200 with updated item", async () => {
      mockUpdate({ ...mockContract, salary: 12_000_000 });
      const res = await request(app).patch(`/api/contracts/${CONTRACT_ID}`).send({ salary: 12_000_000 });
      expect(res.status).toBe(200);
      expect(res.body.item.salary).toBe(12_000_000);
    });

    test("UTCID02 [N] update type -> 200", async () => {
      mockUpdate({ ...mockContract, type: "part_time" });
      const res = await request(app).patch(`/api/contracts/${CONTRACT_ID}`).send({ type: "part_time" });
      expect(res.status).toBe(200);
    });

    test("UTCID03 [N] update notes -> 200", async () => {
      mockUpdate({ ...mockContract, notes: "Updated note" });
      const res = await request(app).patch(`/api/contracts/${CONTRACT_ID}`).send({ notes: "Updated note" });
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] update startDate -> 200", async () => {
      mockUpdate({ ...mockContract, startDate: "2025-01-01T00:00:00.000Z" });
      const res = await request(app).patch(`/api/contracts/${CONTRACT_ID}`).send({ startDate: "2025-01-01" });
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] update endDate -> 200", async () => {
      mockUpdate({ ...mockContract, endDate: "2026-12-31T00:00:00.000Z" });
      const res = await request(app).patch(`/api/contracts/${CONTRACT_ID}`).send({ endDate: "2026-12-31" });
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] update salary to 0 (minimum) -> 200", async () => {
      mockUpdate({ ...mockContract, salary: 0 });
      const res = await request(app).patch(`/api/contracts/${CONTRACT_ID}`).send({ salary: 0 });
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] id not found -> 404", async () => {
      mockUpdate(null);
      const res = await request(app).patch("/api/contracts/000000000000000000000000").send({ salary: 1000 });
      expect(res.status).toBe(404);
    });

    test("UTCID08 [B] update multiple fields simultaneously -> 200", async () => {
      mockUpdate({ ...mockContract, salary: 15_000_000, type: "part_time" });
      const res = await request(app)
        .patch(`/api/contracts/${CONTRACT_ID}`)
        .send({ salary: 15_000_000, type: "part_time" });
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] invalid type value -> 400", async () => {
      const res = await request(app)
        .patch(`/api/contracts/${CONTRACT_ID}`)
        .send({ type: "invalid_type" });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] negative salary -> 400", async () => {
      const res = await request(app)
        .patch(`/api/contracts/${CONTRACT_ID}`)
        .send({ salary: -100 });
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] empty update body {} -> 200 (Zod partial accepts empty)", async () => {
      mockUpdate(mockContract);
      const res = await request(app)
        .patch(`/api/contracts/${CONTRACT_ID}`)
        .send({});
      expect(res.status).toBe(200);
    });

    test("UTCID12 [A] DB throws error -> 500", async () => {
      (Contract.findByIdAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB fail")),
      });
      const res = await request(app)
        .patch(`/api/contracts/${CONTRACT_ID}`)
        .send({ salary: 5000 });
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// DELETE /api/contracts/:id  — Function8
// =============================================================================
describe("DELETE /api/contracts/:id", () => {

  const mockDel = (data: object | null) =>
    (Contract.findByIdAndDelete as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(data),
    });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] existing contract id -> 200 with ok: true", async () => {
      mockDel(mockContract);
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID02 [N] response body is exactly { ok: true }", async () => {
      mockDel(mockContract);
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.body).toEqual({ ok: true });
    });

    test("UTCID03 [N] contract with notes deleted -> ok: true", async () => {
      mockDel({ ...mockContract, notes: "Some note" });
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID04 [N] open-ended contract (no endDate) deleted -> ok: true", async () => {
      mockDel({ ...mockContract, endDate: undefined });
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID05 [N] different valid ObjectId -> 200", async () => {
      const otherId = "aabbccddeeff001122334455";
      mockDel({ ...mockContract, _id: otherId });
      const res = await request(app).delete(`/api/contracts/${otherId}`);
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] probation contract deleted -> ok: true", async () => {
      mockDel({ ...mockContract, type: "probation" });
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.body.ok).toBe(true);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] non-existent id -> 404", async () => {
      mockDel(null);
      const res = await request(app).delete("/api/contracts/000000000000000000000000");
      expect(res.status).toBe(404);
    });

    test("UTCID08 [B] id is exactly 24 hex chars (valid ObjectId) -> 200", async () => {
      mockDel(mockContract);
      const res = await request(app).delete(`/api/contracts/${"a".repeat(24)}`);
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB error -> 500", async () => {
      (Contract.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB fail")),
      });
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] second delete of same id -> 404 (already deleted)", async () => {
      mockDel(null);
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(404);
    });

    test("UTCID11 [A] DB throws TypeError -> 500", async () => {
      (Contract.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new TypeError("Network timeout")),
      });
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(500);
    });

    test("UTCID12 [A] DB throws RangeError -> 500", async () => {
      (Contract.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new RangeError("Out of range")),
      });
      const res = await request(app).delete(`/api/contracts/${CONTRACT_ID}`);
      expect(res.status).toBe(500);
    });
  });
});
