/**
 * dateUtils.test.ts — Automation Tests for dateUtils.ts
 * Lab 3: Automation Test with Jest (TypeScript)
 *
 * Covers:
 *  - dayInMonth(month, year)  — 12 test cases (UTCID01-12)
 *  - checkDate(day, month, year) — 12 test cases (UTCID01-12)
 *  - isValidPayrollMonth(monthStr) — additional validation tests
 *  - isValidDateRange(startDate, endDate) — contract date tests
 *
 * Run: npm test
 * Framework: Jest 29 + ts-jest
 */

import { dayInMonth, checkDate, isValidPayrollMonth, isValidDateRange } from "./dateUtils";

// ─────────────────────────────────────────────────────────────────────────────
// dayInMonth — 12 Test Cases (matching Lab 2 DayInMonth matrix)
// ─────────────────────────────────────────────────────────────────────────────
describe("dayInMonth(month, year)", () => {

  // ── Normal cases ────────────────────────────────────────────────────────────
  describe("Normal cases (N)", () => {
    test("UTCID01: Feb in leap year 2024 → 29 days", () => {
      expect(dayInMonth(2, 2024)).toBe(29);
    });

    test("UTCID02: Feb in non-leap year 2023 → 28 days", () => {
      expect(dayInMonth(2, 2023)).toBe(28);
    });

    test("UTCID03: January 2024 → 31 days", () => {
      expect(dayInMonth(1, 2024)).toBe(31);
    });

    test("UTCID04: April 2023 → 30 days", () => {
      expect(dayInMonth(4, 2023)).toBe(30);
    });

    test("UTCID05: Feb in century leap year 2000 → 29 days", () => {
      // 2000 is divisible by 400 → leap year
      expect(dayInMonth(2, 2000)).toBe(29);
    });

    test("UTCID06: Feb in century non-leap year 1900 → 28 days", () => {
      // 1900 is divisible by 100 but NOT by 400 → NOT a leap year
      expect(dayInMonth(2, 1900)).toBe(28);
    });

    test("UTCID07: December 2023 → 31 days", () => {
      expect(dayInMonth(12, 2023)).toBe(31);
    });

    test("UTCID12: November 2024 → 30 days", () => {
      expect(dayInMonth(11, 2024)).toBe(30);
    });
  });

  // ── Abnormal cases ──────────────────────────────────────────────────────────
  describe("Abnormal cases (A) — invalid inputs return -1", () => {
    test("UTCID08: month = 0 (below minimum) → -1", () => {
      expect(dayInMonth(0, 2024)).toBe(-1);
    });

    test("UTCID09: month = 13 (above maximum) → -1", () => {
      expect(dayInMonth(13, 2024)).toBe(-1);
    });

    test("UTCID10: year = 0 (invalid year) → -1", () => {
      expect(dayInMonth(2, 0)).toBe(-1);
    });

    test("UTCID11: year = -1 (negative year) → -1", () => {
      expect(dayInMonth(2, -1)).toBe(-1);
    });
  });

  // ── Additional boundary/edge cases ─────────────────────────────────────────
  describe("Additional edge cases", () => {
    test("March → 31 days", () => expect(dayInMonth(3, 2024)).toBe(31));
    test("May → 31 days",   () => expect(dayInMonth(5, 2024)).toBe(31));
    test("July → 31 days",  () => expect(dayInMonth(7, 2024)).toBe(31));
    test("August → 31 days",() => expect(dayInMonth(8, 2024)).toBe(31));
    test("October → 31 days",()=> expect(dayInMonth(10,2024)).toBe(31));
    test("June → 30 days",  () => expect(dayInMonth(6, 2024)).toBe(30));
    test("September → 30 days", () => expect(dayInMonth(9, 2024)).toBe(30));
    test("Feb 2100 → 28 (century non-leap)", () => expect(dayInMonth(2, 2100)).toBe(28));
    test("Feb 2400 → 29 (century leap)",     () => expect(dayInMonth(2, 2400)).toBe(29));
    test("Feb 2004 → 29 (regular leap)",     () => expect(dayInMonth(2, 2004)).toBe(29));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkDate — 12 Test Cases (matching Lab 2 CheckDate matrix)
// ─────────────────────────────────────────────────────────────────────────────
describe("checkDate(day, month, year)", () => {

  // ── Normal cases ────────────────────────────────────────────────────────────
  describe("Normal cases (N)", () => {
    test("UTCID01: 15/6/2024 → true (mid-month, valid)", () => {
      expect(checkDate(15, 6, 2024)).toBe(true);
    });

    test("UTCID02: 1/1/2024 → true (first day of year)", () => {
      expect(checkDate(1, 1, 2024)).toBe(true);
    });

    test("UTCID03: 31/12/2023 → true (last day of year)", () => {
      expect(checkDate(31, 12, 2023)).toBe(true);
    });

    test("UTCID04: 29/2/2024 → true (leap year Feb 29)", () => {
      expect(checkDate(29, 2, 2024)).toBe(true);
    });

    test("UTCID05: 28/2/2023 → true (non-leap Feb 28)", () => {
      expect(checkDate(28, 2, 2023)).toBe(true);
    });
  });

  // ── Abnormal cases ──────────────────────────────────────────────────────────
  describe("Abnormal cases (A) — invalid dates return false", () => {
    test("UTCID06: 29/2/2023 → false (non-leap year, Feb has only 28 days)", () => {
      expect(checkDate(29, 2, 2023)).toBe(false);
    });

    test("UTCID07: 30/4/2024 → true (April 30 IS valid — 30 == maxDays)", () => {
      // Note: April has 30 days, so day=30 is the last valid day
      expect(checkDate(30, 4, 2024)).toBe(true);
    });

    test("UTCID07b: 31/4/2024 → false (April only has 30 days)", () => {
      expect(checkDate(31, 4, 2024)).toBe(false);
    });

    test("UTCID08: day = 0 → false (day below minimum)", () => {
      expect(checkDate(0, 1, 2024)).toBe(false);
    });

    test("UTCID09: day = 32 → false (day above maximum for any month)", () => {
      expect(checkDate(32, 1, 2024)).toBe(false);
    });

    test("UTCID10: month = 0 → false (month below minimum)", () => {
      expect(checkDate(5, 0, 2024)).toBe(false);
    });

    test("UTCID11: month = 13 → false (month above maximum)", () => {
      expect(checkDate(5, 13, 2024)).toBe(false);
    });
  });

  // ── Boundary cases ──────────────────────────────────────────────────────────
  describe("Boundary cases (B)", () => {
    test("UTCID12: 5/7/9999 → true (maximum reasonable year)", () => {
      expect(checkDate(5, 7, 9999)).toBe(true);
    });

    test("Day = 1 (minimum valid day) → true", () => {
      expect(checkDate(1, 3, 2024)).toBe(true);
    });

    test("Day = 31 for January (maximum valid for 31-day month) → true", () => {
      expect(checkDate(31, 1, 2024)).toBe(true);
    });

    test("Day = 31 for June (has only 30 days) → false", () => {
      expect(checkDate(31, 6, 2024)).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValidPayrollMonth — YYYY-MM format validation
// (Tests the date/time algorithm from Lab 1 UC10 test cases)
// ─────────────────────────────────────────────────────────────────────────────
describe("isValidPayrollMonth(monthStr)", () => {
  describe("Valid formats", () => {
    test("'2026-05' → true (normal valid month)", () => {
      expect(isValidPayrollMonth("2026-05")).toBe(true);
    });
    test("'2026-01' → true (January)", () => {
      expect(isValidPayrollMonth("2026-01")).toBe(true);
    });
    test("'2026-12' → true (December)", () => {
      expect(isValidPayrollMonth("2026-12")).toBe(true);
    });
    test("'2000-02' → true (century leap year Feb)", () => {
      expect(isValidPayrollMonth("2000-02")).toBe(true);
    });
  });

  describe("Invalid formats and values", () => {
    test("'2026-13' → false (month value 13 invalid)", () => {
      expect(isValidPayrollMonth("2026-13")).toBe(false);
    });
    test("'2026-00' → false (month value 00 invalid)", () => {
      expect(isValidPayrollMonth("2026-00")).toBe(false);
    });
    test("'2026-5' → false (single digit month, not YYYY-MM)", () => {
      expect(isValidPayrollMonth("2026-5")).toBe(false);
    });
    test("'2026-05-01' → false (YYYY-MM-DD format rejected)", () => {
      expect(isValidPayrollMonth("2026-05-01")).toBe(false);
    });
    test("'' → false (empty string)", () => {
      expect(isValidPayrollMonth("")).toBe(false);
    });
    test("'abcd-ef' → false (non-numeric)", () => {
      expect(isValidPayrollMonth("abcd-ef")).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValidDateRange — Contract date validation
// (Tests the date algorithm from Lab 1 UC08 test cases)
// ─────────────────────────────────────────────────────────────────────────────
describe("isValidDateRange(startDate, endDate)", () => {
  describe("Valid ranges", () => {
    test("start=2026-01-01, end=2026-12-31 → true", () => {
      expect(isValidDateRange("2026-01-01", "2026-12-31")).toBe(true);
    });
    test("start=2026-01-01, end=2026-01-02 → true (consecutive days)", () => {
      expect(isValidDateRange("2026-01-01", "2026-01-02")).toBe(true);
    });
  });

  describe("Invalid ranges", () => {
    test("end < start → false", () => {
      expect(isValidDateRange("2026-12-31", "2026-01-01")).toBe(false);
    });
    test("end == start → false (must be strictly after)", () => {
      expect(isValidDateRange("2026-06-01", "2026-06-01")).toBe(false);
    });
    test("Invalid date string → false", () => {
      expect(isValidDateRange("not-a-date", "2026-01-01")).toBe(false);
    });
  });
});
