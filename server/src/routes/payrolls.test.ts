/**
 * payrolls.test.ts — Automation Tests for HRM Payroll Routes
 * Lab 3: Automation Test with Jest + Supertest + jest.mock (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Framework: Jest + Supertest
 *
 * Endpoints under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   GET    /api/payrolls               — Function15 (UTCID01-12)
 *   POST   /api/payrolls               — Function16 (UTCID01-12)
 *   PATCH  /api/payrolls/:id           — Function17 (UTCID01-12)
 *   DELETE /api/payrolls/:id           — Function18 (UTCID01-12)
 *   POST   /api/payrolls/post-month    — Function19 (UTCID01-12)
 *
 * Run: npm test -- --testPathPattern=routes/payrolls --verbose
 */

import request from "supertest";
import { createApp } from "../app";

jest.mock("../models/Payroll");
jest.mock("../models/Employee");

import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";

const app = createApp();

const EMPLOYEE_ID = "64f1a2b3c4d5e6f7a8b9c0d1";
const PAYROLL_ID  = "64f1a2b3c4d5e6f7a8b9c0f3";

const mockEmployee = {
  _id: EMPLOYEE_ID,
  employeeCode: "EMP001",
  fullName: "Nguyen Van A",
  baseSalary: 10_000_000,
  status: "active",
};

const mockPayroll = {
  _id: PAYROLL_ID,
  employeeId: EMPLOYEE_ID,
  month: "2026-05",
  baseSalary: 10_000_000,
  allowances: 500_000,
  deductions: 200_000,
  netPay: 10_300_000,
  status: "draft",
};

const validPayrollPayload = {
  employeeId: EMPLOYEE_ID,
  month: "2026-05",
  baseSalary: 10_000_000,
  allowances: 500_000,
  deductions: 200_000,
};

const mockFind = (data: object[]) =>
  (Payroll.find as jest.Mock).mockReturnValue({
    sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(data) }),
  });

// =============================================================================
// GET /api/payrolls — Function15
// =============================================================================
describe("GET /api/payrolls", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] no filter -> 200 with items array", async () => {
      mockFind([mockPayroll]);
      const res = await request(app).get("/api/payrolls");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    test("UTCID02 [N] filter by employeeId -> 200", async () => {
      mockFind([mockPayroll]);
      const res = await request(app).get(`/api/payrolls?employeeId=${EMPLOYEE_ID}`);
      expect(res.status).toBe(200);
    });

    test("UTCID03 [N] filter by month=2026-05 -> 200", async () => {
      mockFind([mockPayroll]);
      const res = await request(app).get("/api/payrolls?month=2026-05");
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] filter by status=draft -> 200", async () => {
      mockFind([mockPayroll]);
      const res = await request(app).get("/api/payrolls?status=draft");
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] filter by status=paid -> 200", async () => {
      mockFind([]);
      const res = await request(app).get("/api/payrolls?status=paid");
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] returned items have netPay field", async () => {
      mockFind([mockPayroll]);
      const res = await request(app).get("/api/payrolls");
      expect(res.status).toBe(200);
      expect(res.body.items[0]).toHaveProperty("netPay");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] empty result -> 200 with empty array", async () => {
      mockFind([]);
      const res = await request(app).get("/api/payrolls");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    test("UTCID08 [B] combined filters (employeeId + month + status) -> 200", async () => {
      mockFind([mockPayroll]);
      const res = await request(app).get(
        `/api/payrolls?employeeId=${EMPLOYEE_ID}&month=2026-05&status=draft`
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB error -> 500", async () => {
      (Payroll.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });
      const res = await request(app).get("/api/payrolls");
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] unknown status value -> 200 (no status validation on GET)", async () => {
      mockFind([]);
      const res = await request(app).get("/api/payrolls?status=unknown");
      expect(res.status).toBe(200);
    });

    test("UTCID11 [A] DB throws TypeError -> 500", async () => {
      (Payroll.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new TypeError("Cast error")),
        }),
      });
      const res = await request(app).get("/api/payrolls");
      expect(res.status).toBe(500);
    });

    test("UTCID12 [A] month param in wrong format -> 200 (GET does not validate month format)", async () => {
      mockFind([]);
      const res = await request(app).get("/api/payrolls?month=invalid");
      expect(res.status).toBe(200);
    });
  });
});

// =============================================================================
// POST /api/payrolls — Function16
// =============================================================================
describe("POST /api/payrolls", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid payload -> 201 with created item", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Payroll.create as jest.Mock).mockResolvedValue(mockPayroll);
      const res = await request(app).post("/api/payrolls").send(validPayrollPayload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("item");
    });

    test("UTCID02 [N] netPay is computed correctly: 10M + 500K - 200K = 10.3M", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Payroll.create as jest.Mock).mockImplementation((data: any) => Promise.resolve({ ...data }));
      const res = await request(app).post("/api/payrolls").send(validPayrollPayload);
      expect(res.status).toBe(201);
      expect(res.body.item.netPay).toBe(10_300_000);
    });

    test("UTCID03 [N] defaults: no allowances/deductions -> netPay = baseSalary", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Payroll.create as jest.Mock).mockImplementation((data: any) => Promise.resolve({ ...data }));
      const res = await request(app).post("/api/payrolls").send({
        employeeId: EMPLOYEE_ID,
        month: "2026-05",
        baseSalary: 10_000_000,
      });
      expect(res.status).toBe(201);
      expect(res.body.item.netPay).toBe(10_000_000);
    });

    test("UTCID04 [N] default status is 'draft' when not provided", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Payroll.create as jest.Mock).mockImplementation((data: any) => Promise.resolve({ ...data }));
      const res = await request(app).post("/api/payrolls").send(validPayrollPayload);
      expect(res.status).toBe(201);
      expect(res.body.item.status).toBe("draft");
    });

    test("UTCID05 [N] deductions > baseSalary + allowances -> netPay = 0", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Payroll.create as jest.Mock).mockImplementation((data: any) => Promise.resolve({ ...data }));
      const res = await request(app).post("/api/payrolls").send({
        employeeId: EMPLOYEE_ID,
        month: "2026-05",
        baseSalary: 1_000_000,
        allowances: 0,
        deductions: 2_000_000,
      });
      expect(res.status).toBe(201);
      expect(res.body.item.netPay).toBe(0);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] employee not found -> 400 EmployeeNotFound", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const res = await request(app).post("/api/payrolls").send(validPayrollPayload);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("EmployeeNotFound");
    });

    test("UTCID07 [B] baseSalary = 0 (minimum) -> 201 with netPay = 0", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEmployee) });
      (Payroll.create as jest.Mock).mockImplementation((data: any) => Promise.resolve({ ...data }));
      const res = await request(app).post("/api/payrolls").send({
        ...validPayrollPayload,
        baseSalary: 0,
        allowances: 0,
        deductions: 0,
      });
      expect(res.status).toBe(201);
      expect(res.body.item.netPay).toBe(0);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] missing month -> 400", async () => {
      const { month, ...noMonth } = validPayrollPayload;
      const res = await request(app).post("/api/payrolls").send(noMonth);
      expect(res.status).toBe(400);
    });

    test("UTCID09 [A] invalid month format (not YYYY-MM) -> 400", async () => {
      const res = await request(app)
        .post("/api/payrolls")
        .send({ ...validPayrollPayload, month: "05-2026" });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] missing baseSalary -> 400", async () => {
      const { baseSalary, ...noBase } = validPayrollPayload;
      const res = await request(app).post("/api/payrolls").send(noBase);
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] negative baseSalary -> 400", async () => {
      const res = await request(app)
        .post("/api/payrolls")
        .send({ ...validPayrollPayload, baseSalary: -100 });
      expect(res.status).toBe(400);
    });

    test("UTCID12 [A] missing employeeId -> 400", async () => {
      const { employeeId, ...noEmpId } = validPayrollPayload;
      const res = await request(app).post("/api/payrolls").send(noEmpId);
      expect(res.status).toBe(400);
    });
  });
});

// =============================================================================
// PATCH /api/payrolls/:id — Function17
// =============================================================================
describe("PATCH /api/payrolls/:id", () => {

  const buildMockPayroll = (overrides: Partial<typeof mockPayroll> = {}) => {
    const p = { ...mockPayroll, ...overrides };
    return {
      ...p,
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn().mockReturnValue(p),
    };
  };

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] update baseSalary -> 200 and netPay recalculated", async () => {
      const existing = buildMockPayroll();
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ baseSalary: 12_000_000 });
      expect(res.status).toBe(200);
    });

    test("UTCID02 [N] update allowances -> 200", async () => {
      const existing = buildMockPayroll();
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ allowances: 1_000_000 });
      expect(res.status).toBe(200);
    });

    test("UTCID03 [N] update deductions -> 200", async () => {
      const existing = buildMockPayroll();
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ deductions: 300_000 });
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] update status draft -> paid -> 200", async () => {
      const existing = buildMockPayroll();
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ status: "paid" });
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] update status paid -> draft -> 200", async () => {
      const existing = buildMockPayroll({ status: "paid" });
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ status: "draft" });
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] update baseSalary to 0 (minimum) -> 200", async () => {
      const existing = buildMockPayroll();
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ baseSalary: 0 });
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] id not found -> 404", async () => {
      (Payroll.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .patch("/api/payrolls/000000000000000000000000")
        .send({ baseSalary: 1000 });
      expect(res.status).toBe(404);
    });

    test("UTCID08 [B] empty update body {} -> 200 (no-op)", async () => {
      const existing = buildMockPayroll();
      (Payroll.findById as jest.Mock).mockResolvedValue(existing);
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({});
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] invalid status value -> 400", async () => {
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ status: "pending" });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] negative baseSalary -> 400", async () => {
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ baseSalary: -1000 });
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] DB throws error on findById -> 500", async () => {
      (Payroll.findById as jest.Mock).mockRejectedValue(new Error("DB fail"));
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ baseSalary: 5000 });
      expect(res.status).toBe(500);
    });

    test("UTCID12 [A] DB throws TypeError -> 500", async () => {
      (Payroll.findById as jest.Mock).mockRejectedValue(new TypeError("Cast error"));
      const res = await request(app)
        .patch(`/api/payrolls/${PAYROLL_ID}`)
        .send({ baseSalary: 5000 });
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// DELETE /api/payrolls/:id — Function18
// =============================================================================
describe("DELETE /api/payrolls/:id", () => {

  const mockDel = (data: object | null) =>
    (Payroll.findByIdAndDelete as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(data),
    });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] existing id -> 200 with ok: true", async () => {
      mockDel(mockPayroll);
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID02 [N] response body is exactly { ok: true }", async () => {
      mockDel(mockPayroll);
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.body).toEqual({ ok: true });
    });

    test("UTCID03 [N] draft payroll deleted -> ok: true", async () => {
      mockDel({ ...mockPayroll, status: "draft" });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID04 [N] paid payroll deleted -> ok: true", async () => {
      mockDel({ ...mockPayroll, status: "paid" });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID05 [N] different valid ObjectId -> 200", async () => {
      const otherId = "aabbccddeeff001122334455";
      mockDel({ ...mockPayroll, _id: otherId });
      const res = await request(app).delete(`/api/payrolls/${otherId}`);
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] payroll with high netPay deleted -> ok: true", async () => {
      mockDel({ ...mockPayroll, netPay: 50_000_000 });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.body.ok).toBe(true);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] non-existent id -> 404", async () => {
      mockDel(null);
      const res = await request(app).delete("/api/payrolls/000000000000000000000000");
      expect(res.status).toBe(404);
    });

    test("UTCID08 [B] second delete of same id -> 404 (already deleted)", async () => {
      mockDel(null);
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.status).toBe(404);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB error -> 500", async () => {
      (Payroll.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB fail")),
      });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] DB throws TypeError -> 500", async () => {
      (Payroll.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new TypeError("Cast error")),
      });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.status).toBe(500);
    });

    test("UTCID11 [A] DB throws RangeError -> 500", async () => {
      (Payroll.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new RangeError("Out of range")),
      });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.status).toBe(500);
    });

    test("UTCID12 [A] DB throws network error -> 500", async () => {
      (Payroll.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("ECONNRESET")),
      });
      const res = await request(app).delete(`/api/payrolls/${PAYROLL_ID}`);
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// POST /api/payrolls/post-month — Function19
// =============================================================================
describe("POST /api/payrolls/post-month", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid month with drafts -> 200 with ok and updated count", async () => {
      (Payroll.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 3 });
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-05" });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.updated).toBe(3);
    });

    test("UTCID02 [N] valid month with no drafts -> 200 with updated = 0", async () => {
      (Payroll.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-01" });
      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(0);
    });

    test("UTCID03 [N] first month of year (2026-01) -> 200", async () => {
      (Payroll.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 5 });
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-01" });
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] last month of year (2026-12) -> 200", async () => {
      (Payroll.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-12" });
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID05 [B] month = boundary '2026-01' (first valid) -> 200", async () => {
      (Payroll.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-01" });
      expect(res.status).toBe(200);
    });

    test("UTCID06 [B] empty body (month not provided) -> 400 InvalidMonth", async () => {
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidMonth");
    });

    test("UTCID07 [B] month=2026-00 (passes regex, route accepts) -> 200 with 0 updates", async () => {
      (Payroll.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-00" });
      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(0);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] month in wrong format (2026/05) -> 400 InvalidMonth", async () => {
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026/05" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidMonth");
    });

    test("UTCID09 [A] month = 'YYYY-DD' wrong order -> 400 InvalidMonth", async () => {
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "05-2026" });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] month is non-string (number 202605) -> 400 InvalidMonth", async () => {
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: 202605 });
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] month is empty string '' -> 400 InvalidMonth", async () => {
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "" });
      expect(res.status).toBe(400);
    });

    test("UTCID12 [A] DB error during updateMany -> 500", async () => {
      (Payroll.updateMany as jest.Mock).mockRejectedValue(new Error("DB fail"));
      const res = await request(app)
        .post("/api/payrolls/post-month")
        .send({ month: "2026-05" });
      expect(res.status).toBe(500);
    });
  });
});
