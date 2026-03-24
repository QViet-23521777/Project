import { Schema, model, Types } from "mongoose";

export type PayrollStatus = "draft" | "paid";

export interface PayrollDoc {
  employeeId: Types.ObjectId;
  month: string; // YYYY-MM
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<PayrollDoc>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    month: { type: String, required: true, index: true, match: /^\d{4}-\d{2}$/ },
    baseSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, required: true, min: 0, default: 0 },
    deductions: { type: Number, required: true, min: 0, default: 0 },
    netPay: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ["draft", "paid"], default: "draft", index: true },
  },
  { timestamps: true },
);

payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const Payroll = model<PayrollDoc>("Payroll", payrollSchema);

