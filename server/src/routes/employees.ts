import { Router } from "express";
import { Employee } from "../models/Employee";
import { asyncHandler } from "../utils/asyncHandler";
import { employeeCreateSchema, employeeUpdateSchema } from "../validators/employee";

export const employeesRouter = Router();

employeesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, department, status } = req.query as {
      q?: string;
      department?: string;
      status?: string;
    };

    const filter: Record<string, unknown> = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { employeeCode: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const items = await Employee.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ items });
  }),
);

employeesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = employeeCreateSchema.parse(req.body);
    const doc = await Employee.create(data);
    res.status(201).json({ item: doc });
  }),
);

employeesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Employee.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "NotFound" });
    return res.json({ item });
  }),
);

employeesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = employeeUpdateSchema.parse(req.body);
    const item = await Employee.findByIdAndUpdate(req.params.id, data, { new: true }).lean();
    if (!item) return res.status(404).json({ error: "NotFound" });
    return res.json({ item });
  }),
);

employeesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Employee.findByIdAndDelete(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "NotFound" });
    return res.json({ ok: true });
  }),
);

