import { Router } from "express";
import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";
import { asyncHandler } from "../utils/asyncHandler";

export const reportsRouter = Router();

reportsRouter.get(
  "/payroll-summary",
  asyncHandler(async (req, res) => {
    const month = String(req.query.month || "");
    if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: "InvalidMonth" });

    const rows = await Payroll.aggregate([
      { $match: { month } },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
          totalBaseSalary: { $sum: "$baseSalary" },
          totalAllowances: { $sum: "$allowances" },
          totalDeductions: { $sum: "$deductions" },
          totalNetPay: { $sum: "$netPay" },
        },
      },
    ]);

    res.json({ month, summary: rows[0] || null });
  }),
);

reportsRouter.get(
  "/headcount-by-department",
  asyncHandler(async (_req, res) => {
    const rows = await Employee.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ items: rows.map((r) => ({ department: r._id || "Unassigned", count: r.count })) });
  }),
);

function csvQuote(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

reportsRouter.get(
  "/export",
  asyncHandler(async (req, res) => {
    const month = String(req.query.month || "");
    if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) return res.status(400).json({ error: "InvalidMonth" });

    const [summaryRows, departmentRows] = await Promise.all([
      Payroll.aggregate([
        { $match: { month } },
        {
          $group: {
            _id: "$month",
            count: { $sum: 1 },
            totalBaseSalary: { $sum: "$baseSalary" },
            totalAllowances: { $sum: "$allowances" },
            totalDeductions: { $sum: "$deductions" },
            totalNetPay: { $sum: "$netPay" },
          },
        },
      ]),
      Employee.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const summary = summaryRows[0] || null;
    const departmentStats = departmentRows.map((r) => ({ department: r._id || "Unassigned", count: r.count }));

    const lines = [
      ["Payroll Summary Report"],
      ["Month", "Row", "Total Base Salary", "Total Allowances", "Total Deductions", "Total Net Pay"],
      [month, summary ? summary.count : 0, summary ? summary.totalBaseSalary : 0, summary ? summary.totalAllowances : 0, summary ? summary.totalDeductions : 0, summary ? summary.totalNetPay : 0],
      [],
      ["Summary by Department"],
      ["Department", "Count"],
      ...departmentStats.map((row) => [row.department, row.count]),
    ];

    const csv = lines.map((row) => row.map(csvQuote).join(",")).join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="report-${month}.csv"`);
    res.send(csv);
  }),
);

