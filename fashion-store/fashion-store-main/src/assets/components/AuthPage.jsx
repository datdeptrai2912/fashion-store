import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../pages/css/AuthPage.css";
import { defaultUsers } from "../../data/users";

const USERS_KEY = "fashion-store-users";

const loadUsers = () => {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : defaultUsers;
  } catch {
    return defaultUsers;
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Validate email đơn giản
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isAdminEmail = (email) =>
  ["admin@example.com", "admin@admin.com"].includes(email.trim().toLowerCase());

export default function AuthPage({ setUser }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [users, setUsers] = useState(loadUsers);

  // --- State form đăng nhập ---
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  // --- State form đăng ký ---
  const [regData, setRegData] = useState({
    name: "", email: "", password: "", confirm: "",
  });
  const [regErrors, setRegErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  // Nếu được điều hướng tới đây kèm email (ví dụ sau khi đăng ký),
  // tự chuyển về tab login và điền sẵn email.
  const location = useLocation();
  useEffect(() => {
    if (location?.state?.email) {
      setTab("login");
      setLoginData({ email: location.state.email, password: "" });
    }
  }, [location]);

  // ── VALIDATE ĐĂNG NHẬP ──────────────────────────────────
  const validateLogin = () => {
    const errs = {};
    if (!loginData.email) errs.email = "Vui lòng nhập email.";
    else if (!isValidEmail(loginData.email)) errs.email = "Email không hợp lệ.";
    if (!loginData.password) errs.password = "Vui lòng nhập mật khẩu.";
    else if (loginData.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự.";
    return errs;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length > 0) { setLoginErrors(errs); return; }

    const existingUser = users.find(
      (user) => user.email.trim().toLowerCase() === loginData.email.trim().toLowerCase()
    );
    if (!existingUser || existingUser.password !== loginData.password) {
      setLoginErrors({ email: "Email hoặc mật khẩu không đúng.", password: "Email hoặc mật khẩu không đúng." });
      return;
    }

    setUser({
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    });
    navigate("/");
  };

  // ── VALIDATE ĐĂNG KÝ ────────────────────────────────────
  const validateReg = () => {
    const errs = {};
    if (!regData.name.trim()) errs.name = "Vui lòng nhập họ tên.";
    if (!regData.email) errs.email = "Vui lòng nhập email.";
    else if (!isValidEmail(regData.email)) errs.email = "Email không hợp lệ.";
    if (!regData.password) errs.password = "Vui lòng nhập mật khẩu.";
    else if (regData.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (regData.confirm !== regData.password) errs.confirm = "Mật khẩu xác nhận không khớp.";
    return errs;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const errs = validateReg();
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return; }

    const existingUser = users.find(
      (user) => user.email.trim().toLowerCase() === regData.email.trim().toLowerCase()
    );
    if (existingUser) {
      setRegErrors({ email: "Email này đã được đăng ký." });
      return;
    }

    const newUser = {
      name: regData.name.trim(),
      email: regData.email.trim().toLowerCase(),
      password: regData.password,
      role: isAdminEmail(regData.email) ? "admin" : "customer",
    };

    setUsers((prev) => [...prev, newUser]);
    // Sau khi đăng ký: chuyển sang tab Đăng nhập và điền sẵn email (không tự động đăng nhập)
    setTab("login");
    setLoginData({ email: newUser.email, password: "" });
    // Reset form đăng ký
    setRegData({ name: "", email: "", password: "", confirm: "" });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo" onClick={() => navigate("/")}>◆</div>
        <h1>{tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => { setTab("login"); setLoginErrors({}); }}
          >
            Đăng nhập
          </button>
          <button
            className={tab === "register" ? "active" : ""}
            onClick={() => { setTab("register"); setRegErrors({}); }}
          >
            Đăng ký
          </button>
        </div>

        {/* ── FORM ĐĂNG NHẬP ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} noValidate>
            <div className={`field ${loginErrors.email ? "error" : ""}`}>
              <label>Email</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
              {loginErrors.email && <span className="err-msg">{loginErrors.email}</span>}
            </div>

            <div className={`field ${loginErrors.password ? "error" : ""}`}>
              <label>Mật khẩu</label>
              <div className="input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {loginErrors.password && <span className="err-msg">{loginErrors.password}</span>}
            </div>

            <div className="forgot">
              <a href="#">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="btn-submit">Đăng nhập</button>

            <p className="auth-switch">
              Chưa có tài khoản?{" "}
              <span onClick={() => setTab("register")}>Đăng ký ngay</span>
            </p>
          </form>
        )}

        {/* ── FORM ĐĂNG KÝ ── */}
        {tab === "register" && (
          <form onSubmit={handleRegister} noValidate>
            <div className={`field ${regErrors.name ? "error" : ""}`}>
              <label>Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              />
              {regErrors.name && <span className="err-msg">{regErrors.name}</span>}
            </div>

            <div className={`field ${regErrors.email ? "error" : ""}`}>
              <label>Email</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
              />
              {regErrors.email && <span className="err-msg">{regErrors.email}</span>}
            </div>

            <div className={`field ${regErrors.password ? "error" : ""}`}>
              <label>Mật khẩu</label>
              <div className="input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {regErrors.password && <span className="err-msg">{regErrors.password}</span>}
            </div>

            <div className={`field ${regErrors.confirm ? "error" : ""}`}>
              <label>Xác nhận mật khẩu</label>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={regData.confirm}
                onChange={(e) => setRegData({ ...regData, confirm: e.target.value })}
              />
              {regErrors.confirm && <span className="err-msg">{regErrors.confirm}</span>}
            </div>

            <button type="submit" className="btn-submit">Tạo tài khoản</button>

            <p className="auth-switch">
              Đã có tài khoản?{" "}
              <span onClick={() => setTab("login")}>Đăng nhập</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
