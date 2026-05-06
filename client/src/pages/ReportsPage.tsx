import { useState } from "react";
import { useReportsPresenter } from "../mvp/useReportsPresenter";
import { api } from "../mvp/api";
import { formatMoneyVnd } from "../mvp/format";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const p = useReportsPresenter();
  const { headcount, month, quarter, filterMode, summary, loading, error } = p.state;
  const { setMonth, setQuarter, setFilterMode, refresh } = p.actions;
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      const csv = await api.exportReport(
        month,
        filterMode === "quarter" ? quarter : undefined,
        filterMode === "month" ? month : undefined,
      );
      const filename = filterMode === "quarter" ? `report-${month}-${quarter}.csv` : `report-${month}.csv`;
      downloadCsv(filename, csv);
    } catch (e: any) {
      setExportError(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Báo cáo</h2>
        <p>Headcount theo phòng ban và tổng hợp lương theo tháng.</p>
      </div>

      <div className="cardBody">
        <div className="row">
          {filterMode === "month" ? (
            <div className="field">
              <label>Tháng (YYYY-MM)</label>
              <input value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
          ) : null}
          <div className="field" style={{ alignSelf: "flex-end" }}>
            <button
              type="button"
              className="btn"
              onClick={() => setFilterMode(filterMode === "month" ? "quarter" : "month")}
              disabled={loading || exporting}
            >
              {filterMode === "month" ? "Lọc theo Quý" : "Lọc theo Tháng"}
            </button>
          </div>
          {filterMode === "quarter" ? (
            <div className="field">
              <label>Quý (YYYY-Qn)</label>
              <input value={quarter} onChange={(e) => setQuarter(e.target.value)} placeholder="2026-Q1" />
            </div>
          ) : null}
          <button className="btn" onClick={() => void refresh()} disabled={loading || exporting}>
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
          <button className="btn" onClick={() => void handleExport()} disabled={loading || exporting}>
            {exporting ? "Đang xuất..." : "Xuất báo cáo"}
          </button>
          {error ? <span className="err">{error}</span> : null}
          {exportError ? <span className="err">{exportError}</span> : null}
        </div>

        <div className="grid2" style={{ marginTop: 14 }}>
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Headcount theo phòng ban</h2>
              <p>Tính theo nhân viên active.</p>
            </div>
            <div className="cardBody">
              <table className="table">
                <thead>
                  <tr>
                    <th>Phòng ban</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {headcount.map((r) => (
                    <tr key={r.department}>
                      <td>{r.department}</td>
                      <td>
                        <span className="pill pillOk">{r.count}</span>
                      </td>
                    </tr>
                  ))}
                  {headcount.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ color: "var(--muted)" }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Tổng hợp lương</h2>
              <p>Theo tháng: {month}</p>
            </div>
            <div className="cardBody">
              {!summary ? (
                <div className="pill">Chưa có dữ liệu</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Số dòng</th>
                      <th>Lương cơ bản</th>
                      <th>Phụ cấp</th>
                      <th>Khấu trừ</th>
                      <th>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="pill pillOk">{summary.count}</span>
                      </td>
                      <td>{formatMoneyVnd(summary.totalBaseSalary)}</td>
                      <td>{formatMoneyVnd(summary.totalAllowances)}</td>
                      <td>{formatMoneyVnd(summary.totalDeductions)}</td>
                      <td>
                        <span className="pill pillOk">{formatMoneyVnd(summary.totalNetPay)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
