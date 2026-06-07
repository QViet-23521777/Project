import { Router } from "express";
import * as XLSX from "xlsx";
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

function yearToMonths(year: string) {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
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
    } else if (req.query.year) {
      const year = String(req.query.year).trim();
      if (!/^[0-9]{4}$/.test(year)) return res.status(400).json({ error: "InvalidYear" });
      const months = yearToMonths(year);

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

reportsRouter.get(
  "/cost-by-department",
  asyncHandler(async (req, res) => {
    const quarter = String(req.query.quarter || "").trim();
    const month = String(req.query.month || "").trim();
    const year = String(req.query.year || "").trim();

    let months: string[] | null = null;

    if (quarter) {
      months = quarterToMonths(quarter);
      if (!months) return res.status(400).json({ error: "InvalidQuarter" });
    } else if (year) {
      if (!/^[0-9]{4}$/.test(year)) return res.status(400).json({ error: "InvalidYear" });
      months = yearToMonths(year);
    } else if (month) {
      if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) return res.status(400).json({ error: "InvalidMonth" });
      months = [month];
    }

    let rows;
    if (months) {
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
        {
          $group: {
            _id: "$employee.department",
            totalNetPay: { $sum: "$netPay" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalNetPay: -1 } },
      ]);
    } else {
      rows = await Employee.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: "$department",
            totalNetPay: { $sum: "$baseSalary" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalNetPay: -1 } },
      ]);
    }

    res.json({
      items: rows.map((r: any) => ({
        department: r._id || "Unassigned",
        totalNetPay: r.totalNetPay,
        count: r.count,
      })),
    });
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

reportsRouter.get(
  "/export-excel",
  asyncHandler(async (req, res) => {
    const month = String(req.query.month || "");
    if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) return res.status(400).json({ error: "InvalidMonth" });

    const quarter = String(req.query.quarter || "").trim();
    const year = String(req.query.year || "").trim();
    let departmentMonths: string[] | null = null;
    let filterLabel = month;

    if (quarter) {
      departmentMonths = quarterToMonths(quarter);
      if (!departmentMonths) return res.status(400).json({ error: "InvalidQuarter" });
      filterLabel = quarter;
    } else if (year) {
      if (!/^[0-9]{4}$/.test(year)) return res.status(400).json({ error: "InvalidYear" });
      departmentMonths = yearToMonths(year);
      filterLabel = `Năm ${year}`;
    }

    const [summaryRows, headcountRows, costRows] = await Promise.all([
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
      departmentMonths
        ? Payroll.aggregate([
            { $match: { month: { $in: departmentMonths } } },
            { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
            { $unwind: "$employee" },
            { $match: { "employee.status": "active" } },
            { $group: { _id: { employeeId: "$employeeId", department: "$employee.department" } } },
            { $group: { _id: "$_id.department", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ])
        : Employee.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
      departmentMonths
        ? Payroll.aggregate([
            { $match: { month: { $in: departmentMonths } } },
            { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
            { $unwind: "$employee" },
            { $group: { _id: "$employee.department", totalNetPay: { $sum: "$netPay" }, count: { $sum: 1 } } },
            { $sort: { totalNetPay: -1 } },
          ])
        : Payroll.aggregate([
            { $match: { month } },
            { $lookup: { from: "employees", localField: "employeeId", foreignField: "_id", as: "employee" } },
            { $unwind: "$employee" },
            { $group: { _id: "$employee.department", totalNetPay: { $sum: "$netPay" }, count: { $sum: 1 } } },
            { $sort: { totalNetPay: -1 } },
          ]),
    ]);

    const summary = summaryRows[0] || null;
    const wb = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet([
      [`Báo cáo tổng hợp lương — Tháng: ${month}`],
      [],
      ["Tháng", "Số bản ghi", "Lương cơ bản", "Phụ cấp", "Khấu trừ", "Lương thực nhận (Net)"],
      [
        month,
        summary ? summary.count : 0,
        summary ? summary.totalBaseSalary : 0,
        summary ? summary.totalAllowances : 0,
        summary ? summary.totalDeductions : 0,
        summary ? summary.totalNetPay : 0,
      ],
    ]);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Tổng hợp lương");

    const headcountSheet = XLSX.utils.aoa_to_sheet([
      [`Nhân sự theo phòng ban — ${filterLabel}`],
      [],
      ["Phòng ban", "Số lượng"],
      ...headcountRows.map((r: any) => [r._id || "Unassigned", r.count]),
    ]);
    XLSX.utils.book_append_sheet(wb, headcountSheet, "Nhân sự theo phòng ban");

    const costSheet = XLSX.utils.aoa_to_sheet([
      [`Chi phí theo phòng ban — ${filterLabel}`],
      [],
      ["Phòng ban", "Tổng lương thực nhận", "Số bản ghi"],
      ...costRows.map((r: any) => [r._id || "Unassigned", r.totalNetPay, r.count]),
    ]);
    XLSX.utils.book_append_sheet(wb, costSheet, "Chi phí theo phòng ban");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const filename = `report-${month}${filterLabel !== month ? `-${filterLabel.replace(/\s+/g, "_")}` : ""}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buf);
  }),
);

