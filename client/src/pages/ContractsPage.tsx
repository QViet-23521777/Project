import { useMemo, useState } from "react";
import type { Contract } from "../mvp/models";
import { useContractsPresenter } from "../mvp/useContractsPresenter";
import { formatMoneyVnd, formatDateIso, toInputDate } from "../mvp/format";

const emptyCreate: Omit<Contract, "_id"> = {
  employeeId: "",
  type: "full_time",
  startDate: new Date().toISOString(),
  endDate: "",
  salary: 0,
  notes: "",
};

export function ContractsPage() {
  const p = useContractsPresenter();
  const { items, employees, loading, error, employeeId } = p.state;
  const { setEmployeeId, refresh, create, update, remove } = p.actions;

  const [createForm, setCreateForm] = useState(emptyCreate);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = useMemo(() => items.find((x) => x._id === selectedId) || null, [items, selectedId]);
  const [editForm, setEditForm] = useState<Partial<Contract>>({});

  function pickForEdit(c: Contract) {
    setSelectedId(c._id);
    setEditForm({
      type: c.type,
      startDate: c.startDate,
      endDate: c.endDate || "",
      salary: c.salary,
      notes: c.notes || "",
    });
  }

  function employeeLabel(id: string) {
    const e = employees.find((x) => x._id === id);
    return e ? `${e.employeeCode} - ${e.fullName}` : id;
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Hop dong</h2>
        <p>Tao va quan ly hop dong theo nhan vien.</p>
      </div>

      <div className="cardBody">
        <div className="grid2">
          <section className="card" style={{ background: "var(--card2)" }}>
            <div className="cardHeader">
              <h2 style={{ fontSize: 18 }}>Tao hop dong</h2>
              <p>Chon nhan vien va nhap thong tin.</p>
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
                  <label>Loai</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm((s) => ({ ...s, type: e.target.value as any }))}
                  >
                    <option value="probation">probation</option>
                    <option value="full_time">full_time</option>
                    <option value="part_time">part_time</option>
                    <option value="service">service</option>
                  </select>
                </div>
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Bat dau</label>
                  <input
                    type="date"
                    value={toInputDate(createForm.startDate)}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, startDate: new Date(e.target.value).toISOString() }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Ket thuc</label>
                  <input
                    type="date"
                    value={toInputDate(createForm.endDate)}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        endDate: e.target.value ? new Date(e.target.value).toISOString() : "",
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Luong (VND)</label>
                  <input
                    type="number"
                    value={createForm.salary}
                    onChange={(e) => setCreateForm((s) => ({ ...s, salary: Number(e.target.value || 0) }))}
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <div className="field" style={{ flex: 1, minWidth: 240 }}>
                  <label>Ghi chu</label>
                  <input
                    value={createForm.notes || ""}
                    onChange={(e) => setCreateForm((s) => ({ ...s, notes: e.target.value }))}
                    placeholder="..."
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="btn btnPrimary"
                  onClick={async () => {
                    await create({
                      ...createForm,
                      employeeId: createForm.employeeId,
                      endDate: createForm.endDate ? createForm.endDate : undefined,
                      notes: createForm.notes?.trim() || undefined,
                    } as any);
                    setCreateForm(emptyCreate);
                    await refresh();
                  }}
                  disabled={!createForm.employeeId}
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
              <p>Chon 1 hop dong o bang.</p>
            </div>
            <div className="cardBody">
              {!selected ? (
                <div className="pill">Chua chon</div>
              ) : (
                <>
                  <div className="row">
                    <span className="pill">{employeeLabel(selected.employeeId)}</span>
                    <span className="pill">{selected.type}</span>
                    <span className="pill">{formatMoneyVnd(selected.salary)}</span>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label>Loai</label>
                      <select
                        value={(editForm.type as any) || "full_time"}
                        onChange={(e) => setEditForm((s) => ({ ...s, type: e.target.value as any }))}
                      >
                        <option value="probation">probation</option>
                        <option value="full_time">full_time</option>
                        <option value="part_time">part_time</option>
                        <option value="service">service</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Bat dau</label>
                      <input
                        type="date"
                        value={toInputDate(editForm.startDate as any)}
                        onChange={(e) => setEditForm((s) => ({ ...s, startDate: new Date(e.target.value).toISOString() }))}
                      />
                    </div>
                    <div className="field">
                      <label>Ket thuc</label>
                      <input
                        type="date"
                        value={toInputDate(editForm.endDate as any)}
                        onChange={(e) =>
                          setEditForm((s) => ({
                            ...s,
                            endDate: e.target.value ? new Date(e.target.value).toISOString() : "",
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label>Luong (VND)</label>
                      <input
                        type="number"
                        value={Number(editForm.salary ?? 0)}
                        onChange={(e) => setEditForm((s) => ({ ...s, salary: Number(e.target.value || 0) }))}
                      />
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: 240 }}>
                      <label>Ghi chu</label>
                      <input
                        value={(editForm.notes as string) || ""}
                        onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <button
                      className="btn btnPrimary"
                      onClick={async () => {
                        await update(selected._id, {
                          type: editForm.type as any,
                          startDate: editForm.startDate as any,
                          endDate: String(editForm.endDate || "").trim() || undefined,
                          salary: Number(editForm.salary ?? 0),
                          notes: String(editForm.notes || "").trim() || undefined,
                        });
                      }}
                    >
                      Luu
                    </button>
                    <button
                      className="btn btnDanger"
                      onClick={async () => {
                        if (!confirm("Xoa hop dong nay?")) return;
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
            <label>Loc theo nhan vien</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">(all)</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.employeeCode} - {e.fullName}
                </option>
              ))}
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
                <th>Loai</th>
                <th>Bat dau</th>
                <th>Ket thuc</th>
                <th>Luong</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id}>
                  <td>{employeeLabel(x.employeeId)}</td>
                  <td>
                    <span className="pill">{x.type}</span>
                  </td>
                  <td>{formatDateIso(x.startDate)}</td>
                  <td>{x.endDate ? formatDateIso(x.endDate) : "-"}</td>
                  <td>{formatMoneyVnd(x.salary)}</td>
                  <td>
                    <button className="btn" onClick={() => pickForEdit(x)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ color: "var(--muted)" }}>
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
