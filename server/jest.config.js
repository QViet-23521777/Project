/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  globals: {
    "ts-jest": {
      tsconfig: {
        target: "ES2020",
        module: "CommonJS",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    },
  },
  collectCoverageFrom: [
    "src/utils/payrollUtils.ts",
    "src/utils/dateUtils.ts",
    "!src/utils/**/*.test.ts",
  ],
  coverageReporters: ["text", "lcov"],
};
