import { useMemo, useState } from "react";
import type { Employee } from "../mvp/models";
import { useEmployeesPresenter } from "../mvp/useEmployeesPresenter";
import { formatMoneyVnd } from "../mvp/format";

const emptyCreate: Omit<Employee, "_id"> = {
  employeeCode: "",
  fullName: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  baseSalary: 0,
  status: "active",
};

export function EmployeesPage() {
  const p = useEmployeesPresenter();
  const { items, loading, error, q, department, status } = p.state;
  const { setQ, setDepartment, setStatus, refresh, create, update, remove } = p.actions;

  const [createForm, setCreateForm] = useState(emptyCreate);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(() => items.find((x) => x._id === selectedId) || null, [items, selectedId]);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  function pickForEdit(emp: Employee) {
    setSelectedId(emp._id);
    setEditForm({
      fullName: emp.fullName,
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department || "",
      position: emp.position || "",
      baseSalary: emp.baseSalary,
      status: emp.status,
    });
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Nhan vien</h2>
        <p>CRUD nhan vien, luong co ban, phong ban.</p>
      </div>

      <div className="cardBody">
        <div className="grid2">
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Tao nhan vien</h2>
              <p>Nhap thong tin toi thieu de bat dau.</p>
            </div>
            <div className="cardBody">
              <div className="row">
                <div className="field">
                  <label>Ma NV</label>
                  <input
                    value={createForm.employeeCode}
                    onChange={(e) => setCreateForm((s) => ({ ...s, employeeCode: e.target.value }))}
                    placeholder="E001"
                  />
                </div>
                <div className="field" style={{ flex: 1, minWidth: 220 }}>
                  <label>Ho ten</label>
                  <input
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm((s) => ({ ...s, fullName: e.target.value }))}
                    placeholder="Nguyen Van A"
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Phong ban</label>
                  <input
                    value={createForm.department || ""}
                    onChange={(e) => setCreateForm((s) => ({ ...s, department: e.target.value }))}
                    placeholder="HR"
                  />
                </div>
                <div className="field">
                  <label>Chuc danh</label>
                  <input
                    value={createForm.position || ""}
                    onChange={(e) => setCreateForm((s) => ({ ...s, position: e.target.value }))}
                    placeholder="Nhan vien"
                  />
                </div>
                <div className="field">
                  <label>Luong co ban (VND)</label>
                  <input
                    type="number"
                    value={createForm.baseSalary}
                    onChange={(e) => setCreateForm((s) => ({ ...s, baseSalary: Number(e.target.value || 0) }))}
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <div className="field" style={{ flex: 1, minWidth: 220 }}>
                  <label>Email</label>
                  <input
                    value={createForm.email || ""}
                    onChange={(e) => setCreateForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder="a@company.com"
                  />
                </div>
                <div className="field">
                  <label>SDT</label>
                  <input
                    value={createForm.phone || ""}
                    onChange={(e) => setCreateForm((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="090..."
                  />
                </div>
                <div className="field">
                  <label>Trang thai</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((s) => ({ ...s, status: e.target.value as any }))}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="btn btnPrimary"
                  onClick={async () => {
                    await create({
                      ...createForm,
                      employeeCode: createForm.employeeCode.trim(),
                      fullName: createForm.fullName.trim(),
                      email: createForm.email?.trim() || undefined,
                      phone: createForm.phone?.trim() || undefined,
                      department: createForm.department?.trim() || undefined,
                      position: createForm.position?.trim() || undefined,
                    });
                    setCreateForm(emptyCreate);
                  }}
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
              <p>Chon 1 nhan vien o bang ben duoi.</p>
            </div>
            <div className="cardBody">
              {!selected ? (
                <div className="pill">Chua chon</div>
              ) : (
                <>
                  <div className="row">
                    <span className="pill">{selected.employeeCode}</span>
                    <span className="pill">{selected.status}</span>
                    <span className="pill">{formatMoneyVnd(selected.baseSalary)}</span>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label>Ho ten</label>
                      <input
                        value={(editForm.fullName as string) || ""}
                        onChange={(e) => setEditForm((s) => ({ ...s, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Trang thai</label>
                      <select
                        value={(editForm.status as any) || "active"}
                        onChange={(e) => setEditForm((s) => ({ ...s, status: e.target.value as any }))}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label>Phong ban</label>
                      <input
                        value={(editForm.department as string) || ""}
                        onChange={(e) => setEditForm((s) => ({ ...s, department: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Chuc danh</label>
                      <input
                        value={(editForm.position as string) || ""}
                        onChange={(e) => setEditForm((s) => ({ ...s, position: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Luong co ban</label>
                      <input
                        type="number"
                        value={Number(editForm.baseSalary ?? 0)}
                        onChange={(e) => setEditForm((s) => ({ ...s, baseSalary: Number(e.target.value || 0) }))}
                      />
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label>Email</label>
                      <input
                        value={(editForm.email as string) || ""}
                        onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>SDT</label>
                      <input
                        value={(editForm.phone as string) || ""}
                        onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <button
                      className="btn btnPrimary"
                      onClick={async () => {
                        await update(selected._id, {
                          fullName: String(editForm.fullName || "").trim(),
                          email: String(editForm.email || "").trim() || undefined,
                          phone: String(editForm.phone || "").trim() || undefined,
                          department: String(editForm.department || "").trim() || undefined,
                          position: String(editForm.position || "").trim() || undefined,
                          baseSalary: Number(editForm.baseSalary ?? 0),
                          status: (editForm.status as any) || "active",
                        });
                      }}
                    >
                      Luu
                    </button>
                    <button
                      className="btn btnDanger"
                      onClick={async () => {
                        if (!confirm("Xoa nhan vien nay?")) return;
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
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>Tim kiem</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ten, ma NV, email" />
          </div>
          <div className="field">
            <label>Phong ban</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="HR" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">(all)</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
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
                <th>Code</th>
                <th>Ho ten</th>
                <th>Phong ban</th>
                <th>Chuc danh</th>
                <th>Luong</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id}>
                  <td>
                    <span className="pill">{x.employeeCode}</span>
                  </td>
                  <td>{x.fullName}</td>
                  <td>{x.department || "-"}</td>
                  <td>{x.position || "-"}</td>
                  <td>{formatMoneyVnd(x.baseSalary)}</td>
                  <td>
                    <span className={`pill ${x.status === "active" ? "pillOk" : "pillWarn"}`}>{x.status}</span>
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
                  <td colSpan={7} style={{ color: "var(--muted)" }}>
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
