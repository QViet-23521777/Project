/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  // Lab 3 scope: only the 26 functions defined in Lab2_UnitTestCase_HRM_Final.xlsx
  // dateUtils and formatUtils are not included in the Lab-2 test-case design
  testPathIgnorePatterns: [
    "/node_modules/",
    "src/utils/dateUtils\\.test\\.ts",
    "src/utils/formatUtils\\.test\\.ts",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          target: "ES2020",
          module: "CommonJS",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/utils/payrollUtils.ts",
    "src/utils/dateUtils.ts",
    "src/utils/reportUtils.ts",
    "src/utils/formatUtils.ts",
    "src/utils/authUtils.ts",
    "src/routes/auth.ts",
    "src/routes/contracts.ts",
    "src/routes/employees.ts",
    "src/routes/payrolls.ts",
    "src/routes/reports.ts",
    "!src/**/*.test.ts",
  ],
  coverageReporters: ["text", "lcov"],
};
