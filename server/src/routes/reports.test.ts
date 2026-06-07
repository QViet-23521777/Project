/**
 * reports.test.ts — Automation Tests for HRM Report Routes
 * Lab 3: Automation Test with Jest + Supertest + jest.mock (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Framework: Jest + Supertest
 *
 * Endpoints under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   GET /api/reports/payroll-summary         — Function22 (UTCID01-12)
 *   GET /api/reports/headcount-by-department — Function23 (UTCID01-12)
 *   GET /api/reports/cost-by-department      — Function24 (UTCID01-12)
 *   GET /api/reports/export                  — Function25 (UTCID01-12)
 *   GET /api/reports/export-excel            — Function26 (UTCID01-12)
 *
 * Run: npm test -- --testPathPattern=routes/reports --verbose
 */

import request from "supertest";
import { createApp } from "../app";

jest.mock("../models/Payroll");
jest.mock("../models/Employee");
jest.mock("xlsx", () => ({
  utils: {
    book_new:       jest.fn(() => ({})),
    aoa_to_sheet:   jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(() => Buffer.from("mock-excel-content")),
}));

import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";

const app = createApp();

// =============================================================================
// GET /api/reports/payroll-summary
// =============================================================================
describe("GET /api/reports/payroll-summary", () => {

  const mockSummary = {
    _id: "2026-05",
    count: 10,
    totalBaseSalary: 100_000_000,
    totalAllowances: 5_000_000,
    totalDeductions: 2_000_000,
    totalNetPay: 103_000_000,
  };

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid month=2026-05 with data -> 200 with summary", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-05");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("summary");
      expect(res.body.month).toBe("2026-05");
    });

    test("UTCID02 [N] summary contains count field", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-05");
      expect(res.body.summary.count).toBe(10);
    });

    test("UTCID03 [N] summary contains totalNetPay field", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-05");
      expect(res.body.summary.totalNetPay).toBe(103_000_000);
    });

    test("UTCID04 [N] summary contains totalBaseSalary, totalAllowances, totalDeductions", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-05");
      expect(res.body.summary).toHaveProperty("totalBaseSalary");
      expect(res.body.summary).toHaveProperty("totalAllowances");
      expect(res.body.summary).toHaveProperty("totalDeductions");
    });

    test("UTCID05 [N] no payrolls for month -> 200 with summary = null", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-01");
      expect(res.status).toBe(200);
      expect(res.body.summary).toBeNull();
    });

    test("UTCID06 [N] first month of year (2026-01) -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([{ ...mockSummary, _id: "2026-01" }]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-01");
      expect(res.status).toBe(200);
    });

    test("UTCID07 [N] last month of year (2026-12) -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([{ ...mockSummary, _id: "2026-12" }]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-12");
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID08 [B] month format is exactly 7 chars 'YYYY-MM' -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-06");
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] missing month param -> 400 InvalidMonth", async () => {
      const res = await request(app).get("/api/reports/payroll-summary");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidMonth");
    });

    test("UTCID10 [A] month=2026-5 (single digit) -> 400 InvalidMonth", async () => {
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-5");
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] month=2026-13 (month 13 passes regex, route accepts) -> 200 with null summary", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/payroll-summary?month=2026-13");
      expect(res.status).toBe(200);
      expect(res.body.summary).toBeNull();
    });

    test("UTCID12 [A] month='invalid' -> 400 InvalidMonth", async () => {
      const res = await request(app).get("/api/reports/payroll-summary?month=invalid");
      expect(res.status).toBe(400);
    });
  });
});

// =============================================================================
// GET /api/reports/headcount-by-department
// =============================================================================
describe("GET /api/reports/headcount-by-department", () => {

  const mockRows = [
    { _id: "IT", count: 5 },
    { _id: "HR", count: 3 },
    { _id: "Finance", count: 2 },
  ];

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] no filter -> 200 with items array (all active employees)", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockRows);
      const res = await request(app).get("/api/reports/headcount-by-department");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    test("UTCID02 [N] no filter items have department and count fields", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockRows);
      const res = await request(app).get("/api/reports/headcount-by-department");
      expect(res.body.items[0]).toHaveProperty("department");
      expect(res.body.items[0]).toHaveProperty("count");
    });

    test("UTCID03 [N] filter by month=2026-05 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockRows);
      const res = await request(app).get("/api/reports/headcount-by-department?month=2026-05");
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] filter by quarter=2026-Q1 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockRows);
      const res = await request(app).get("/api/reports/headcount-by-department?quarter=2026-Q1");
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] filter by year=2026 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockRows);
      const res = await request(app).get("/api/reports/headcount-by-department?year=2026");
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] department with null _id mapped to 'Unassigned'", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue([{ _id: null, count: 1 }]);
      const res = await request(app).get("/api/reports/headcount-by-department");
      expect(res.body.items[0].department).toBe("Unassigned");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] quarter=2026-Q4 (last quarter) -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/headcount-by-department?quarter=2026-Q4");
      expect(res.status).toBe(200);
    });

    test("UTCID08 [B] empty result -> 200 with empty items array", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/headcount-by-department");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] invalid quarter=2026-Q5 -> 400 InvalidQuarter", async () => {
      const res = await request(app).get("/api/reports/headcount-by-department?quarter=2026-Q5");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidQuarter");
    });

    test("UTCID10 [A] invalid year=abcd -> 400 InvalidYear", async () => {
      const res = await request(app).get("/api/reports/headcount-by-department?year=abcd");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidYear");
    });

    test("UTCID11 [A] month=2026-13 (passes regex, route accepts) -> 200 with empty items", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/headcount-by-department?month=2026-13");
      expect(res.status).toBe(200);
    });

    test("UTCID12 [A] DB error -> 500", async () => {
      (Employee.aggregate as jest.Mock).mockRejectedValue(new Error("DB fail"));
      const res = await request(app).get("/api/reports/headcount-by-department");
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// GET /api/reports/cost-by-department
// =============================================================================
describe("GET /api/reports/cost-by-department", () => {

  const mockCostRows = [
    { _id: "IT", totalNetPay: 50_000_000, count: 5 },
    { _id: "HR", totalNetPay: 24_000_000, count: 3 },
  ];

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] no filter -> 200 with items array", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockCostRows);
      const res = await request(app).get("/api/reports/cost-by-department");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("items");
    });

    test("UTCID02 [N] items have department, totalNetPay, count", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockCostRows);
      const res = await request(app).get("/api/reports/cost-by-department");
      const item = res.body.items[0];
      expect(item).toHaveProperty("department");
      expect(item).toHaveProperty("totalNetPay");
      expect(item).toHaveProperty("count");
    });

    test("UTCID03 [N] filter by month=2026-05 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockCostRows);
      const res = await request(app).get("/api/reports/cost-by-department?month=2026-05");
      expect(res.status).toBe(200);
    });

    test("UTCID04 [N] filter by quarter=2026-Q2 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockCostRows);
      const res = await request(app).get("/api/reports/cost-by-department?quarter=2026-Q2");
      expect(res.status).toBe(200);
    });

    test("UTCID05 [N] filter by year=2026 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockCostRows);
      const res = await request(app).get("/api/reports/cost-by-department?year=2026");
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] null department mapped to 'Unassigned'", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue([{ _id: null, totalNetPay: 5_000_000, count: 1 }]);
      const res = await request(app).get("/api/reports/cost-by-department");
      expect(res.body.items[0].department).toBe("Unassigned");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] empty result -> 200 with empty items array", async () => {
      (Employee.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/cost-by-department");
      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    test("UTCID08 [B] quarter=2026-Q1 (first quarter) -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue(mockCostRows);
      const res = await request(app).get("/api/reports/cost-by-department?quarter=2026-Q1");
      expect(res.status).toBe(200);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] invalid quarter=2026-Q0 -> 400 InvalidQuarter", async () => {
      const res = await request(app).get("/api/reports/cost-by-department?quarter=2026-Q0");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidQuarter");
    });

    test("UTCID10 [A] invalid year format -> 400 InvalidYear", async () => {
      const res = await request(app).get("/api/reports/cost-by-department?year=20ab");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidYear");
    });

    test("UTCID11 [A] month=2026-00 (passes regex, route accepts) -> 200 with empty items", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/cost-by-department?month=2026-00");
      expect(res.status).toBe(200);
    });

    test("UTCID12 [A] DB error -> 500", async () => {
      (Employee.aggregate as jest.Mock).mockRejectedValue(new Error("DB fail"));
      const res = await request(app).get("/api/reports/cost-by-department");
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// GET /api/reports/export  — CSV export
// =============================================================================
describe("GET /api/reports/export", () => {

  const mockSummary = {
    _id: "2026-05", count: 5,
    totalBaseSalary: 50_000_000, totalAllowances: 2_500_000,
    totalDeductions: 1_000_000, totalNetPay: 51_500_000,
  };
  const mockDeptRows = [{ _id: "IT", count: 3 }, { _id: "HR", count: 2 }];

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid month=2026-05 -> 200 with text/csv Content-Type", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
      const res = await request(app).get("/api/reports/export?month=2026-05");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/csv/);
    });

    test("UTCID02 [N] response has Content-Disposition attachment header", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
      const res = await request(app).get("/api/reports/export?month=2026-05");
      expect(res.headers["content-disposition"]).toMatch(/attachment/);
    });

    test("UTCID03 [N] filename contains the month", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
      const res = await request(app).get("/api/reports/export?month=2026-05");
      expect(res.headers["content-disposition"]).toContain("2026-05");
    });

    test("UTCID04 [N] response body is non-empty string (CSV content)", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
      const res = await request(app).get("/api/reports/export?month=2026-05");
      expect(res.text.length).toBeGreaterThan(0);
    });

    test("UTCID05 [N] with ?quarter=2026-Q1 -> 200 and filename contains month and quarter", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
      const res = await request(app).get("/api/reports/export?month=2026-05&quarter=2026-Q1");
      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toContain("2026-Q1");
    });

    test("UTCID06 [N] with ?filterMonth=2026-03 -> 200", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([mockSummary]);
      (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
      const res = await request(app)
        .get("/api/reports/export?month=2026-05&filterMonth=2026-03");
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] no payrolls for month -> 200 with CSV (summary row all zeros)", async () => {
      (Payroll.aggregate as jest.Mock).mockResolvedValue([]);
      (Employee.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/export?month=2026-01");
      expect(res.status).toBe(200);
    });

    test("UTCID08 [B] filterMonth invalid format -> 400 InvalidMonth", async () => {
      const res = await request(app)
        .get("/api/reports/export?month=2026-05&filterMonth=invalid");
      expect(res.status).toBe(400);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] missing month param -> 400 InvalidMonth", async () => {
      const res = await request(app).get("/api/reports/export");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidMonth");
    });

    test("UTCID10 [A] month=2026-5 (single-digit) -> 400", async () => {
      const res = await request(app).get("/api/reports/export?month=2026-5");
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] invalid quarter=2026-Q5 -> 400 InvalidQuarter", async () => {
      const res = await request(app)
        .get("/api/reports/export?month=2026-05&quarter=2026-Q5");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidQuarter");
    });

    test("UTCID12 [A] DB error -> 500", async () => {
      (Payroll.aggregate as jest.Mock).mockRejectedValue(new Error("DB fail"));
      const res = await request(app).get("/api/reports/export?month=2026-05");
      expect(res.status).toBe(500);
    });
  });
});

// =============================================================================
// GET /api/reports/export-excel  — XLSX export
// =============================================================================
describe("GET /api/reports/export-excel", () => {

  const mockSummary = {
    _id: "2026-05", count: 5,
    totalBaseSalary: 50_000_000, totalAllowances: 2_500_000,
    totalDeductions: 1_000_000, totalNetPay: 51_500_000,
  };
  const mockDeptRows = [{ _id: "IT", count: 3 }, { _id: "HR", count: 2 }];
  const mockCostRows = [{ _id: "IT", totalNetPay: 30_000_000, count: 3 }];

  beforeEach(() => {
    (Payroll.aggregate as jest.Mock).mockReset();
    (Employee.aggregate as jest.Mock).mockReset();
    // Default: 3 successive Payroll.aggregate calls (summary, headcount, cost)
    (Payroll.aggregate as jest.Mock)
      .mockResolvedValueOnce([mockSummary])
      .mockResolvedValueOnce(mockDeptRows)
      .mockResolvedValueOnce(mockCostRows);
    (Employee.aggregate as jest.Mock).mockResolvedValue(mockDeptRows);
  });

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] valid month=2026-05 -> 200 with xlsx Content-Type", async () => {
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([mockSummary])
        .mockResolvedValueOnce(mockDeptRows)
        .mockResolvedValueOnce(mockCostRows);
      const res = await request(app).get("/api/reports/export-excel?month=2026-05");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/spreadsheetml/);
    });

    test("UTCID02 [N] response has Content-Disposition attachment header", async () => {
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([mockSummary])
        .mockResolvedValueOnce(mockDeptRows)
        .mockResolvedValueOnce(mockCostRows);
      const res = await request(app).get("/api/reports/export-excel?month=2026-05");
      expect(res.headers["content-disposition"]).toMatch(/attachment/);
    });

    test("UTCID03 [N] filename contains month and ends with .xlsx", async () => {
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([mockSummary])
        .mockResolvedValueOnce(mockDeptRows)
        .mockResolvedValueOnce(mockCostRows);
      const res = await request(app).get("/api/reports/export-excel?month=2026-05");
      expect(res.headers["content-disposition"]).toContain(".xlsx");
      expect(res.headers["content-disposition"]).toContain("2026-05");
    });

    test("UTCID04 [N] with ?quarter=2026-Q1 -> 200, filename contains quarter", async () => {
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([mockSummary])
        .mockResolvedValueOnce(mockDeptRows)
        .mockResolvedValueOnce(mockCostRows);
      const res = await request(app)
        .get("/api/reports/export-excel?month=2026-05&quarter=2026-Q1");
      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toContain("2026-Q1");
    });

    test("UTCID05 [N] with ?year=2026 -> 200 with xlsx filename containing year label", async () => {
      // DEF-UNIT-016 / DEF-SYS-012: filterLabel = `Năm ${year}` contains non-ASCII 'ă'
      // which is illegal in HTTP Content-Disposition header value.
      // Expected: 200 with valid Content-Disposition.
      // Actual:   500 — this test FAILS until the bug is fixed.
      (Payroll.aggregate as jest.Mock).mockReset();
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([mockSummary])
        .mockResolvedValueOnce(mockDeptRows)
        .mockResolvedValueOnce(mockCostRows);
      const res = await request(app)
        .get("/api/reports/export-excel?month=2026-05&year=2026");
      expect(res.status).toBe(200);
    });

    test("UTCID06 [N] no payrolls -> 200 (summary count=0)", async () => {
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      (Employee.aggregate as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/reports/export-excel?month=2026-01");
      expect(res.status).toBe(200);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] month=2026-01 (first month of year) -> 200", async () => {
      (Payroll.aggregate as jest.Mock)
        .mockResolvedValueOnce([mockSummary])
        .mockResolvedValueOnce(mockDeptRows)
        .mockResolvedValueOnce(mockCostRows);
      const res = await request(app).get("/api/reports/export-excel?month=2026-01");
      expect(res.status).toBe(200);
    });

    test("UTCID08 [B] invalid quarter=2026-Q5 -> 400 InvalidQuarter", async () => {
      const res = await request(app)
        .get("/api/reports/export-excel?month=2026-05&quarter=2026-Q5");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidQuarter");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] missing month param -> 400 InvalidMonth", async () => {
      const res = await request(app).get("/api/reports/export-excel");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidMonth");
    });

    test("UTCID10 [A] month=2026-5 (single-digit) -> 400", async () => {
      const res = await request(app).get("/api/reports/export-excel?month=2026-5");
      expect(res.status).toBe(400);
    });

    test("UTCID11 [A] invalid year=20ab -> 400 InvalidYear", async () => {
      const res = await request(app)
        .get("/api/reports/export-excel?month=2026-05&year=20ab");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("InvalidYear");
    });

    test("UTCID12 [A] DB error -> 500", async () => {
      (Payroll.aggregate as jest.Mock).mockReset();
      (Payroll.aggregate as jest.Mock).mockRejectedValue(new Error("DB fail"));
      const res = await request(app).get("/api/reports/export-excel?month=2026-05");
      expect(res.status).toBe(500);
    });
  });
});
