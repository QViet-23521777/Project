import { Schema, model } from "mongoose";

export type EmployeeStatus = "active" | "inactive";

export interface EmployeeDoc {
  employeeCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  baseSalary: number;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDoc>(
  {
    employeeCode: { type: String, required: true, unique: true, index: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: false, trim: true },
    phone: { type: String, required: false, trim: true },
    department: { type: String, required: false, trim: true, index: true },
    position: { type: String, required: false, trim: true },
    baseSalary: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

export const Employee = model<EmployeeDoc>("Employee", employeeSchema);

