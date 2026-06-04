/**
 * reportUtils.ts — Report helper utility functions for HRM System
 * Extracted from: server/src/routes/reports.ts
 *
 * Lab 2 (Unit Test Case): Function6 — quarterToMonths, Function7 — yearToMonths
 * Lab 3 (Automation Test): Covered by reportUtils.test.ts
 */

/**
 * Converts a quarter string (e.g. "2026-Q2") into an array of 3 YYYY-MM month strings.
 *
 * @param quarter - Quarter string in format "YYYY-Q[1-4]"
 * @returns Array of 3 month strings, or null if format is invalid
 *
 * Examples:
 *   quarterToMonths("2026-Q1") -> ["2026-01", "2026-02", "2026-03"]
 *   quarterToMonths("2026-Q4") -> ["2026-10", "2026-11", "2026-12"]
 *   quarterToMonths("2026-Q5") -> null
 *   quarterToMonths("")        -> null
 *
 * LOC (code lines): 7
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function6)
 */
export function quarterToMonths(quarter: string): string[] | null {
  const match = /^([0-9]{4})-Q([1-4])$/.exec(quarter);
  if (!match) return null;
  const year = match[1];
  const quarterNumber = Number(match[2]);
  const startMonth = (quarterNumber - 1) * 3 + 1;
  return [0, 1, 2].map((offset) => `${year}-${String(startMonth + offset).padStart(2, "0")}`);
}

/**
 * Generates an array of 12 YYYY-MM month strings for a given year.
 * No validation is performed on the year string.
 *
 * @param year - Year string (e.g. "2026")
 * @returns Array of 12 month strings from "YYYY-01" to "YYYY-12"
 *
 * Examples:
 *   yearToMonths("2026") -> ["2026-01", "2026-02", ..., "2026-12"]
 *
 * LOC (code lines): 3
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function7)
 */
export function yearToMonths(year: string): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}
