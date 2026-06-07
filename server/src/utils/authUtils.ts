/**
 * authUtils.ts — Authentication utility functions for HRM System
 * Extracted from: server/src/routes/auth.ts
 *
 * Lab 2 (Unit Test Case): Function11 — generateToken
 *                          Function12 — verifyToken
 *                          Function13 — extractBearerToken
 * Lab 3 (Automation Test): Covered by authUtils.test.ts
 */

export interface UserPayload {
  id: string;
  username: string;
  role: string;
  employeeId?: string;
  fullName: string;
}

/**
 * Generates a base64-encoded token from a payload object.
 * (Demo implementation — production should use proper JWT)
 *
 * @param payload - Any serializable object
 * @returns Base64 string representing the JSON-encoded payload
 *
 * LOC (code lines): 3
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function11)
 */
export function generateToken(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Decodes and parses a base64-encoded token.
 * Returns null if the token is not valid base64 JSON.
 *
 * @param token - Base64 string produced by generateToken
 * @returns Parsed UserPayload, or null if decoding/parsing fails
 *
 * LOC (code lines): 5
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function12)
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch {
    return null;
  }
}

/**
 * Extracts the bearer token string from an Authorization header.
 * Returns null if the header is missing or not in "Bearer <token>" format.
 *
 * @param authHeader - Value of the Authorization HTTP header
 * @returns The raw token string after "Bearer ", or null
 *
 * LOC (code lines): 3
 * Test matrix: UTCID01-12  (see Lab2_UnitTestCase_HRM.xlsx — Function13)
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
