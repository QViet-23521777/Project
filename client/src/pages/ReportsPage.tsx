import { useReportsPresenter } from "../mvp/useReportsPresenter";
import { formatMoneyVnd } from "../mvp/format";

export function ReportsPage() {
  const p = useReportsPresenter();
  const { headcount, month, summary, loading, error } = p.state;
  const { setMonth, refresh } = p.actions;

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Bao cao</h2>
        <p>Headcount theo phong ban va tong hop luong theo thang.</p>
      </div>

      <div className="cardBody">
        <div className="row">
          <div className="field">
            <label>Thang (YYYY-MM)</label>
            <input value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <button className="btn" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Dang tai..." : "Tai lai"}
          </button>
          {error ? <span className="err">{error}</span> : null}
        </div>

        <div className="grid2" style={{ marginTop: 14 }}>
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Headcount theo phong ban</h2>
              <p>Tinh theo nhan vien active.</p>
            </div>
            <div className="cardBody">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Count</th>
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
                        Khong co du lieu
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Tong hop luong</h2>
              <p>Theo thang: {month}</p>
            </div>
            <div className="cardBody">
              {!summary ? (
                <div className="pill">Chua co du lieu</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>So dong</th>
                      <th>Base</th>
                      <th>Allow</th>
                      <th>Deduct</th>
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
