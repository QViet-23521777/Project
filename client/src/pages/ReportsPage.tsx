import { useReportsPresenter } from "../mvp/useReportsPresenter";
import { formatMoneyVnd } from "../mvp/format";

export function ReportsPage() {
  const p = useReportsPresenter();
  const { headcount, month, summary, loading, error } = p.state;
  const { setMonth, refresh } = p.actions;

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Báo cáo</h2>
        <p>Headcount theo phòng ban và tổng hợp lương theo tháng.</p>
      </div>

      <div className="cardBody">
        <div className="row">
          <div className="field">
            <label>Tháng (YYYY-MM)</label>
            <input value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <button className="btn" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
          {error ? <span className="err">{error}</span> : null}
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
