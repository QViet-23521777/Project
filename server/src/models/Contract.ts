import { Schema, model, Types } from "mongoose";

export type ContractType = "probation" | "full_time" | "part_time" | "service";

export interface ContractDoc {
  employeeId: Types.ObjectId;
  type: ContractType;
  startDate: Date;
  endDate?: Date;
  salary: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<ContractDoc>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["probation", "full_time", "part_time", "service"],
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    salary: { type: Number, required: true, min: 0 },
    notes: { type: String, required: false, trim: true },
  },
  { timestamps: true },
);

export const Contract = model<ContractDoc>("Contract", contractSchema);

