import { NavLink, Route, Routes } from "react-router-dom";
import { EmployeesPage } from "./pages/EmployeesPage";
import { ContractsPage } from "./pages/ContractsPage";
import { PayrollsPage } from "./pages/PayrollsPage";
import { ReportsPage } from "./pages/ReportsPage";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} end className={({ isActive }) => (isActive ? "active" : "")}>
      {({ isActive }) => (
        <>
          <span>{label}</span>
          <span className="pill">{isActive ? "ON" : "GO"}</span>
        </>
      )}
    </NavLink>
  );
}

export function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>SE113 HR</h1>
          <span className="tag">MVP</span>
        </div>
        <nav className="nav">
          <NavItem to="/" label="Nhan vien" />
          <NavItem to="/contracts" label="Hop dong" />
          <NavItem to="/payrolls" label="Luong" />
          <NavItem to="/reports" label="Bao cao" />
        </nav>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<EmployeesPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/payrolls" element={<PayrollsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>
    </div>
  );
}
