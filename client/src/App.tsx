import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./mvp/useAuth";
import { EmployeesPage } from "./pages/EmployeesPage";
import { ContractsPage } from "./pages/ContractsPage";
import { PayrollsPage } from "./pages/PayrollsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { LoginPage } from "./pages/LoginPage";

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

function LogoutBtn() {
  const { logout } = useAuth();
  return (
    <button className="btn" onClick={() => void logout()} style={{ marginTop: "auto" }}>
      Đăng xuất
    </button>
  );
}

function UserBadge() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="userBadge">
      <span className="userName">{user.fullName || user.username}</span>
      <span className="userRole">{user.role}</span>
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loginPage">
        <div className="loginCard">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
        <UserBadge />
        <LogoutBtn />
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

function LoginLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loginPage">
        <div className="loginCard">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  );
}
