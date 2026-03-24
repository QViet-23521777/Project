import { Router } from "express";
import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";
import { asyncHandler } from "../utils/asyncHandler";
import { payrollCreateSchema, payrollUpdateSchema } from "../validators/payroll";

export const payrollsRouter = Router();

function computeNetPay(baseSalary: number, allowances: number, deductions: number) {
  return Math.max(0, baseSalary + allowances - deductions);
}

payrollsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { employeeId, month, status } = req.query as {
      employeeId?: string;
      month?: string;
      status?: string;
    };
    const filter: Record<string, unknown> = {};
    if (employeeId) filter.employeeId = employeeId;
    if (month) filter.month = month;
    if (status) filter.status = status;
    const items = await Payroll.find(filter).sort({ month: -1, createdAt: -1 }).lean();
    res.json({ items });
  }),
);

payrollsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = payrollCreateSchema.parse(req.body);
    const employee = await Employee.findById(data.employeeId).lean();
    if (!employee) return res.status(400).json({ error: "EmployeeNotFound" });

    const allowances = data.allowances ?? 0;
    const deductions = data.deductions ?? 0;
    const netPay = computeNetPay(data.baseSalary, allowances, deductions);

    const doc = await Payroll.create({
      employeeId: data.employeeId,
      month: data.month,
      baseSalary: data.baseSalary,
      allowances,
      deductions,
      netPay,
      status: data.status ?? "draft",
    });

    return res.status(201).json({ item: doc });
  }),
);

payrollsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = payrollUpdateSchema.parse(req.body);

    const existing = await Payroll.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "NotFound" });

    const baseSalary = data.baseSalary ?? existing.baseSalary;
    const allowances = data.allowances ?? existing.allowances;
    const deductions = data.deductions ?? existing.deductions;

    existing.baseSalary = baseSalary;
    existing.allowances = allowances;
    existing.deductions = deductions;
    existing.netPay = computeNetPay(baseSalary, allowances, deductions);
    if (data.status) existing.status = data.status;

    await existing.save();
    return res.json({ item: existing.toObject() });
  }),
);

payrollsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Payroll.findByIdAndDelete(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "NotFound" });
    return res.json({ ok: true });
  }),
);

