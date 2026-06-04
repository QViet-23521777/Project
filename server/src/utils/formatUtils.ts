/**
 * formatUtils.ts — Display formatting utility functions for HRM System
 * Mirrored from: client/src/mvp/format.ts (for server-side unit testing)
 *
 * Lab 2 (Unit Test Case): Function8 — formatMoneyVnd,
 *                          Function9 — formatDateIso,
 *                          Function10 — toInputDate
 * Lab 3 (Automation Test): Covered by formatUtils.test.ts
 */

/**
 * Formats a number as Vietnamese Dong currency string.
 * Uses Intl.NumberFormat with "vi-VN" locale.
 *
 * @param amount - Numeric amount (VND)
 * @returns Formatted string, e.g. "5.300.000 d" (with dong symbol)
 *
 * LOC (code lines): 3
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function8)
 */
export function formatMoneyVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an ISO date string as a Vietnamese date string (DD/MM/YYYY).
 * Returns empty string if value is falsy; returns original value if parsing fails.
 *
 * @param value - ISO date string (e.g. "2024-06-15") or undefined
 * @returns Formatted string (e.g. "15/06/2024"), "" if empty, original if invalid
 *
 * LOC (code lines): 5
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function9)
 */
export function formatDateIso(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Converts a date string to YYYY-MM-DD format for HTML date input fields.
 * Returns empty string if value is falsy or cannot be parsed as a valid date.
 *
 * @param value - Date string in any parseable format
 * @returns Date in "YYYY-MM-DD" format, or "" if invalid/empty
 *
 * LOC (code lines): 8
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function10)
 */
export function toInputDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
