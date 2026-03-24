import { z } from "zod";

const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .refine((m) => {
    const month = Number(m.slice(5, 7));
    return month >= 1 && month <= 12;
  }, "Invalid month");

export const payrollCreateSchema = z.object({
  employeeId: z.string().min(1),
  month: monthSchema,
  baseSalary: z.number().nonnegative(),
  allowances: z.number().nonnegative().optional().default(0),
  deductions: z.number().nonnegative().optional().default(0),
  status: z.enum(["draft", "paid"]).optional(),
});

export const payrollUpdateSchema = payrollCreateSchema.partial().omit({ employeeId: true, month: true });

