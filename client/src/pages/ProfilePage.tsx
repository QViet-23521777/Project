import { useAuth } from "../mvp/useAuth";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="card">
        <div className="cardHeader">
          <h2>Thông tin cá nhân</h2>
        </div>
        <div className="cardBody">
          <p className="err">Vui lòng đăng nhập để xem thông tin.</p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    admin: "Quản trị viên",
    hr: "Nhân sự",
    employee: "Nhân viên",
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>Thông tin cá nhân</h2>
        <p>Hồ sơ người dùng hiện tại</p>
      </div>

      <div className="cardBody">
        <div className="profileGrid">
          <div className="profileSection">
            <h3>Thông tin tài khoản</h3>
            <div className="profileRow">
              <span className="profileLabel">Tên đăng nhập</span>
              <span className="profileValue">{user.username}</span>
            </div>
            <div className="profileRow">
              <span className="profileLabel">Vai trò</span>
              <span className="profileValue">
                <span className="pill pillOk">{roleLabels[user.role] || user.role}</span>
              </span>
            </div>
            <div className="profileRow">
              <span className="profileLabel">ID</span>
              <span className="profileValue mono">{user._id}</span>
            </div>
          </div>

          {user.employeeId && (
            <div className="profileSection">
              <h3>Thông tin nhân viên</h3>
              <div className="profileRow">
                <span className="profileLabel">Mã NV</span>
                <span className="profileValue mono">{user.employeeId}</span>
              </div>
              <div className="profileRow">
                <span className="profileLabel">Họ tên</span>
                <span className="profileValue">{user.fullName}</span>
              </div>
            </div>
          )}

          {!user.employeeId && (
            <div className="profileSection">
              <h3>Thông tin nhân viên</h3>
              <div className="profileRow">
                <span className="profileLabel">Họ tên</span>
                <span className="profileValue">{user.fullName}</span>
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                Tài khoản này chưa liên kết với hồ sơ nhân viên.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}