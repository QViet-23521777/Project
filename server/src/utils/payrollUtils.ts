/**
 * payrollUtils.ts — Payroll utility functions for HRM System
 * Extracted from: server/src/routes/payrolls.ts
 *
 * Lab 2 (Unit Test Case): Function5 — computeNetPay
 * Lab 3 (Automation Test): Covered by payrollUtils.test.ts
 */

/**
 * Computes the net salary for an employee.
 * Formula: Math.max(0, baseSalary + allowances - deductions)
 *
 * @param baseSalary - Base monthly salary (VND)
 * @param allowances - Total allowances (meal, transport, housing, …)
 * @param deductions - Total deductions (social insurance, tax, …)
 * @returns Net pay >= 0 (result is floored at 0 so salary is never negative)
 *
 * LOC (code lines): 7
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function5)
 */
export function computeNetPay(
  baseSalary: number,
  allowances: number,
  deductions: number
): number {
  return Math.max(0, baseSalary + allowances - deductions);
}
