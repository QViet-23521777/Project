import { useMemo, useState } from "react";
import type { Payroll } from "../mvp/models";
import { usePayrollsPresenter } from "../mvp/usePayrollsPresenter";
import { formatMoneyVnd } from "../mvp/format";

const emptyCreate: Omit<Payroll, "_id" | "netPay"> = {
  employeeId: "",
  month: "",
  baseSalary: 0,
  allowances: 0,
  deductions: 0,
  status: "draft",
};

export function PayrollsPage() {
  const p = usePayrollsPresenter();
  const { items, employees, loading, error, employeeId, month, status } = p.state;
  const { setEmployeeId, setMonth, setStatus, refresh, create, update, remove } = p.actions;

  const [createForm, setCreateForm] = useState(emptyCreate);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(() => items.find((x) => x._id === selectedId) || null, [items, selectedId]);
  const [editForm, setEditForm] = useState<Partial<Payroll>>({});

  function pickForEdit(pay: Payroll) {
    setSelectedId(pay._id);
    setEditForm({
      baseSalary: pay.baseSalary,
      allowances: pay.allowances,
      deductions: pay.deductions,
      status: pay.status,
    });
  }

  function employeeLabel(id: string) {
    const e = employees.find((x) => x._id === id);
    return e ? `${e.employeeCode} - ${e.fullName}` : id;
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Luong</h2>
        <p>Bang luong theo thang (YYYY-MM), tu dong tinh net pay.</p>
      </div>

      <div className="cardBody">
        <div className="grid2">
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Tao bang luong</h2>
              <p>Moi nhan vien moi thang chi 1 ban ghi.</p>
            </div>
            <div className="cardBody">
              <div className="row">
                <div className="field" style={{ flex: 1, minWidth: 240 }}>
                  <label>Nhan vien</label>
                  <select
                    value={createForm.employeeId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, employeeId: e.target.value }))}
                  >
                    <option value="">(chon)</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.employeeCode} - {e.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Thang</label>
                  <input
                    value={createForm.month}
                    onChange={(e) => setCreateForm((s) => ({ ...s, month: e.target.value }))}
                    placeholder="2026-03"
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Luong co ban</label>
                  <input
                    type="number"
                    value={createForm.baseSalary}
                    onChange={(e) => setCreateForm((s) => ({ ...s, baseSalary: Number(e.target.value || 0) }))}
                  />
                </div>
                <div className="field">
                  <label>Phu cap</label>
                  <input
                    type="number"
                    value={createForm.allowances}
                    onChange={(e) => setCreateForm((s) => ({ ...s, allowances: Number(e.target.value || 0) }))}
                  />
                </div>
                <div className="field">
                  <label>Khau tru</label>
                  <input
                    type="number"
                    value={createForm.deductions}
                    onChange={(e) => setCreateForm((s) => ({ ...s, deductions: Number(e.target.value || 0) }))}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((s) => ({ ...s, status: e.target.value as any }))}
                  >
                    <option value="draft">draft</option>
                    <option value="paid">paid</option>
                  </select>
                </div>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="btn btnPrimary"
                  onClick={async () => {
                    await create({
                      ...createForm,
                      employeeId: createForm.employeeId,
                      month: createForm.month.trim(),
                    } as any);
                    setCreateForm(emptyCreate);
                    await refresh();
                  }}
                  disabled={!createForm.employeeId || !createForm.month.trim()}
                >
                  Tao
                </button>
                <button className="btn" onClick={() => setCreateForm(emptyCreate)}>
                  Reset
                </button>
                {error ? <span className="err">{error}</span> : null}
              </div>
            </div>
          </section>

          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Chinh sua nhanh</h2>
              <p>Chon 1 dong trong bang.</p>
            </div>
            <div className="cardBody">
              {!selected ? (
                <div className="pill">Chua chon</div>
              ) : (
                <>
                  <div className="row">
                    <span className="pill">{employeeLabel(selected.employeeId)}</span>
                    <span className="pill">{selected.month}</span>
                    <span className="pill">net: {formatMoneyVnd(selected.netPay)}</span>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label>Luong co ban</label>
                      <input
                        type="number"
                        value={Number(editForm.baseSalary ?? 0)}
                        onChange={(e) => setEditForm((s) => ({ ...s, baseSalary: Number(e.target.value || 0) }))}
                      />
                    </div>
                    <div className="field">
                      <label>Phu cap</label>
                      <input
                        type="number"
                        value={Number(editForm.allowances ?? 0)}
                        onChange={(e) => setEditForm((s) => ({ ...s, allowances: Number(e.target.value || 0) }))}
                      />
                    </div>
                    <div className="field">
                      <label>Khau tru</label>
                      <input
                        type="number"
                        value={Number(editForm.deductions ?? 0)}
                        onChange={(e) => setEditForm((s) => ({ ...s, deductions: Number(e.target.value || 0) }))}
                      />
                    </div>
                    <div className="field">
                      <label>Status</label>
                      <select
                        value={(editForm.status as any) || "draft"}
                        onChange={(e) => setEditForm((s) => ({ ...s, status: e.target.value as any }))}
                      >
                        <option value="draft">draft</option>
                        <option value="paid">paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <button
                      className="btn btnPrimary"
                      onClick={async () => {
                        await update(selected._id, {
                          baseSalary: Number(editForm.baseSalary ?? 0),
                          allowances: Number(editForm.allowances ?? 0),
                          deductions: Number(editForm.deductions ?? 0),
                          status: (editForm.status as any) || "draft",
                        });
                      }}
                    >
                      Luu
                    </button>
                    <button
                      className="btn btnDanger"
                      onClick={async () => {
                        if (!confirm("Xoa bang luong nay?")) return;
                        await remove(selected._id);
                        setSelectedId("");
                        setEditForm({});
                      }}
                    >
                      Xoa
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <div className="field" style={{ flex: 1, minWidth: 240 }}>
            <label>Loc nhan vien</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">(all)</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.employeeCode} - {e.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Thang</label>
            <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-03" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">(all)</option>
              <option value="draft">draft</option>
              <option value="paid">paid</option>
            </select>
          </div>
          <button className="btn" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Dang tai..." : "Tai lai"}
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nhan vien</th>
                <th>Thang</th>
                <th>Base</th>
                <th>Allow</th>
                <th>Deduct</th>
                <th>Net</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id}>
                  <td>{employeeLabel(x.employeeId)}</td>
                  <td>
                    <span className="pill">{x.month}</span>
                  </td>
                  <td>{formatMoneyVnd(x.baseSalary)}</td>
                  <td>{formatMoneyVnd(x.allowances)}</td>
                  <td>{formatMoneyVnd(x.deductions)}</td>
                  <td>{formatMoneyVnd(x.netPay)}</td>
                  <td>
                    <span className={`pill ${x.status === "paid" ? "pillOk" : "pillWarn"}`}>{x.status}</span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => pickForEdit(x)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ color: "var(--muted)" }}>
                    Khong co du lieu
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
