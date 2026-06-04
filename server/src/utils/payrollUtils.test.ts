/**
 * payrollUtils.test.ts — Automation Tests for HRM Payroll Utility Functions
 * Lab 3: Automation Test with Jest + ts-jest (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Creator  : Nguyen Van A
 * Date     : 29/05/2026
 * Framework: Jest 29 + ts-jest
 *
 * Functions under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   Function14 : computeNetPay(baseSalary, allowances, deductions)
 * Test-case IDs UTCID01-UTCID12 correspond to the matrix in
 * Lab2_UnitTestCase_HRM_Final.xlsx (Function14 sheet).
 *
 * Run: npm test -- --testPathPatterns=payrollUtils --verbose
 */

import { computeNetPay } from "./payrollUtils";

// =============================================================================
// Function14 : computeNetPay(baseSalary, allowances, deductions)
// Formula    : Math.max(0, baseSalary + allowances - deductions)
// LOC        : 7  |  Lab-2 sheet : Function14
// =============================================================================
describe("computeNetPay(baseSalary, allowances, deductions)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] base=5,000,000 | allow=500,000 | deduct=200,000 -> 5,300,000", () => {
      expect(computeNetPay(5_000_000, 500_000, 200_000)).toBe(5_300_000);
    });

    test("UTCID02 [N] base=10,000,000 | allow=1,000,000 | deduct=500,000 -> 10,500,000", () => {
      expect(computeNetPay(10_000_000, 1_000_000, 500_000)).toBe(10_500_000);
    });

    test("UTCID03 [N] base=8,000,000 | allow=0 | deduct=0 -> 8,000,000", () => {
      expect(computeNetPay(8_000_000, 0, 0)).toBe(8_000_000);
    });

    test("UTCID04 [N] base=3,000,000 | allow=500,000 | deduct=1,000,000 -> 2,500,000", () => {
      expect(computeNetPay(3_000_000, 500_000, 1_000_000)).toBe(2_500_000);
    });

    test("UTCID05 [N] base=5,000,000 | allow=2,000,000 | deduct=1,500,000 -> 5,500,000", () => {
      expect(computeNetPay(5_000_000, 2_000_000, 1_500_000)).toBe(5_500_000);
    });

    test("UTCID09 [N] base=0 | allow=500,000 | deduct=0 -> 500,000 (allowance only)", () => {
      expect(computeNetPay(0, 500_000, 0)).toBe(500_000);
    });

    test("UTCID12 [N] base=3,000,000 | allow=0 | deduct=0 -> 3,000,000", () => {
      expect(computeNetPay(3_000_000, 0, 0)).toBe(3_000_000);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] base=0 | allow=0 | deduct=0 -> 0 (all-zero minimum)", () => {
      expect(computeNetPay(0, 0, 0)).toBe(0);
    });

    test("UTCID10 [B] base=5,000,000 | allow=0 | deduct=5,000,000 -> 0 (deductions == base, exact boundary)", () => {
      expect(computeNetPay(5_000_000, 0, 5_000_000)).toBe(0);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID07 [A] base=1,000,000 | allow=0 | deduct=2,000,000 -> 0 (deductions > base)", () => {
      expect(computeNetPay(1_000_000, 0, 2_000_000)).toBe(0);
    });

    test("UTCID08 [A] base=5,000,000 | allow=0 | deduct=6,000,000 -> 0 (large excess deduction)", () => {
      expect(computeNetPay(5_000_000, 0, 6_000_000)).toBe(0);
    });

    test("UTCID11 [A] base=0 | allow=0 | deduct=1,000,000 -> 0 (deduction on zero salary)", () => {
      expect(computeNetPay(0, 0, 1_000_000)).toBe(0);
    });
  });
});
