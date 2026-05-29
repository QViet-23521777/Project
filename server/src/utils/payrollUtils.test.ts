/**
 * payrollUtils.test.ts — Automation Tests for HRM Payroll Utility Functions
 * Lab 3: Automation Test with Jest (TypeScript)
 *
 * Project: Human Resource Management System (HRM-SE113)
 * Functions tested:
 *   - computeNetPay(baseSalary, allowances, deductions)
 *   - isValidPayrollMonth(monthStr)
 *
 * Test IDs match Lab 2 Unit Test Case matrix (UTCID01–UTCID12 per function).
 *
 * Run: npm test -- --testPathPattern=payrollUtils
 * Framework: Jest 29 + ts-jest
 */

import { computeNetPay, isValidPayrollMonth } from "./payrollUtils";

// ─────────────────────────────────────────────────────────────────────────────
// computeNetPay — 12 Test Cases (Lab 2 matrix)
// Formula: Math.max(0, baseSalary + allowances - deductions)
// ─────────────────────────────────────────────────────────────────────────────
describe("computeNetPay(baseSalary, allowances, deductions)", () => {

  // ── Normal cases (N) ────────────────────────────────────────────────────────
  describe("Normal cases (N) — typical salary inputs", () => {
    test("UTCID01: base=5,000,000 allow=500,000 deduct=200,000 → 5,300,000", () => {
      expect(computeNetPay(5_000_000, 500_000, 200_000)).toBe(5_300_000);
    });

    test("UTCID02: base=10,000,000 allow=1,000,000 deduct=500,000 → 10,500,000", () => {
      expect(computeNetPay(10_000_000, 1_000_000, 500_000)).toBe(10_500_000);
    });

    test("UTCID03: base=8,000,000 allow=0 deduct=0 → 8,000,000", () => {
      expect(computeNetPay(8_000_000, 0, 0)).toBe(8_000_000);
    });

    test("UTCID04: base=3,000,000 allow=500,000 deduct=1,000,000 → 2,500,000", () => {
      expect(computeNetPay(3_000_000, 500_000, 1_000_000)).toBe(2_500_000);
    });

    test("UTCID05: base=5,000,000 allow=2,000,000 deduct=1,500,000 → 5,500,000", () => {
      expect(computeNetPay(5_000_000, 2_000_000, 1_500_000)).toBe(5_500_000);
    });

    test("UTCID09: base=0 allow=500,000 deduct=0 → 500,000 (allowance only)", () => {
      expect(computeNetPay(0, 500_000, 0)).toBe(500_000);
    });

    test("UTCID12: base=3,000,000 allow=0 deduct=0 → 3,000,000", () => {
      expect(computeNetPay(3_000_000, 0, 0)).toBe(3_000_000);
    });
  });

  // ── Boundary cases (B) ──────────────────────────────────────────────────────
  describe("Boundary cases (B) — edge values at the boundary of valid range", () => {
    test("UTCID06: base=0 allow=0 deduct=0 → 0 (minimum all-zero input)", () => {
      expect(computeNetPay(0, 0, 0)).toBe(0);
    });

    test("UTCID10: base=5,000,000 allow=0 deduct=5,000,000 → 0 (deductions == base)", () => {
      // Exactly at the boundary: base - deductions = 0
      expect(computeNetPay(5_000_000, 0, 5_000_000)).toBe(0);
    });
  });

  // ── Abnormal cases (A) ──────────────────────────────────────────────────────
  describe("Abnormal cases (A) — deductions exceed salary, result clipped to 0", () => {
    test("UTCID07: base=1,000,000 allow=0 deduct=2,000,000 → 0 (deductions > base)", () => {
      expect(computeNetPay(1_000_000, 0, 2_000_000)).toBe(0);
    });

    test("UTCID08: base=5,000,000 allow=0 deduct=6,000,000 → 0 (large deduction excess)", () => {
      expect(computeNetPay(5_000_000, 0, 6_000_000)).toBe(0);
    });

    test("UTCID11: base=0 allow=0 deduct=1,000,000 → 0 (pure deduction on zero salary)", () => {
      expect(computeNetPay(0, 0, 1_000_000)).toBe(0);
    });
  });

  // ── Additional integrity checks ─────────────────────────────────────────────
  describe("Additional edge cases", () => {
    test("Result is never negative (Math.max floor)", () => {
      expect(computeNetPay(100, 0, 99999)).toBeGreaterThanOrEqual(0);
    });
    test("Large salary values", () => {
      expect(computeNetPay(100_000_000, 10_000_000, 5_000_000)).toBe(105_000_000);
    });
    test("Allow and deduct cancel each other", () => {
      expect(computeNetPay(5_000_000, 1_000_000, 1_000_000)).toBe(5_000_000);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValidPayrollMonth — 12 Test Cases (Lab 2 matrix)
// ─────────────────────────────────────────────────────────────────────────────
describe("isValidPayrollMonth(monthStr)", () => {

  // ── Normal cases (N) ────────────────────────────────────────────────────────
  describe("Normal cases (N) — valid YYYY-MM strings", () => {
    test("UTCID01: '2026-05' → true (standard valid month)", () => {
      expect(isValidPayrollMonth("2026-05")).toBe(true);
    });

    test("UTCID02: '2026-01' → true (January)", () => {
      expect(isValidPayrollMonth("2026-01")).toBe(true);
    });

    test("UTCID03: '2026-12' → true (December)", () => {
      expect(isValidPayrollMonth("2026-12")).toBe(true);
    });

    test("UTCID04: '2000-02' → true (century leap year Feb)", () => {
      expect(isValidPayrollMonth("2000-02")).toBe(true);
    });

    test("UTCID05: '1999-06' → true (historical year)", () => {
      expect(isValidPayrollMonth("1999-06")).toBe(true);
    });
  });

  // ── Abnormal cases (A) ──────────────────────────────────────────────────────
  describe("Abnormal cases (A) — invalid format or out-of-range value", () => {
    test("UTCID06: '2026-13' → false (month 13 does not exist)", () => {
      expect(isValidPayrollMonth("2026-13")).toBe(false);
    });

    test("UTCID07: '2026-00' → false (month 00 is invalid)", () => {
      expect(isValidPayrollMonth("2026-00")).toBe(false);
    });

    test("UTCID08: '2026-5' → false (single-digit month, not YYYY-MM)", () => {
      expect(isValidPayrollMonth("2026-5")).toBe(false);
    });

    test("UTCID09: '2026-05-01' → false (YYYY-MM-DD format rejected)", () => {
      expect(isValidPayrollMonth("2026-05-01")).toBe(false);
    });

    test("UTCID10: '' → false (empty string)", () => {
      expect(isValidPayrollMonth("")).toBe(false);
    });

    test("UTCID11: 'abcd-ef' → false (non-numeric)", () => {
      expect(isValidPayrollMonth("abcd-ef")).toBe(false);
    });
  });

  // ── Boundary cases (B) ──────────────────────────────────────────────────────
  describe("Boundary cases (B) — edge valid/invalid values", () => {
    test("UTCID12: '0000-01' → false (year = 0 is invalid)", () => {
      expect(isValidPayrollMonth("0000-01")).toBe(false);
    });
  });

  // ── Additional checks ───────────────────────────────────────────────────────
  describe("Additional edge cases", () => {
    test("'9999-12' → true (maximum year December)", () => {
      expect(isValidPayrollMonth("9999-12")).toBe(true);
    });
    test("'0001-01' → true (minimum valid year)", () => {
      expect(isValidPayrollMonth("0001-01")).toBe(true);
    });
    test("'2026-1' → false (no leading zero)", () => {
      expect(isValidPayrollMonth("2026-1")).toBe(false);
    });
    test("'202-05' → false (3-digit year)", () => {
      expect(isValidPayrollMonth("202-05")).toBe(false);
    });
  });
});
