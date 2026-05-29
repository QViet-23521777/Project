/**
 * payrollUtils.ts — Payroll utility functions for HRM System
 * Lab 3: Automation Test with Jest (TypeScript)
 *
 * Functions under test:
 *  - computeNetPay(baseSalary, allowances, deductions)
 *  - isValidPayrollMonth(monthStr)
 *
 * Source: D:\SE113\Project\Project\server\src\routes\payrolls.ts
 */

/**
 * Computes the net salary for an employee.
 *
 * Formula: Math.max(0, baseSalary + allowances - deductions)
 * If the result would be negative, returns 0 (salary floor).
 *
 * @param baseSalary  - Base monthly salary (must be >= 0)
 * @param allowances  - Total allowances (meal, transport, etc.)
 * @param deductions  - Total deductions (insurance, tax, etc.)
 * @returns Net pay amount (>= 0)
 *
 * Test cases (Lab 2 — computeNetPay matrix):
 *   UTCID01: (5000000, 500000, 200000)   → 5300000   [Normal]
 *   UTCID02: (10000000, 1000000, 500000) → 10500000  [Normal]
 *   UTCID03: (8000000, 0, 0)             → 8000000   [Normal]
 *   UTCID04: (3000000, 500000, 1000000)  → 2500000   [Normal]
 *   UTCID05: (5000000, 2000000, 1500000) → 5500000   [Normal]
 *   UTCID06: (0, 0, 0)                   → 0         [Boundary]
 *   UTCID07: (1000000, 0, 2000000)       → 0         [Abnormal]
 *   UTCID08: (5000000, 0, 6000000)       → 0         [Abnormal]
 *   UTCID09: (0, 500000, 0)             → 500000    [Normal]
 *   UTCID10: (5000000, 0, 5000000)       → 0         [Boundary]
 *   UTCID11: (0, 0, 1000000)             → 0         [Abnormal]
 *   UTCID12: (3000000, 0, 0)             → 3000000   [Normal]
 */
export function computeNetPay(
  baseSalary: number,
  allowances: number,
  deductions: number
): number {
  return Math.max(0, baseSalary + allowances - deductions);
}

/**
 * Validates a payroll month string in YYYY-MM format.
 *
 * Rules:
 *  1. Must match regex /^\d{4}-\d{2}$/
 *  2. Year must be > 0
 *  3. Month must be 01–12
 *
 * @param monthStr - e.g. "2026-05"
 * @returns true if valid, false otherwise
 *
 * Test cases (Lab 2 — isValidPayrollMonth matrix):
 *   UTCID01: "2026-05"    → true   [Normal]
 *   UTCID02: "2026-01"    → true   [Normal]
 *   UTCID03: "2026-12"    → true   [Normal]
 *   UTCID04: "2000-02"    → true   [Normal]
 *   UTCID05: "1999-06"    → true   [Normal]
 *   UTCID06: "2026-13"    → false  [Abnormal]
 *   UTCID07: "2026-00"    → false  [Abnormal]
 *   UTCID08: "2026-5"     → false  [Abnormal]
 *   UTCID09: "2026-05-01" → false  [Abnormal]
 *   UTCID10: ""           → false  [Abnormal]
 *   UTCID11: "abcd-ef"    → false  [Abnormal]
 *   UTCID12: "0000-01"    → false  [Boundary]
 */
export function isValidPayrollMonth(monthStr: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) return false;
  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);
  return year > 0 && month >= 1 && month <= 12;
}
