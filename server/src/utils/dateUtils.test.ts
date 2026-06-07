/**
 * dateUtils.test.ts — Automation Tests for HRM Date Utility Functions
 * Lab 3: Automation Test with Jest + ts-jest (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Creator  : Nguyen Van A
 * Date     : 29/05/2026
 * Framework: Jest 29 + ts-jest
 *
 * Functions under test (12 UTCIDs each):
 *   Function1 : dayInMonth(month, year)        — LOC 15
 *   Function2 : checkDate(day, month, year)    — LOC 8
 *   Function3 : isValidPayrollMonth(monthStr)  — LOC 6
 *   Function4 : isValidDateRange(start, end)   — LOC 5
 *
 * Test-case IDs (UTCID01-UTCID12) correspond to the matrix in
 * Lab2_UnitTestCase_HRM.xlsx (Function1-4 sheets).
 *
 * Run: npm test -- --testPathPatterns=dateUtils --verbose
 */

import { dayInMonth, checkDate, isValidPayrollMonth, isValidDateRange } from "./dateUtils";

// =============================================================================
// Function1 : dayInMonth(month, year)
// Returns   : number of days in given month (28|29|30|31) or -1 if invalid
// LOC       : 15   |   Lab-2 sheet : Function1
// =============================================================================
describe("dayInMonth(month, year)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] month=2, year=2024 -> 29 (February in leap year)", () => {
      expect(dayInMonth(2, 2024)).toBe(29);
    });

    test("UTCID02 [N] month=2, year=2023 -> 28 (February in non-leap year)", () => {
      expect(dayInMonth(2, 2023)).toBe(28);
    });

    test("UTCID03 [N] month=1, year=2024 -> 31 (January)", () => {
      expect(dayInMonth(1, 2024)).toBe(31);
    });

    test("UTCID04 [N] month=4, year=2023 -> 30 (April)", () => {
      expect(dayInMonth(4, 2023)).toBe(30);
    });

    test("UTCID05 [N] month=12, year=2023 -> 31 (December)", () => {
      expect(dayInMonth(12, 2023)).toBe(31);
    });

    test("UTCID06 [N] month=11, year=2024 -> 30 (November)", () => {
      expect(dayInMonth(11, 2024)).toBe(30);
    });

    test("UTCID07 [N] month=8, year=2024 -> 31 (August)", () => {
      expect(dayInMonth(8, 2024)).toBe(31);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID08 [B] month=2, year=2000 -> 29 (century year divisible by 400 = leap)", () => {
      expect(dayInMonth(2, 2000)).toBe(29);
    });

    test("UTCID09 [B] month=2, year=1900 -> 28 (century year not divisible by 400 = non-leap)", () => {
      expect(dayInMonth(2, 1900)).toBe(28);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID10 [A] month=0, year=2024 -> -1 (month below minimum)", () => {
      expect(dayInMonth(0, 2024)).toBe(-1);
    });

    test("UTCID11 [A] month=13, year=2024 -> -1 (month above maximum)", () => {
      expect(dayInMonth(13, 2024)).toBe(-1);
    });

    test("UTCID12 [A] month=2, year=0 -> -1 (year = 0 is invalid)", () => {
      expect(dayInMonth(2, 0)).toBe(-1);
    });
  });
});

// =============================================================================
// Function2 : checkDate(day, month, year)
// Returns   : true if date is valid calendar date, false otherwise
// LOC       : 8   |   Lab-2 sheet : Function2
// =============================================================================
describe("checkDate(day, month, year)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] day=15, month=6, year=2024 -> true (mid-month valid date)", () => {
      expect(checkDate(15, 6, 2024)).toBe(true);
    });

    test("UTCID02 [N] day=1, month=1, year=2024 -> true (first day of year)", () => {
      expect(checkDate(1, 1, 2024)).toBe(true);
    });

    test("UTCID03 [N] day=31, month=12, year=2023 -> true (last day of year)", () => {
      expect(checkDate(31, 12, 2023)).toBe(true);
    });

    test("UTCID04 [N] day=29, month=2, year=2024 -> true (Feb 29 in leap year 2024)", () => {
      expect(checkDate(29, 2, 2024)).toBe(true);
    });

    test("UTCID05 [N] day=28, month=2, year=2023 -> true (Feb 28 in non-leap year 2023)", () => {
      expect(checkDate(28, 2, 2023)).toBe(true);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] day=1, month=1, year=1 -> true (minimum valid year boundary)", () => {
      expect(checkDate(1, 1, 1)).toBe(true);
    });

    test("UTCID07 [B] day=31, month=1, year=2024 -> true (January 31 upper boundary)", () => {
      expect(checkDate(31, 1, 2024)).toBe(true);
    });

    test("UTCID08 [B] day=30, month=4, year=2024 -> true (April 30 upper boundary)", () => {
      expect(checkDate(30, 4, 2024)).toBe(true);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] day=29, month=2, year=2023 -> false (Feb 29 in non-leap year 2023)", () => {
      expect(checkDate(29, 2, 2023)).toBe(false);
    });

    test("UTCID10 [A] day=0, month=1, year=2024 -> false (day = 0 below minimum)", () => {
      expect(checkDate(0, 1, 2024)).toBe(false);
    });

    test("UTCID11 [A] day=32, month=1, year=2024 -> false (day = 32 above any month maximum)", () => {
      expect(checkDate(32, 1, 2024)).toBe(false);
    });

    test("UTCID12 [A] day=5, month=13, year=2024 -> false (month = 13 invalid)", () => {
      expect(checkDate(5, 13, 2024)).toBe(false);
    });
  });
});

// =============================================================================
// Function3 : isValidPayrollMonth(monthStr)
// Format    : /^\d{4}-\d{2}$/  AND  month 01-12  AND  year > 0
// LOC       : 6   |   Lab-2 sheet : Function3
// =============================================================================
describe("isValidPayrollMonth(monthStr)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] '2026-05' -> true (normal valid month)", () => {
      expect(isValidPayrollMonth("2026-05")).toBe(true);
    });

    test("UTCID02 [N] '2026-01' -> true (January)", () => {
      expect(isValidPayrollMonth("2026-01")).toBe(true);
    });

    test("UTCID03 [N] '2026-12' -> true (December)", () => {
      expect(isValidPayrollMonth("2026-12")).toBe(true);
    });

    test("UTCID04 [N] '2000-02' -> true (century leap year month)", () => {
      expect(isValidPayrollMonth("2000-02")).toBe(true);
    });

    test("UTCID05 [N] '1999-06' -> true (historical year)", () => {
      expect(isValidPayrollMonth("1999-06")).toBe(true);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] '0001-01' -> true (minimum valid year with 4 digits)", () => {
      expect(isValidPayrollMonth("0001-01")).toBe(true);
    });

    test("UTCID07 [B] '0000-01' -> false (year = 0 is invalid — lower boundary)", () => {
      expect(isValidPayrollMonth("0000-01")).toBe(false);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] '2026-13' -> false (month 13 does not exist)", () => {
      expect(isValidPayrollMonth("2026-13")).toBe(false);
    });

    test("UTCID09 [A] '2026-00' -> false (month 00 is invalid)", () => {
      expect(isValidPayrollMonth("2026-00")).toBe(false);
    });

    test("UTCID10 [A] '2026-5' -> false (single-digit month, violates YYYY-MM format)", () => {
      expect(isValidPayrollMonth("2026-5")).toBe(false);
    });

    test("UTCID11 [A] '2026-05-01' -> false (YYYY-MM-DD rejected — extra segment)", () => {
      expect(isValidPayrollMonth("2026-05-01")).toBe(false);
    });

    test("UTCID12 [A] '' -> false (empty string)", () => {
      expect(isValidPayrollMonth("")).toBe(false);
    });
  });
});

// =============================================================================
// Function4 : isValidDateRange(startDate, endDate)
// Returns   : true if endDate > startDate (both must be valid ISO dates)
// LOC       : 5   |   Lab-2 sheet : Function4
// =============================================================================
describe("isValidDateRange(startDate, endDate)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] start=2024-01-01, end=2024-12-31 -> true (full year range)", () => {
      expect(isValidDateRange("2024-01-01", "2024-12-31")).toBe(true);
    });

    test("UTCID02 [N] start=2023-06-15, end=2024-06-14 -> true (one-year contract)", () => {
      expect(isValidDateRange("2023-06-15", "2024-06-14")).toBe(true);
    });

    test("UTCID03 [N] start=2020-01-01, end=2025-01-01 -> true (multi-year range)", () => {
      expect(isValidDateRange("2020-01-01", "2025-01-01")).toBe(true);
    });

    test("UTCID04 [N] start=2026-01-01, end=2026-12-31 -> true (standard annual contract)", () => {
      expect(isValidDateRange("2026-01-01", "2026-12-31")).toBe(true);
    });

    test("UTCID05 [N] start=2024-01-01, end=2024-01-15 -> true (short-term contract)", () => {
      expect(isValidDateRange("2024-01-01", "2024-01-15")).toBe(true);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] start=2024-01-01, end=2024-01-02 -> true (minimum one-day gap)", () => {
      expect(isValidDateRange("2024-01-01", "2024-01-02")).toBe(true);
    });

    test("UTCID07 [B] start=2024-01-01, end=2024-01-01 -> false (same day — not strictly after)", () => {
      expect(isValidDateRange("2024-01-01", "2024-01-01")).toBe(false);
    });

    test("UTCID08 [B] start=2024-12-31, end=2024-01-01 -> false (end before start — reversed)", () => {
      expect(isValidDateRange("2024-12-31", "2024-01-01")).toBe(false);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID09 [A] start='', end=2024-01-01 -> false (empty start date)", () => {
      expect(isValidDateRange("", "2024-01-01")).toBe(false);
    });

    test("UTCID10 [A] start=2024-01-01, end='' -> false (empty end date)", () => {
      expect(isValidDateRange("2024-01-01", "")).toBe(false);
    });

    test("UTCID11 [A] start='not-a-date', end=2024-01-01 -> false (invalid start string)", () => {
      expect(isValidDateRange("not-a-date", "2024-01-01")).toBe(false);
    });

    test("UTCID12 [A] start=2024-01-01, end='not-a-date' -> false (invalid end string)", () => {
      expect(isValidDateRange("2024-01-01", "not-a-date")).toBe(false);
    });
  });
});
