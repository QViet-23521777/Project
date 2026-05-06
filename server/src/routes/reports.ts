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

function quarterToMonths(quarter: string) {
  const match = /^([0-9]{4})-Q([1-4])$/.exec(quarter);
  if (!match) return null;
  const year = match[1];
  const quarterNumber = Number(match[2]);
  const startMonth = (quarterNumber - 1) * 3 + 1;
  return [0, 1, 2].map((offset) => `${year}-${String(startMonth + offset).padStart(2, "0")}`);
}

reportsRouter.get(
  "/headcount-by-department",
  asyncHandler(async (req, res) => {
    const quarter = String(req.query.quarter || "").trim();
    const month = String(req.query.month || "").trim();
    let rows;

    if (quarter) {
      const months = quarterToMonths(quarter);
      if (!months) return res.status(400).json({ error: "InvalidQuarter" });

      rows = await Payroll.aggregate([
        { $match: { month: { $in: months } } },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        { $match: { "employee.status": "active" } },
        {
          $group: {
            _id: { employeeId: "$employeeId", department: "$employee.department" },
          },
        },
        {
          $group: {
            _id: "$_id.department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);
    } else if (month) {
      if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) return res.status(400).json({ error: "InvalidMonth" });

      rows = await Payroll.aggregate([
        { $match: { month } },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        { $match: { "employee.status": "active" } },
        {
          $group: {
            _id: { employeeId: "$employeeId", department: "$employee.department" },
          },
        },
        {
          $group: {
            _id: "$_id.department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);
    } else {
      rows = await Employee.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    }

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

    const quarter = String(req.query.quarter || "").trim();
    const filterMonth = String(req.query.filterMonth || "").trim();
    let departmentRows;
    let filterLabel = "";

    if (quarter) {
      const months = quarterToMonths(quarter);
      if (!months) return res.status(400).json({ error: "InvalidQuarter" });
      filterLabel = quarter;

      departmentRows = await Payroll.aggregate([
        { $match: { month: { $in: months } } },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        { $match: { "employee.status": "active" } },
        {
          $group: {
            _id: { employeeId: "$employeeId", department: "$employee.department" },
          },
        },
        {
          $group: {
            _id: "$_id.department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);
    } else if (filterMonth) {
      if (!/^[0-9]{4}-[0-9]{2}$/.test(filterMonth)) return res.status(400).json({ error: "InvalidMonth" });
      filterLabel = filterMonth;

      departmentRows = await Payroll.aggregate([
        { $match: { month: filterMonth } },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        { $match: { "employee.status": "active" } },
        {
          $group: {
            _id: { employeeId: "$employeeId", department: "$employee.department" },
          },
        },
        {
          $group: {
            _id: "$_id.department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);
    } else {
      departmentRows = await Employee.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    }

    const [summaryRows] = await Promise.all([
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
    const filename = filterLabel ? `report-${month}-${filterLabel}.csv` : `report-${month}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  }),
);

