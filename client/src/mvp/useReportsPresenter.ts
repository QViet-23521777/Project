import { useEffect, useState } from "react";
import type { DeptCostRow, HeadcountRow, PayrollSummary } from "./models";
import { api } from "./api";

export function useReportsPresenter() {
  const [headcount, setHeadcount] = useState<HeadcountRow[]>([]);
  const [costByDept, setCostByDept] = useState<DeptCostRow[]>([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });
  const [quarter, setQuarter] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `${yyyy}-Q${q}`;
  });
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [filterMode, setFilterMode] = useState<"month" | "quarter" | "year">("month");
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const periodParams =
        filterMode === "quarter" ? { quarter } :
        filterMode === "year" ? { year } :
        { month };

      const [h, s, c] = await Promise.all([
        api.headcountByDepartment(periodParams),
        api.payrollSummary(month),
        api.costByDepartment(periodParams),
      ]);
      setHeadcount(h.items);
      setSummary(s.summary);
      setCostByDept(c.items);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, quarter, year, filterMode]);

  return {
    state: { headcount, costByDept, month, quarter, year, filterMode, summary, loading, error },
    actions: { setMonth, setQuarter, setYear, setFilterMode, refresh },
  };
}
