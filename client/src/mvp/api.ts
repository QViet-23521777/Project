import { apiFetch } from "./http";
import type { AuthResponse, Contract, Employee, HeadcountRow, Payroll, PayrollSummary, User } from "./models";

export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiFetch<{ ok: true }>("/auth/logout", { method: "POST" }),
  me: () => apiFetch<{ user: User }>("/auth/me"),

  health: () => apiFetch<{ ok: boolean; ts: string }>("/health"),

  listEmployees: (params?: { q?: string; department?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.q) q.set("q", params.q);
    if (params?.department) q.set("department", params.department);
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return apiFetch<{ items: Employee[] }>(`/employees${qs ? `?${qs}` : ""}`);
  },
  createEmployee: (data: Omit<Employee, "_id">) =>
    apiFetch<{ item: Employee }>("/employees", { method: "POST", body: JSON.stringify(data) }),
  getEmployee: (id: string) => apiFetch<{ item: Employee }>(`/employees/${id}`),
  updateEmployee: (id: string, data: Partial<Omit<Employee, "_id" | "employeeCode">>) =>
    apiFetch<{ item: Employee }>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteEmployee: (id: string) => apiFetch<{ ok: true }>(`/employees/${id}`, { method: "DELETE" }),

  listContracts: (params?: { employeeId?: string }) => {
    const q = new URLSearchParams();
    if (params?.employeeId) q.set("employeeId", params.employeeId);
    const qs = q.toString();
    return apiFetch<{ items: Contract[] }>(`/contracts${qs ? `?${qs}` : ""}`);
  },
  createContract: (data: Omit<Contract, "_id">) =>
    apiFetch<{ item: Contract }>("/contracts", { method: "POST", body: JSON.stringify(data) }),
  updateContract: (id: string, data: Partial<Omit<Contract, "_id" | "employeeId">>) =>
    apiFetch<{ item: Contract }>(`/contracts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteContract: (id: string) => apiFetch<{ ok: true }>(`/contracts/${id}`, { method: "DELETE" }),

  listPayrolls: (params?: { employeeId?: string; month?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.employeeId) q.set("employeeId", params.employeeId);
    if (params?.month) q.set("month", params.month);
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return apiFetch<{ items: Payroll[] }>(`/payrolls${qs ? `?${qs}` : ""}`);
  },
  createPayroll: (data: Omit<Payroll, "_id" | "netPay">) =>
    apiFetch<{ item: Payroll }>("/payrolls", { method: "POST", body: JSON.stringify(data) }),
  updatePayroll: (id: string, data: Partial<Omit<Payroll, "_id" | "employeeId" | "month">>) =>
    apiFetch<{ item: Payroll }>(`/payrolls/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePayroll: (id: string) => apiFetch<{ ok: true }>(`/payrolls/${id}`, { method: "DELETE" }),

  payrollSummary: (month: string) =>
    apiFetch<{ month: string; summary: PayrollSummary | null }>(
      `/reports/payroll-summary?month=${encodeURIComponent(month)}`,
    ),
  headcountByDepartment: () => apiFetch<{ items: HeadcountRow[] }>("/reports/headcount-by-department"),
};
