import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/login.css";
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

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isAdminEmail = (email) =>
  ["admin@example.com", "admin@admin.com"].includes(
    email.trim().toLowerCase()
  );

import { useLocation } from "react-router-dom";

export default function RegisterPage({ setUser }) {
  const navigate = useNavigate();

  const [users, setUsers] = useState(loadUsers);

  const [showPass, setShowPass] = useState(false);

  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [regErrors, setRegErrors] = useState({});

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const validateRegister = () => {
    const errs = {};

    if (!regData.name.trim()) {
      errs.name = "Vui lòng nhập họ tên.";
    }

    if (!regData.email) {
      errs.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(regData.email)) {
      errs.email = "Email không hợp lệ.";
    }

    if (!regData.password) {
      errs.password = "Vui lòng nhập mật khẩu.";
    } else if (regData.password.length < 6) {
      errs.password = "Mật khẩu tối thiểu 6 ký tự.";
    }

    if (regData.confirm !== regData.password) {
      errs.confirm = "Mật khẩu xác nhận không khớp.";
    }

    return errs;
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const errs = validateRegister();

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }

    const existingUser = users.find(
      (user) =>
        user.email.trim().toLowerCase() ===
        regData.email.trim().toLowerCase()
    );

    if (existingUser) {
      setRegErrors({
        email: "Email này đã được đăng ký.",
      });
      return;
    }

    const newUser = {
      name: regData.name.trim(),
      email: regData.email.trim().toLowerCase(),
      password: regData.password,
      role: isAdminEmail(regData.email)
        ? "admin"
        : "customer",
    };

    setUsers((prev) => [...prev, newUser]);

    // Không tự động đăng nhập sau khi đăng ký.
    // Chuyển về trang đăng nhập (`/login`) và truyền email để điền sẵn.
    navigate("/login", { state: { email: newUser.email } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div
          className="auth-logo"
          onClick={() => navigate("/")}
        >
          ◆
        </div>

        <h1>Tạo tài khoản</h1>

        <form onSubmit={handleRegister} noValidate>
          <div className={`field ${regErrors.name ? "error" : ""}`}>
            <label>Họ và tên</label>

            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={regData.name}
              onChange={(e) =>
                setRegData({
                  ...regData,
                  name: e.target.value,
                })
              }
            />

            {regErrors.name && (
              <span className="err-msg">
                {regErrors.name}
              </span>
            )}
          </div>

          <div className={`field ${regErrors.email ? "error" : ""}`}>
            <label>Email</label>

            <input
              type="email"
              placeholder="example@email.com"
              value={regData.email}
              onChange={(e) =>
                setRegData({
                  ...regData,
                  email: e.target.value,
                })
              }
            />

            {regErrors.email && (
              <span className="err-msg">
                {regErrors.email}
              </span>
            )}
          </div>

          <div className={`field ${regErrors.password ? "error" : ""}`}>
            <label>Mật khẩu</label>

            <div className="input-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                value={regData.password}
                onChange={(e) =>
                  setRegData({
                    ...regData,
                    password: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "Ẩn" : "Hiện"}
              </button>
            </div>

            {regErrors.password && (
              <span className="err-msg">
                {regErrors.password}
              </span>
            )}
          </div>

          <div className={`field ${regErrors.confirm ? "error" : ""}`}>
            <label>Xác nhận mật khẩu</label>

            <input
              type={showPass ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={regData.confirm}
              onChange={(e) =>
                setRegData({
                  ...regData,
                  confirm: e.target.value,
                })
              }
            />

            {regErrors.confirm && (
              <span className="err-msg">
                {regErrors.confirm}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit"
          >
            Tạo tài khoản
          </button>

          <p className="auth-switch">
            Đã có tài khoản?{" "}
            <span onClick={() => navigate("/login")}>
              Đăng nhập
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}