import { useEffect, useState } from "react";
import type { Contract, Employee } from "./models";
import { api } from "./api";

export function useContractsPresenter() {
  const [items, setItems] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [contractsRes, employeesRes] = await Promise.all([
        api.listContracts({ employeeId: employeeId || undefined }),
        api.listEmployees({ status: "active" }),
      ]);
      setItems(contractsRes.items);
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
  }, [employeeId]);

  async function create(data: Omit<Contract, "_id">) {
    setError(null);
    try {
      const res = await api.createContract(data);
      setItems((prev) => [res.item, ...prev]);
    } catch (e: any) {
      setError(e?.message || "Create failed");\n    }
  }

  async function update(id: string, data: Partial<Omit<Contract, "_id" | "employeeId">>) {
    setError(null);
    try {
      const res = await api.updateContract(id, data);
      setItems((prev) => prev.map((x) => (x._id === id ? res.item : x)));
    } catch (e: any) {
      setError(e?.message || "Update failed");\n    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.deleteContract(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");\n    }
  }

  return {
    state: { items, employees, loading, error, employeeId },
    actions: { setEmployeeId, refresh, create, update, remove },
  };
}

