import { useEffect, useState } from "react";
import type { Employee } from "./models";
import { api } from "./api";

export function useEmployeesPresenter() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<string>("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listEmployees({
        q: q.trim() || undefined,
        department: department.trim() || undefined,
        status: status || undefined,
      });
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(data: Omit<Employee, "_id">) {
    setError(null);
    try {
      const res = await api.createEmployee(data);
      setItems((prev) => [res.item, ...prev]);
    } catch (e: any) {
      setError(e?.message || "Create failed");\n    }
  }

  async function update(id: string, data: Partial<Omit<Employee, "_id" | "employeeCode">>) {
    setError(null);
    try {
      const res = await api.updateEmployee(id, data);
      setItems((prev) => prev.map((x) => (x._id === id ? res.item : x)));
    } catch (e: any) {
      setError(e?.message || "Update failed");\n    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.deleteEmployee(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");\n    }
  }

  return {
    state: { items, loading, error, q, department, status },
    actions: { setQ, setDepartment, setStatus, refresh, create, update, remove },
  };
}

