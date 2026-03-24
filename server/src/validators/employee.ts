import { z } from "zod";

export const employeeCreateSchema = z.object({
  employeeCode: z.string().min(1).max(50),
  fullName: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(30).optional(),
  department: z.string().min(1).max(100).optional(),
  position: z.string().min(1).max(100).optional(),
  baseSalary: z.number().nonnegative(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const employeeUpdateSchema = employeeCreateSchema.partial().omit({ employeeCode: true });

