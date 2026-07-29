import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();

  const [users] = useState(loadUsers);

  const [showPass, setShowPass] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const location = useLocation();

  useEffect(() => {
    if (location?.state?.email) {
      setLoginData({ email: location.state.email, password: "" });
    }
  }, [location]);

  const [loginErrors, setLoginErrors] = useState({});

  const validateLogin = () => {
    const errs = {};

    if (!loginData.email)
      errs.email = "Vui lòng nhập email.";
    else if (!isValidEmail(loginData.email))
      errs.email = "Email không hợp lệ.";

    if (!loginData.password)
      errs.password = "Vui lòng nhập mật khẩu.";

    return errs;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const errs = validateLogin();

    if (Object.keys(errs).length) {
      setLoginErrors(errs);
      return;
    }

    const existingUser = users.find(
      (u) =>
        u.email.toLowerCase() === loginData.email.toLowerCase()
    );

    if (!existingUser || existingUser.password !== loginData.password) {
      setLoginErrors({
        email: "Email hoặc mật khẩu không đúng.",
        password: "Email hoặc mật khẩu không đúng.",
      });
      return;
    }

    setUser(existingUser);

    // Redirect based on role
    if (existingUser.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Đăng nhập</h1>

        <form onSubmit={handleLogin}>

          <div className="field">
            <label>Email</label>

            <input
              type="email"
              value={loginData.email}
              onChange={(e)=>
                setLoginData({
                  ...loginData,
                  email:e.target.value
                })
              }
            />

            {loginErrors.email &&
              <span className="err-msg">
                {loginErrors.email}
              </span>}
          </div>

          <div className="field">

            <label>Mật khẩu</label>

            <div className="input-wrap">

              <input
                type={showPass?"text":"password"}
                value={loginData.password}
                onChange={(e)=>
                  setLoginData({
                    ...loginData,
                    password:e.target.value
                  })
                }
              />

              <button
                type="button"
                onClick={()=>setShowPass(!showPass)}
              >
                {showPass?"Ẩn":"Hiện"}
              </button>

            </div>

            {loginErrors.password &&
              <span className="err-msg">
                {loginErrors.password}
              </span>}
          </div>

          <button className="btn-submit">
            Đăng nhập
          </button>

          <p className="auth-switch">
            Chưa có tài khoản?
            <span onClick={()=>navigate("/register")}>
              Đăng ký
            </span>
          </p>

        </form>

      </div>
    </div>
  );
}