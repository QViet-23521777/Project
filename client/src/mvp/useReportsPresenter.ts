import { useEffect, useState } from "react";
import type { HeadcountRow, PayrollSummary } from "./models";
import { api } from "./api";

export function useReportsPresenter() {
  const [headcount, setHeadcount] = useState<HeadcountRow[]>([]);
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
  const [filterMode, setFilterMode] = useState<"month" | "quarter">("month");
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const headcountParams = filterMode === "quarter" ? { quarter } : { month };
      const [h, s] = await Promise.all([api.headcountByDepartment(headcountParams), api.payrollSummary(month)]);
      setHeadcount(h.items);
      setSummary(s.summary);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, quarter, filterMode]);

  return {
    state: { headcount, month, quarter, filterMode, summary, loading, error },
    actions: { setMonth, setQuarter, setFilterMode, refresh },
  };
}
