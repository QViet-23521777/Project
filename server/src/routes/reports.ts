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

