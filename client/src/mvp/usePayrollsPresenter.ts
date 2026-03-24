import { useEffect, useState } from "react";
import type { Employee, Payroll } from "./models";
import { api } from "./api";

export function usePayrollsPresenter() {
  const [items, setItems] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [payrollRes, employeesRes] = await Promise.all([
        api.listPayrolls({
          employeeId: employeeId || undefined,
          month: month || undefined,
          status: status || undefined,
        }),
        api.listEmployees({ status: "active" }),
      ]);
      setItems(payrollRes.items);
      setEmployees(employeesRes.items);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, month, status]);

  async function create(data: Omit<Payroll, "_id" | "netPay">) {
    setError(null);
    try {
      const res = await api.createPayroll(data);
      setItems((prev) => [res.item, ...prev]);
    } catch (e: any) {
      setError(e?.message || "Create failed");\n    }
  }

  async function update(id: string, data: Partial<Omit<Payroll, "_id" | "employeeId" | "month">>) {
    setError(null);
    try {
      const res = await api.updatePayroll(id, data);
      setItems((prev) => prev.map((x) => (x._id === id ? res.item : x)));
    } catch (e: any) {
      setError(e?.message || "Update failed");\n    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.deletePayroll(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");\n    }
  }

  return {
    state: { items, employees, loading, error, employeeId, month, status },
    actions: { setEmployeeId, setMonth, setStatus, refresh, create, update, remove },
  };
}

