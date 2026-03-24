import { z } from "zod";

export const contractCreateSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(["probation", "full_time", "part_time", "service"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  salary: z.number().nonnegative(),
  notes: z.string().max(1000).optional(),
});

export const contractUpdateSchema = contractCreateSchema.partial().omit({ employeeId: true });

