/**
 * employees.test.ts — Automation Tests for HRM Employee Routes
 * Lab 3: Automation Test with Jest + Supertest + jest.mock (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Framework: Jest + Supertest
 *
 * Endpoints under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   GET    /api/employees          — Function9  (UTCID01-12)
 *   POST   /api/employees          — Function10 (UTCID01-12)
 *   GET    /api/employees/:id      — Function11 (UTCID01-12)
 *   PATCH  /api/employees/:id      — Function12 (UTCID01-12)
 *   DELETE /api/employees/:id      — Function13 (UTCID01-12)
 *
 * Run: npm test -- --testPathPattern=routes/employees --verbose
 */

import request from "supertest";
import { createApp } from "../app";

jest.mock("../models/Employee");

import { Employee } from "../models/Employee";

const app = createApp();

const mockEmployee = {
  _id: "64f1a2b3c4d5e6f7a8b9c0d1",
  employeeCode: "EMP001",
  fullName: "Nguyen Van A",
  email: "nva@example.com",
  phone: "0901234567",
  department: "IT",
  position: "Developer",
  baseSalary: 10_000_000,
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockFind = (data: object[]) =>
  (Employee.find as jest.Mock).mockReturnValue({
    sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(data) }),
  });

// =============================================================================
// GET /api/employees — Function9
// =============================================================================
describe("GET /api/employees", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] no filters -> 200 with items array", async () => {
      mockFind([mockEmployee]);
      const res = await request(app).get("/api/employees");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    test("UTCID02 [N] filter by department=IT -> 200 with items", async () => {
      mockFind([mockEmployee]);
      const res = await request(app).get("/api/employees?department=IT");
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(0);
    });

    test("UTCID03 [N] filter by status=active -> 200", async () => {
      mockFind([mockEmployee]);
      const res = await request(app).get("/api/employees?status=active");
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] search by q=Nguyen -> 200 with items", async () => {
      mockFind([mockEmployee]);
      const res = await request(app).get("/api/employees?q=Nguyen");
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] empty DB -> 200 with empty items array", async () => {
      mockFind([]);
      const res = await request(app).get("/api/employees");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    test("UTCID06 [N] filter by status=inactive -> 200", async () => {
      mockFind([]);
      const res = await request(app).get("/api/employees?status=inactive");
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] q with regex special chars -> 200 (not crash)", async () => {
      mockFind([]);
      const res = await request(app).get("/api/employees?q=.*");
      expect(res.status).toBe(200);
    });

    test("UTCID08 [B] multiple filters combined (department + status) -> 200", async () => {
      mockFind([mockEmployee]);
      const res = await request(app).get("/api/employees?department=IT&status=active");
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB throws error -> 500", async () => {
      (Employee.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });
      const res = await request(app).get("/api/employees");
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] filter by unknown status value -> 200 (no filter validation)", async () => {
      mockFind([]);
      const res = await request(app).get("/api/employees?status=unknown");
      expect(res.status).toBe(200);
    });

    test("UTCID11 [A] q is empty string -> 200 (no search applied)", async () => {
      mockFind([mockEmployee]);
      const res = await request(app).get("/api/employees?q=");
      expect(res.status).toBe(200);
    });

    test("UTCID12 [A] department filter with no matching records -> 200 empty", async () => {
      mockFind([]);
      const res = await request(app).get("/api/employees?department=Nonexistent");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });
  });
});

// =============================================================================
// POST /api/employees — Function10
// =============================================================================
describe("POST /api/employees", () => {

  const validPayload = {
    employeeCode: "EMP002",
    fullName: "Tran Thi B",
    email: "ttb@example.com",
    department: "HR",
    position: "Recruiter",
    baseSalary: 8_000_000,
    status: "active",
  };

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid payload -> 201 with created item", async () => {
      (Employee.create as jest.Mock).mockResolvedValue({ ...mockEmployee, ...validPayload });
      const res = await request(app).post("/api/employees").send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("item");
    });

    test("UTCID02 [N] item in response has correct employeeCode", async () => {
      (Employee.create as jest.Mock).mockResolvedValue({ ...mockEmployee, employeeCode: "EMP002" });
      const res = await request(app).post("/api/employees").send(validPayload);
      expect(res.body.item.employeeCode).toBe("EMP002");
    });

    test("UTCID03 [N] optional fields (email, phone) not required -> 201", async () => {
      (Employee.create as jest.Mock).mockResolvedValue({ ...mockEmployee });
      const res = await request(app).post("/api/employees").send({
        employeeCode: "EMP003",
        fullName: "Le Van C",
        baseSalary: 7_000_000,
        status: "active",
      });
      expect(res.status).toBe(201);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID04 [B] baseSalary = 0 (minimum) -> 201", async () => {
      (Employee.create as jest.Mock).mockResolvedValue({ ...mockEmployee, baseSalary: 0 });
      const res = await request(app).post("/api/employees").send({ ...validPayload, baseSalary: 0 });
      expect(res.status).toBe(201);
    });

    test("UTCID05 [B] status = inactive -> 201", async () => {
      (Employee.create as jest.Mock).mockResolvedValue({ ...mockEmployee, status: "inactive" });
      const res = await request(app).post("/api/employees").send({ ...validPayload, status: "inactive" });
      expect(res.status).toBe(201);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID06 [A] missing required fullName -> 400", async () => {
      const res = await request(app)
        .post("/api/employees")
        .send({ employeeCode: "EMP004", baseSalary: 1000, status: "active" });
      expect(res.status).toBe(400);
    });

    test("UTCID07 [A] missing required employeeCode -> 400", async () => {
      const res = await request(app)
        .post("/api/employees")
        .send({ fullName: "Test", baseSalary: 1000, status: "active" });
      expect(res.status).toBe(400);
    });

    test("UTCID08 [A] invalid status value -> 400", async () => {
      const res = await request(app)
        .post("/api/employees")
        .send({ ...validPayload, status: "terminated" });
      expect(res.status).toBe(400);
    });

    test("UTCID09 [A] negative baseSalary -> 400", async () => {
      const res = await request(app)
        .post("/api/employees")
        .send({ ...validPayload, baseSalary: -1000 });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] empty body -> 400", async () => {
      const res = await request(app).post("/api/employees").send({});
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] DB throws duplicate key error -> 409 DuplicateKey", async () => {
      (Employee.create as jest.Mock).mockRejectedValue({
        code: 11000,
        keyValue: { employeeCode: "EMP002" },
      });
      const res = await request(app).post("/api/employees").send(validPayload);
      expect(res.status).toBe(409);
      expect(res.body.error).toBe("DuplicateKey");
    });

    test("UTCID12 [A] missing required baseSalary -> 400", async () => {
      const { baseSalary, ...noSalary } = validPayload;
      const res = await request(app).post("/api/employees").send(noSalary);
      expect(res.status).toBe(400);
    });
  });
});

// =============================================================================
// GET /api/employees/:id — Function11
// =============================================================================
describe("GET /api/employees/:id", () => {

  const mockFindById = (data: object | null) =>
    (Employee.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(data),
    });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid existing id -> 200 with item", async () => {
      mockFindById(mockEmployee);
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("item");
    });

    test("UTCID02 [N] returned item has correct employeeCode", async () => {
      mockFindById(mockEmployee);
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.body.item.employeeCode).toBe("EMP001");
    });

    test("UTCID03 [N] returned item has correct fullName", async () => {
      mockFindById(mockEmployee);
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.body.item.fullName).toBe("Nguyen Van A");
    });

    test("UTCID04 [N] returned item has correct status", async () => {
      mockFindById(mockEmployee);
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.body.item.status).toBe("active");
    });

    test("UTCID05 [N] returned item has correct baseSalary", async () => {
      mockFindById(mockEmployee);
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.body.item.baseSalary).toBe(10_000_000);
    });

    test("UTCID06 [N] returned item has _id field", async () => {
      mockFindById(mockEmployee);
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.body.item).toHaveProperty("_id");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] non-existent id -> 404", async () => {
      mockFindById(null);
      const res = await request(app).get("/api/employees/000000000000000000000000");
      expect(res.status).toBe(404);
    });

    test("UTCID08 [B] id is all zeros (24 chars) -> 404", async () => {
      mockFindById(null);
      const res = await request(app).get("/api/employees/000000000000000000000000");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB throws error -> 500", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB error")),
      });
      const res = await request(app).get("/api/employees/invalid-id");
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] DB throws TypeError -> 500", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new TypeError("Cast error")),
      });
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(500);
    });

    test("UTCID11 [A] DB returns null (no record) -> 404 with error field", async () => {
      mockFindById(null);
      const res = await request(app).get(`/api/employees/${"b".repeat(24)}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    test("UTCID12 [A] DB throws RangeError -> 500", async () => {
      (Employee.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new RangeError("Invalid ObjectId")),
      });
      const res = await request(app).get(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// PATCH /api/employees/:id — Function12
// =============================================================================
describe("PATCH /api/employees/:id", () => {

  const mockUpdate = (data: object | null) =>
    (Employee.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(data),
    });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid update (fullName) -> 200 with updated item", async () => {
      const updated = { ...mockEmployee, fullName: "Nguyen Van B" };
      mockUpdate(updated);
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ fullName: "Nguyen Van B" });
      expect(res.status).toBe(200);
      expect(res.body.item.fullName).toBe("Nguyen Van B");
    });

    test("UTCID02 [N] update department -> 200", async () => {
      mockUpdate({ ...mockEmployee, department: "Finance" });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ department: "Finance" });
      expect(res.status).toBe(200);
    });

    test("UTCID03 [N] update baseSalary -> 200", async () => {
      mockUpdate({ ...mockEmployee, baseSalary: 12_000_000 });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ baseSalary: 12_000_000 });
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] update email -> 200", async () => {
      mockUpdate({ ...mockEmployee, email: "new@example.com" });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ email: "new@example.com" });
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] update position -> 200", async () => {
      mockUpdate({ ...mockEmployee, position: "Manager" });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ position: "Manager" });
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] update status to inactive -> 200", async () => {
      mockUpdate({ ...mockEmployee, status: "inactive" });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ status: "inactive" });
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] id not found -> 404", async () => {
      mockUpdate(null);
      const res = await request(app)
        .patch("/api/employees/000000000000000000000000")
        .send({ fullName: "X" });
      expect(res.status).toBe(404);
    });

    test("UTCID08 [B] update baseSalary to 0 (minimum) -> 200", async () => {
      mockUpdate({ ...mockEmployee, baseSalary: 0 });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ baseSalary: 0 });
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] invalid status value -> 400", async () => {
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ status: "fired" });
      expect(res.status).toBe(400);
    });

    test("UTCID10 [A] negative baseSalary -> 400", async () => {
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ baseSalary: -500 });
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] empty update body {} -> 200 (Zod partial accepts empty)", async () => {
      mockUpdate(mockEmployee);
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({});
      expect(res.status).toBe(200);
    });

    test("UTCID12 [A] DB throws error -> 500", async () => {
      (Employee.findByIdAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB fail")),
      });
      const res = await request(app)
        .patch(`/api/employees/${mockEmployee._id}`)
        .send({ fullName: "Test" });
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// DELETE /api/employees/:id — Function13
// =============================================================================
describe("DELETE /api/employees/:id", () => {

  const mockDel = (data: object | null) =>
    (Employee.findByIdAndDelete as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(data),
    });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] existing id -> 200 with ok: true", async () => {
      mockDel(mockEmployee);
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID02 [N] response body is exactly { ok: true }", async () => {
      mockDel(mockEmployee);
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.body).toEqual({ ok: true });
    });

    test("UTCID03 [N] employee with department deleted -> ok: true", async () => {
      mockDel({ ...mockEmployee, department: "Finance" });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID04 [N] inactive employee deleted -> ok: true", async () => {
      mockDel({ ...mockEmployee, status: "inactive" });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.body.ok).toBe(true);
    });

    test("UTCID05 [N] different valid ObjectId -> 200", async () => {
      const otherId = "aabbccddeeff001122334455";
      mockDel({ ...mockEmployee, _id: otherId });
      const res = await request(app).delete(`/api/employees/${otherId}`);
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] employee with phone field deleted -> ok: true", async () => {
      mockDel({ ...mockEmployee, phone: "0909999999" });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.body.ok).toBe(true);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] non-existent id -> 404 with error", async () => {
      mockDel(null);
      const res = await request(app).delete("/api/employees/000000000000000000000000");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    test("UTCID08 [B] second delete of same id -> 404 (already deleted)", async () => {
      mockDel(null);
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(404);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] DB throws error -> 500", async () => {
      (Employee.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("DB fail")),
      });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(500);
    });

    test("UTCID10 [A] DB throws TypeError -> 500", async () => {
      (Employee.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new TypeError("Cast error")),
      });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(500);
    });

    test("UTCID11 [A] DB throws RangeError -> 500", async () => {
      (Employee.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new RangeError("Out of range")),
      });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(500);
    });

    test("UTCID12 [A] DB throws network error -> 500", async () => {
      (Employee.findByIdAndDelete as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("ECONNRESET")),
      });
      const res = await request(app).delete(`/api/employees/${mockEmployee._id}`);
      expect(res.status).toBe(500);
    });
  });
});
