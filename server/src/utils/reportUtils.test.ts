/**
 * reportUtils.test.ts — Automation Tests for HRM Report Utility Functions
 * Lab 3: Automation Test with Jest + ts-jest (TypeScript)
 *
 * Project  : Human Resource Management System (HRM-SE113)
 * Creator  : Nguyen Van A
 * Date     : 29/05/2026
 * Framework: Jest 29 + ts-jest
 *
 * Functions under test (12 UTCIDs each — matches Lab2_UnitTestCase_HRM_Final.xlsx):
 *   Function20 : quarterToMonths(quarter)  — LOC 7
 *   Function21 : yearToMonths(year)        — LOC 3
 *
 * Test-case IDs (UTCID01-UTCID12) correspond to the matrix in
 * Lab2_UnitTestCase_HRM_Final.xlsx (Function20, Function21 sheets).
 *
 * Run: npm test -- --testPathPatterns=reportUtils --verbose
 */

import { quarterToMonths, yearToMonths } from "./reportUtils";

// =============================================================================
// Function20 : quarterToMonths(quarter)
// Format     : "YYYY-Q[1-4]" -> ["YYYY-MM", "YYYY-MM", "YYYY-MM"] or null
// LOC        : 7  |  Lab-2 sheet : Function20
// =============================================================================
describe("quarterToMonths(quarter)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] '2026-Q1' -> ['2026-01','2026-02','2026-03'] (Q1 = Jan-Mar)", () => {
      expect(quarterToMonths("2026-Q1")).toEqual(["2026-01", "2026-02", "2026-03"]);
    });

    test("UTCID02 [N] '2026-Q2' -> ['2026-04','2026-05','2026-06'] (Q2 = Apr-Jun)", () => {
      expect(quarterToMonths("2026-Q2")).toEqual(["2026-04", "2026-05", "2026-06"]);
    });

    test("UTCID03 [N] '2026-Q3' -> ['2026-07','2026-08','2026-09'] (Q3 = Jul-Sep)", () => {
      expect(quarterToMonths("2026-Q3")).toEqual(["2026-07", "2026-08", "2026-09"]);
    });

    test("UTCID04 [N] '2026-Q4' -> ['2026-10','2026-11','2026-12'] (Q4 = Oct-Dec)", () => {
      expect(quarterToMonths("2026-Q4")).toEqual(["2026-10", "2026-11", "2026-12"]);
    });

    test("UTCID05 [N] '2000-Q1' -> ['2000-01','2000-02','2000-03'] (historical year Q1)", () => {
      expect(quarterToMonths("2000-Q1")).toEqual(["2000-01", "2000-02", "2000-03"]);
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID06 [B] '0001-Q1' -> ['0001-01','0001-02','0001-03'] (minimum year boundary)", () => {
      expect(quarterToMonths("0001-Q1")).toEqual(["0001-01", "0001-02", "0001-03"]);
    });

    test("UTCID07 [B] '9999-Q4' -> ['9999-10','9999-11','9999-12'] (maximum year boundary)", () => {
      expect(quarterToMonths("9999-Q4")).toEqual(["9999-10", "9999-11", "9999-12"]);
    });
  });

  describe("Abnormal cases (A)", () => {
    test("UTCID08 [A] '' -> null (empty string)", () => {
      expect(quarterToMonths("")).toBeNull();
    });

    test("UTCID09 [A] '2026-Q0' -> null (Q0 is not a valid quarter)", () => {
      expect(quarterToMonths("2026-Q0")).toBeNull();
    });

    test("UTCID10 [A] '2026-Q5' -> null (Q5 exceeds maximum quarter 4)", () => {
      expect(quarterToMonths("2026-Q5")).toBeNull();
    });

    test("UTCID11 [A] '2026-1' -> null (missing Q prefix)", () => {
      expect(quarterToMonths("2026-1")).toBeNull();
    });

    test("UTCID12 [A] '20261Q1' -> null (missing hyphen separator)", () => {
      expect(quarterToMonths("20261Q1")).toBeNull();
    });
  });
});

// =============================================================================
// Function21 : yearToMonths(year)
// Returns    : always 12-element array ["YYYY-01" ... "YYYY-12"] (no validation)
// LOC        : 3  |  Lab-2 sheet : Function21
// =============================================================================
describe("yearToMonths(year)", () => {

  describe("Normal cases (N)", () => {
    test("UTCID01 [N] '2026' -> array of length 12", () => {
      expect(yearToMonths("2026")).toHaveLength(12);
    });

    test("UTCID02 [N] '2026' -> first element is '2026-01' (January)", () => {
      expect(yearToMonths("2026")[0]).toBe("2026-01");
    });

    test("UTCID03 [N] '2026' -> last element is '2026-12' (December)", () => {
      expect(yearToMonths("2026")[11]).toBe("2026-12");
    });

    test("UTCID04 [N] '2026' -> element [5] is '2026-06' (June, zero-indexed)", () => {
      expect(yearToMonths("2026")[5]).toBe("2026-06");
    });

    test("UTCID05 [N] '2000' -> full 12-month array for year 2000", () => {
      expect(yearToMonths("2000")).toEqual([
        "2000-01","2000-02","2000-03","2000-04","2000-05","2000-06",
        "2000-07","2000-08","2000-09","2000-10","2000-11","2000-12",
      ]);
    });

    test("UTCID06 [N] '2026' -> element [2] is '2026-03' (March zero-padded)", () => {
      expect(yearToMonths("2026")[2]).toBe("2026-03");
    });
  });

  describe("Boundary cases (B)", () => {
    test("UTCID07 [B] '0001' -> first element '0001-01' (minimum year boundary)", () => {
      expect(yearToMonths("0001")[0]).toBe("0001-01");
    });

    test("UTCID08 [B] '9999' -> last element '9999-12' (maximum year boundary)", () => {
      expect(yearToMonths("9999")[11]).toBe("9999-12");
    });
  });

  describe("Abnormal cases (A — no validation, always returns 12 elements)", () => {
    test("UTCID09 [A] '' -> array of length 12 (no validation; uses empty string as year)", () => {
      expect(yearToMonths("")).toHaveLength(12);
    });

    test("UTCID10 [A] 'abcd' -> first element 'abcd-01' (accepts non-year string)", () => {
      expect(yearToMonths("abcd")[0]).toBe("abcd-01");
    });

    test("UTCID11 [A] '2026' -> element [9] is '2026-10' (October, double-digit month)", () => {
      expect(yearToMonths("2026")[9]).toBe("2026-10");
    });

    test("UTCID12 [A] '1999' -> element [8] is '1999-09' (September zero-padded)", () => {
      expect(yearToMonths("1999")[8]).toBe("1999-09");
    });
  });
});
