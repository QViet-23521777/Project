/**
 * dateUtils.ts — Date utility functions for HRM System
 * Lab 2/3: Unit Test functions (dayInMonth, checkDate)
 *
 * These utilities support:
 *  - Payroll month validation (YYYY-MM format)
 *  - Contract date validation (startDate < endDate)
 *  - General calendar date checking
 */

/**
 * Returns the number of days in the specified month of the given year.
 * @param month - Month number (1 = January ... 12 = December)
 * @param year  - Full year (e.g. 2024). Must be > 0.
 * @returns Number of days (28, 29, 30, or 31), or -1 if input is invalid.
 *
 * Leap year rule:
 *   A year is a leap year if (year % 4 === 0 AND year % 100 !== 0) OR (year % 400 === 0)
 *
 * Test cases (Lab 2 — DayInMonth sheet):
 *   UTCID01: dayInMonth(2, 2024)  → 29  (leap year Feb)
 *   UTCID02: dayInMonth(2, 2023)  → 28  (non-leap Feb)
 *   UTCID03: dayInMonth(1, 2024)  → 31  (January)
 *   UTCID04: dayInMonth(4, 2023)  → 30  (April)
 *   UTCID05: dayInMonth(2, 2000)  → 29  (century leap year)
 *   UTCID06: dayInMonth(2, 1900)  → 28  (century non-leap year)
 *   UTCID07: dayInMonth(12, 2023) → 31  (December)
 *   UTCID08: dayInMonth(0, 2024)  → -1  (invalid month = 0)
 *   UTCID09: dayInMonth(13, 2024) → -1  (invalid month = 13)
 *   UTCID10: dayInMonth(2, 0)     → -1  (invalid year = 0)
 *   UTCID11: dayInMonth(2, -1)    → -1  (invalid year = -1)
 *   UTCID12: dayInMonth(11, 2024) → 30  (November)
 */
export function dayInMonth(month: number, year: number): number {
  // Validate inputs
  if (!Number.isInteger(month) || !Number.isInteger(year)) return -1;
  if (month < 1 || month > 12) return -1;
  if (year <= 0) return -1;

  // February — check leap year
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }

  // Months with 31 days: Jan(1), Mar(3), May(5), Jul(7), Aug(8), Oct(10), Dec(12)
  const days31 = [1, 3, 5, 7, 8, 10, 12];
  if (days31.includes(month)) return 31;

  // Remaining months (4,6,9,11) have 30 days
  return 30;
}

/**
 * Checks whether a given day/month/year represents a valid calendar date.
 * @param day   - Day of month (1-based)
 * @param month - Month number (1 = January ... 12 = December)
 * @param year  - Full year (> 0)
 * @returns true if the date is valid, false otherwise.
 *
 * Test cases (Lab 2 — CheckDate sheet):
 *   UTCID01: checkDate(15, 6, 2024)  → true  (normal valid)
 *   UTCID02: checkDate(1, 1, 2024)   → true  (first day of year)
 *   UTCID03: checkDate(31, 12, 2023) → true  (last day of year)
 *   UTCID04: checkDate(29, 2, 2024)  → true  (leap Feb 29)
 *   UTCID05: checkDate(28, 2, 2023)  → true  (non-leap Feb 28)
 *   UTCID06: checkDate(29, 2, 2023)  → false (non-leap Feb 29 invalid)
 *   UTCID07: checkDate(30, 4, 2024)  → false (April only has 30 days, day=30 is valid)
 *   UTCID08: checkDate(0, 1, 2024)   → false (day = 0 invalid)
 *   UTCID09: checkDate(32, 1, 2024)  → false (day = 32 invalid)
 *   UTCID10: checkDate(5, 0, 2024)   → false (month = 0 invalid)
 *   UTCID11: checkDate(5, 13, 2024)  → false (month = 13 invalid)
 *   UTCID12: checkDate(5, 7, 9999)   → true  (boundary max year)
 *
 * Note: UTCID07 is actually true (April 30 is valid — 30 == 30).
 * The Lab2 matrix marks it as false because the test was originally
 * checking checkDate(31, 4, 2024) which is invalid.
 */
export function checkDate(day: number, month: number, year: number): boolean {
  // Validate day is a positive integer
  if (!Number.isInteger(day) || day < 1) return false;

  // Get days in this month (also validates month and year)
  const maxDays = dayInMonth(month, year);
  if (maxDays === -1) return false;  // invalid month or year

  // Check day does not exceed max days in month
  return day <= maxDays;
}

/**
 * Validates a payroll month string in YYYY-MM format.
 * @param monthStr - e.g. "2026-05"
 * @returns true if format is valid AND month value is 01-12
 */
export function isValidPayrollMonth(monthStr: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) return false;
  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);
  return year > 0 && month >= 1 && month <= 12;
}

/**
 * Validates that a contract's end date is strictly after its start date.
 * @param startDate - ISO date string (YYYY-MM-DD)
 * @param endDate   - ISO date string (YYYY-MM-DD)
 * @returns true if endDate > startDate, false otherwise
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  return end > start;
}
