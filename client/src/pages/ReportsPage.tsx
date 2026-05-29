import { useState } from "react";
import { useReportsPresenter } from "../mvp/useReportsPresenter";
import { api } from "../mvp/api";
import { formatMoneyVnd } from "../mvp/format";
import type { DeptCostRow, HeadcountRow, PayrollSummary } from "../mvp/models";

function fmtVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function buildReportHtml(
  headcount: HeadcountRow[],
  costByDept: DeptCostRow[],
  summary: PayrollSummary | null,
  filterLabel: string,
  month: string,
) {
  const now = new Date().toLocaleString("vi-VN");
  const maxHc = Math.max(...headcount.map((r) => r.count), 1);
  const maxCost = Math.max(...costByDept.map((r) => r.totalNetPay), 1);

  const hcRows = headcount
    .map(
      (r) => `<tr>
        <td>${r.department}</td>
        <td>
          <div class="br"><div class="bt"><div class="bf bfhc" style="width:${((r.count / maxHc) * 100).toFixed(1)}%"></div></div>
          <span>${r.count} người</span></div>
        </td>
      </tr>`,
    )
    .join("");

  const costRows = costByDept
    .map(
      (r) => `<tr>
        <td>${r.department}</td>
        <td>
          <div class="br"><div class="bt"><div class="bf bfcost" style="width:${((r.totalNetPay / maxCost) * 100).toFixed(1)}%"></div></div>
          <span>${fmtVnd(r.totalNetPay)}</span></div>
        </td>
      </tr>`,
    )
    .join("");

  const summaryHtml = summary
    ? `<div class="section">
        <h2>Tổng hợp lương tháng ${month}</h2>
        <table>
          <thead><tr><th>Chỉ tiêu</th><th>Giá trị</th></tr></thead>
          <tbody>
            <tr><td>Số bản ghi lương</td><td>${summary.count}</td></tr>
            <tr><td>Lương cơ bản</td><td>${fmtVnd(summary.totalBaseSalary)}</td></tr>
            <tr><td>Phụ cấp</td><td>${fmtVnd(summary.totalAllowances)}</td></tr>
            <tr><td>Khấu trừ</td><td>${fmtVnd(summary.totalDeductions)}</td></tr>
            <tr class="total"><td><strong>Lương thực nhận (Net)</strong></td><td><strong>${fmtVnd(summary.totalNetPay)}</strong></td></tr>
          </tbody>
        </table>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Báo cáo HR — ${filterLabel}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;color:#1a1a2e;margin:36px;font-size:14px}
  h1{font-size:22px;margin:0 0 4px;color:#0f3460}
  .meta{color:#666;font-size:13px;margin-bottom:24px;border-bottom:2px solid #0f3460;padding-bottom:10px}
  .section{margin-bottom:28px}
  h2{font-size:13px;font-weight:700;color:#0f3460;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px}
  table{width:100%;border-collapse:collapse}
  th{background:#f4f6fa;text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#555;border-bottom:2px solid #dde3f0}
  td{padding:8px 12px;border-bottom:1px solid #edf0f7;vertical-align:middle}
  .br{display:flex;align-items:center;gap:8px}
  .bt{flex:1;background:#edf0f7;border-radius:4px;height:14px;overflow:hidden;max-width:180px}
  .bf{height:100%;border-radius:4px}
  .bfhc{background:linear-gradient(90deg,#78ffd6,#a8ff78)}
  .bfcost{background:linear-gradient(90deg,#a8ff78,#ffb86b)}
  .total td{background:#f4f6fa}
  .footer{margin-top:36px;padding-top:10px;border-top:1px solid #dde3f0;color:#999;font-size:11px}
  @page{margin:15mm;size:A4}
  @media print{body{margin:0}}
</style>
</head>
<body>
<h1>Báo cáo Nhân sự &amp; Chi phí</h1>
<p class="meta">Kỳ báo cáo: <strong>${filterLabel}</strong>&nbsp;·&nbsp;Tháng lương: <strong>${month}</strong>&nbsp;·&nbsp;Xuất lúc: ${now}</p>

<div class="section">
  <h2>Phân bổ nhân sự theo phòng ban</h2>
  <table>
    <thead><tr><th>Phòng ban</th><th>Headcount</th></tr></thead>
    <tbody>${hcRows || '<tr><td colspan="2" style="color:#999">Không có dữ liệu</td></tr>'}</tbody>
  </table>
</div>

<div class="section">
  <h2>Chi phí lương theo phòng ban</h2>
  <table>
    <thead><tr><th>Phòng ban</th><th>Tổng lương thực nhận</th></tr></thead>
    <tbody>${costRows || '<tr><td colspan="2" style="color:#999">Không có dữ liệu</td></tr>'}</tbody>
  </table>
</div>

${summaryHtml}
<p class="footer">SE113 HR System &nbsp;·&nbsp; Tài liệu nội bộ &nbsp;·&nbsp; ${now}</p>
</body>
</html>`;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, content: string) {
  downloadBlob(filename, new Blob([content], { type: "text/csv;charset=utf-8" }));
}

export function ReportsPage() {
  const p = useReportsPresenter();
  const { headcount, costByDept, month, quarter, year, filterMode, summary, loading, error } = p.state;
  const { setMonth, setQuarter, setYear, setFilterMode, refresh } = p.actions;
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  async function exportPdf() {
    setExporting(true);
    setExportError(null);
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const html = buildReportHtml(headcount, costByDept, summary, filterLabel, month);

      const iframe = document.createElement("iframe");
      Object.assign(iframe.style, {
        position: "fixed", left: "-9999px", top: "0",
        width: "794px", height: "1px", border: "none", visibility: "hidden",
      });
      document.body.appendChild(iframe);

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.contentDocument!.open();
        iframe.contentDocument!.write(html);
        iframe.contentDocument!.close();
      });
      await new Promise((r) => setTimeout(r, 400));

      const body = iframe.contentDocument!.body;
      const canvas = await html2canvas(body, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
        width: 794, windowWidth: 794,
      });
      document.body.removeChild(iframe);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height / canvas.width) * imgW;

      let yOffset = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, -yOffset, imgW, imgH);
        yOffset += pageH;
      }

      const suffix = filterLabel !== month ? `-${filterLabel.replace(/\s/g, "_")}` : "";
      pdf.save(`report-${month}${suffix}.pdf`);
    } catch (e: any) {
      setExportError(e?.message || "Không thể tạo file PDF");
    } finally {
      setExporting(false);
    }
  }

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

  async function handleExportExcel() {
    setExportError(null);
    setExportingExcel(true);
    try {
      const blob = await api.exportReportExcel(
        month,
        filterMode === "quarter" ? quarter : undefined,
        filterMode === "year" ? year : undefined,
      );
      const suffix = filterMode === "quarter" ? `-${quarter}` : filterMode === "year" ? `-${year}` : "";
      downloadBlob(`report-${month}${suffix}.xlsx`, blob);
    } catch (e: any) {
      setExportError(e?.message || "Export Excel failed");
    } finally {
      setExportingExcel(false);
    }
  }

  function cycleFilterMode() {
    if (filterMode === "month") setFilterMode("quarter");
    else if (filterMode === "quarter") setFilterMode("year");
    else setFilterMode("month");
  }

  const filterModeLabel =
    filterMode === "month" ? "Lọc theo Quý" :
    filterMode === "quarter" ? "Lọc theo Năm" :
    "Lọc theo Tháng";

  const filterLabel =
    filterMode === "quarter" ? quarter :
    filterMode === "year" ? `Năm ${year}` :
    month;

  const maxHeadcount = Math.max(...headcount.map((r) => r.count), 1);
  const maxCost = Math.max(...costByDept.map((r) => r.totalNetPay), 1);

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Báo cáo</h2>
        <p>Biểu đồ phân bổ nhân sự và chi phí theo phòng ban.</p>
      </div>

      <div className="cardBody">
        {/* Filter Bar */}
        <div className="row">
          {filterMode === "month" && (
            <div className="field">
              <label>Tháng (YYYY-MM)</label>
              <input value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
          )}
          {filterMode === "quarter" && (
            <div className="field">
              <label>Quý (YYYY-Qn)</label>
              <input value={quarter} onChange={(e) => setQuarter(e.target.value)} placeholder="2026-Q1" />
            </div>
          )}
          {filterMode === "year" && (
            <div className="field">
              <label>Năm (YYYY)</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" maxLength={4} style={{ width: 100 }} />
            </div>
          )}
          <div className="field" style={{ alignSelf: "flex-end" }}>
            <button type="button" className="btn" onClick={cycleFilterMode} disabled={loading || exporting}>
              {filterModeLabel}
            </button>
          </div>
          <button className="btn" onClick={() => void refresh()} disabled={loading || exporting}>
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
          <button className="btn" onClick={() => void handleExport()} disabled={loading || exporting || exportingExcel}>
            {exporting ? "Đang xuất..." : "Xuất CSV"}
          </button>
          <button className="btn" onClick={() => void exportPdf()} disabled={loading || exporting || exportingExcel}>
            {exporting ? "Đang tạo PDF..." : "Xuất PDF"}
          </button>
          <button className="btn" onClick={() => void handleExportExcel()} disabled={loading || exporting || exportingExcel}>
            {exportingExcel ? "Đang xuất..." : "Xuất Excel"}
          </button>
          {error ? <span className="err">{error}</span> : null}
          {exportError ? <span className="err">{exportError}</span> : null}
        </div>

        {/* Charts */}
        <div className="grid2" style={{ marginTop: 14 }}>
          {/* Headcount Chart */}
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Phân bổ nhân sự</h2>
              <p>Headcount theo phòng ban — {filterLabel}</p>
            </div>
            <div className="cardBody">
              {headcount.length === 0 ? (
                <div className="pill">Không có dữ liệu</div>
              ) : (
                <div className="chartBar">
                  {headcount.map((r) => {
                    const pct = (r.count / maxHeadcount) * 100;
                    return (
                      <div key={r.department} className="chartRow">
                        <span className="chartLabel" title={r.department}>{r.department}</span>
                        <div className="chartTrack">
                          <div className="chartFill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="chartValue">{r.count} người</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Cost Chart */}
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Chi phí theo phòng ban</h2>
              <p>Tổng lương thực nhận — {filterLabel}</p>
            </div>
            <div className="cardBody">
              {costByDept.length === 0 ? (
                <div className="pill">Không có dữ liệu</div>
              ) : (
                <div className="chartBar">
                  {costByDept.map((r) => {
                    const pct = (r.totalNetPay / maxCost) * 100;
                    return (
                      <div key={r.department} className="chartRow">
                        <span className="chartLabel" title={r.department}>{r.department}</span>
                        <div className="chartTrack">
                          <div className="chartFill chartFillCost" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="chartValue">{formatMoneyVnd(r.totalNetPay)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Payroll Summary */}
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
