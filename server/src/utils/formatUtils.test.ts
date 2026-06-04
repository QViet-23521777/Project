/**
 * formatUtils.test.ts — Automation Tests for HRM Format Utility Functions
 * Lab 3: Automation Test with Jest + ts-jest (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Creator  : Nguyen Van A
 * Date     : 29/05/2026
 * Framework: Jest 29 + ts-jest
 *
 * Functions under test (12 UTCIDs each):
 *   Function8  : formatMoneyVnd(amount)    — LOC 3
 *   Function9  : formatDateIso(value)      — LOC 5
 *   Function10 : toInputDate(value)        — LOC 8
 *
 * Test-case IDs (UTCID01-UTCID12) correspond to the matrix in
 * Lab2_UnitTestCase_HRM.xlsx (Function8, Function9, Function10 sheets).
 *
 * Note: Intl.NumberFormat("vi-VN") produces a NON-BREAKING SPACE (U+00A0)
 *       between the amount and the dong sign (U+20AB). All expected strings
 *       use  ₫ to match the actual formatter output.
 *
 * Note: formatDateIso and toInputDate use the system local timezone.
 *       Tests assume Vietnam timezone (UTC+7). Date-only ISO strings
 *       (e.g. "2024-06-15") are parsed as UTC midnight, which becomes
 *       "2024-06-15 07:00" local time in UTC+7, so the displayed date is correct.
 *
 * Run: npm test -- --testPathPatterns=formatUtils --verbose
 */

import { formatMoneyVnd, formatDateIso, toInputDate } from "./formatUtils";

// Non-breaking space (U+00A0) + dong sign (U+20AB) — used by vi-VN locale
const VND = " ₫";

// =============================================================================
// Function8 : formatMoneyVnd(amount)
// Uses      : Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
// LOC       : 3   |   Lab-2 sheet : Function8
// =============================================================================
describe("formatMoneyVnd(amount)", () => {

  describe("Normal cases (N)", () => {
    test(`UTCID01 [N] 5,300,000 -> '5.300.000${VND}' (typical net salary)`, () => {
      expect(formatMoneyVnd(5_300_000)).toBe(`5.300.000${VND}`);
    });

    test(`UTCID02 [N] 1,000,000 -> '1.000.000${VND}' (one million VND)`, () => {
      expect(formatMoneyVnd(1_000_000)).toBe(`1.000.000${VND}`);
    });

    test(`UTCID03 [N] 500,000 -> '500.000${VND}' (half million VND)`, () => {
      expect(formatMoneyVnd(500_000)).toBe(`500.000${VND}`);
    });

    test(`UTCID04 [N] 10,000,000 -> '10.000.000${VND}' (ten million VND)`, () => {
      expect(formatMoneyVnd(10_000_000)).toBe(`10.000.000${VND}`);
    });

    test(`UTCID05 [N] 3,500,000 -> '3.500.000${VND}' (typical base salary)`, () => {
      expect(formatMoneyVnd(3_500_000)).toBe(`3.500.000${VND}`);
    });

    test(`UTCID11 [N] 1,234,567 -> '1.234.567${VND}' (non-round number)`, () => {
      expect(formatMoneyVnd(1_234_567)).toBe(`1.234.567${VND}`);
    });

    test(`UTCID12 [N] 100 -> '100${VND}' (small amount, no thousand separator)`, () => {
      expect(formatMoneyVnd(100)).toBe(`100${VND}`);
    });
  });

  describe("Boundary cases (B)", () => {
    test(`UTCID06 [B] 0 -> '0${VND}' (zero VND — minimum boundary)`, () => {
      expect(formatMoneyVnd(0)).toBe(`0${VND}`);
    });

    test(`UTCID07 [B] 1 -> '1${VND}' (one VND — minimum positive boundary)`, () => {
      expect(formatMoneyVnd(1)).toBe(`1${VND}`);
    });
  });

  describe("Abnormal cases (A)", () => {
    test(`UTCID08 [A] -1,000,000 -> '-1.000.000${VND}' (negative amount)`, () => {
      expect(formatMoneyVnd(-1_000_000)).toBe(`-1.000.000${VND}`);
    });

    test(`UTCID09 [A] NaN -> 'NaN${VND}' (not-a-number passed to formatter)`, () => {
      expect(formatMoneyVnd(NaN)).toBe(`NaN${VND}`);
    });

    test(`UTCID10 [A] Infinity -> '∞${VND}' (infinity symbol from Intl formatter)`, () => {
      expect(formatMoneyVnd(Infinity)).toBe(`∞${VND}`);
    });
  });
});

// =============================================================================
// Function9 : formatDateIso(value?)
// Returns   : "DD/MM/YYYY" for valid dates, "" for falsy input, value as-is for invalid
// LOC       : 5   |   Lab-2 sheet : Function9
// =============================================================================
describe("formatDateIso(value?)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] '2024-06-15' -> '15/06/2024' (standard date format)", () => {
      expect(formatDateIso("2024-06-15")).toBe("15/06/2024");
    });

    test("UTCID02 [N] '2023-01-01' -> '01/01/2023' (first day of year)", () => {
      expect(formatDateIso("2023-01-01")).toBe("01/01/2023");
    });

    test("UTCID03 [N] '2023-12-31' -> '31/12/2023' (last day of year)", () => {
      expect(formatDateIso("2023-12-31")).toBe("31/12/2023");
    });

    test("UTCID04 [N] '2000-02-29' -> '29/02/2000' (leap year Feb 29)", () => {
      expect(formatDateIso("2000-02-29")).toBe("29/02/2000");
    });

    test("UTCID05 [N] '2024-07-04' -> '04/07/2024' (Independence Day)", () => {
      expect(formatDateIso("2024-07-04")).toBe("04/07/2024");
    });

    test("UTCID11 [N] '2024/06/15' -> '15/06/2024' (slash format is parseable)", () => {
      expect(formatDateIso("2024/06/15")).toBe("15/06/2024");
    });

    test("UTCID12 [N] '2024-06-15T12:30:00' -> '15/06/2024' (datetime string, date portion)", () => {
      expect(formatDateIso("2024-06-15T12:30:00")).toBe("15/06/2024");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] undefined -> '' (no value provided)", () => {
      expect(formatDateIso(undefined)).toBe("");
    });

    test("UTCID07 [B] '' -> '' (empty string — falsy boundary)", () => {
      expect(formatDateIso("")).toBe("");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] 'not-a-date' -> 'not-a-date' (unparseable string returned as-is)", () => {
      expect(formatDateIso("not-a-date")).toBe("not-a-date");
    });

    test("UTCID09 [A] '2024-13-01' -> '2024-13-01' (month 13 invalid — returned as-is)", () => {
      expect(formatDateIso("2024-13-01")).toBe("2024-13-01");
    });

    test("UTCID10 [A] '32-01-2024' -> '32-01-2024' (day 32 invalid format — returned as-is)", () => {
      expect(formatDateIso("32-01-2024")).toBe("32-01-2024");
    });
  });
});

// =============================================================================
// Function10 : toInputDate(value?)
// Returns    : "YYYY-MM-DD" for valid dates, "" for falsy input or invalid date
// LOC        : 8   |   Lab-2 sheet : Function10
// =============================================================================
describe("toInputDate(value?)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] '2024-06-15' -> '2024-06-15' (ISO date passes through unchanged)", () => {
      expect(toInputDate("2024-06-15")).toBe("2024-06-15");
    });

    test("UTCID02 [N] '2023-12-31' -> '2023-12-31' (year-end date)", () => {
      expect(toInputDate("2023-12-31")).toBe("2023-12-31");
    });

    test("UTCID03 [N] '2023-01-01' -> '2023-01-01' (year-start date)", () => {
      expect(toInputDate("2023-01-01")).toBe("2023-01-01");
    });

    test("UTCID04 [N] '2024-02-29' -> '2024-02-29' (leap year Feb 29)", () => {
      expect(toInputDate("2024-02-29")).toBe("2024-02-29");
    });

    test("UTCID05 [N] '2023-12-31T00:00:00' -> '2023-12-31' (datetime string, date extracted)", () => {
      expect(toInputDate("2023-12-31T00:00:00")).toBe("2023-12-31");
    });

    test("UTCID11 [N] '2024/06/15' -> '2024-06-15' (slash-separated, converted to dashes)", () => {
      expect(toInputDate("2024/06/15")).toBe("2024-06-15");
    });

    test("UTCID12 [N] '2022-11-05' -> '2022-11-05' (standard mid-year date)", () => {
      expect(toInputDate("2022-11-05")).toBe("2022-11-05");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] undefined -> '' (no value — falsy boundary)", () => {
      expect(toInputDate(undefined)).toBe("");
    });

    test("UTCID07 [B] '' -> '' (empty string — falsy boundary)", () => {
      expect(toInputDate("")).toBe("");
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] 'not-a-date' -> '' (unparseable string returns empty)", () => {
      expect(toInputDate("not-a-date")).toBe("");
    });

    test("UTCID09 [A] '2024-13-01' -> '' (month 13 is invalid, returns empty)", () => {
      expect(toInputDate("2024-13-01")).toBe("");
    });

    test("UTCID10 [A] 'abc' -> '' (non-date string returns empty)", () => {
      expect(toInputDate("abc")).toBe("");
    });
  });
});
