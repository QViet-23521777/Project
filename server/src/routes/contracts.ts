import { Router } from "express";
import { Contract } from "../models/Contract";
import { Employee } from "../models/Employee";
import { asyncHandler } from "../utils/asyncHandler";
import { contractCreateSchema, contractUpdateSchema } from "../validators/contract";

export const contractsRouter = Router();

contractsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { employeeId } = req.query as { employeeId?: string };
    const filter: Record<string, unknown> = {};
    if (employeeId) filter.employeeId = employeeId;
    const items = await Contract.find(filter).sort({ startDate: -1 }).lean();
    res.json({ items });
  }),
);

contractsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = contractCreateSchema.parse(req.body);
    const employee = await Employee.findById(data.employeeId).lean();
    if (!employee) return res.status(400).json({ error: "EmployeeNotFound" });

    const doc = await Contract.create({
      employeeId: data.employeeId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      salary: data.salary,
      notes: data.notes,
    });
    return res.status(201).json({ item: doc });
  }),
);

contractsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = contractUpdateSchema.parse(req.body);
    const item = await Contract.findByIdAndUpdate(req.params.id, data, { new: true }).lean();
    if (!item) return res.status(404).json({ error: "NotFound" });
    return res.json({ item });
  }),
);

contractsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Contract.findByIdAndDelete(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "NotFound" });
    return res.json({ ok: true });
  }),
);

