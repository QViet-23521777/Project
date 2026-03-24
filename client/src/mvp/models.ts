export type Id = string;

export interface Employee {
  _id: Id;
  employeeCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  baseSalary: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface Contract {
  _id: Id;
  employeeId: Id;
  type: "probation" | "full_time" | "part_time" | "service";
  startDate: string;
  endDate?: string;
  salary: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payroll {
  _id: Id;
  employeeId: Id;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: "draft" | "paid";
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollSummary {
  _id: string;
  count: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNetPay: number;
}

export interface HeadcountRow {
  department: string;
  count: number;
}
