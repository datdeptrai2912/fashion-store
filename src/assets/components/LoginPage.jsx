import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../pages/css/login.css";
import { login } from "../../api/auth";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const location = useLocation();

  /* các hook được gọi : navigate — hàm điều hướng, dùng sau này khi login thành công hoặc khi bấm "Đăng ký".
showPass (boolean, default false) — quản lý việc ẩn/hiện mật khẩu.
submitting (boolean, default false) — cờ đánh dấu đang trong quá trình gọi API, dùng để disable nút submit tránh spam click.
loginData (object { email, password }) — state gộp chung 2 field thay vì tách riêng 2 useState. Đây là lựa chọn hợp lý khi các field liên quan chặt với nhau (cùng thuộc 1 form), giúp code gọn hơn khi submit (chỉ cần gửi cả object).
location — lấy object location hiện tại, sẽ dùng ở useEffect phía sau để đọc location.state.email*/
  useEffect(() => {
    if (location?.state?.email) {
      setLoginData({ email: location.state.email, password: "" });
    }
  }, [location]);
  /*Đoạn useEffect này tự động điền email vào form login khi được điều hướng từ trang khác kèm email (ví dụ sau khi đăng ký), 
  còn nếu vào thẳng /login thì bỏ qua, không làm gì cả.*/

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
  /* validateLogin kiểm tra email/password trước khi submit, 
  trả về object lỗi (rỗng nếu hợp lệ) để handleLogin quyết định có gọi API hay dừng lại báo lỗi.*/

  const handleLogin = async (e) => {
    e.preventDefault();

    const errs = validateLogin();

    if (Object.keys(errs).length) {
      setLoginErrors(errs);
      return;
    }
// handleLogin chặn submit mặc định, validate dữ liệu, nếu có lỗi thì hiển thị lỗi và dừng lại (chưa gọi API).
    setSubmitting(true);
    try {
      // Gọi POST /api/auth/login — server trả về { token, user },
      // login() đã lo việc lưu token + user vào localStorage.
      const loggedInUser = await login(loginData.email, loginData.password);

      setUser(loggedInUser);
      setLoginErrors({});

      if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } // Gọi API đăng nhập, nếu thành công thì lưu user vào state cha, xóa lỗi cũ, rồi điều hướng theo role (admin vào /admin, còn lại về trang chủ)
    catch (err) {
      // Server trả 401 kèm message khi sai email/mật khẩu
      setLoginErrors({
        email: err.message || "Email hoặc mật khẩu không đúng.",
        password: err.message || "Email hoặc mật khẩu không đúng.",
      });
      // Nếu API lỗi (401 sai email/password), hiển thị message lỗi lên cả 2 field cùng lúc.
    } finally {
      setSubmitting(false);
    }
  }; 

 return (
    // Wrapper toàn trang, căn giữa card đăng nhập
    <div className="auth-page">
      <div className="auth-card">

        <h1>Đăng nhập</h1>

        {/* onSubmit gọi handleLogin, đã có e.preventDefault() bên trong nên form không reload trang */}
        <form onSubmit={handleLogin}>

          {/* Field email */}
          <div className="field">
            <label>Email</label>

            {/* Controlled input: value luôn lấy từ state, mỗi lần gõ sẽ spread loginData cũ và ghi đè email mới */}
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

            {/* Chỉ render span lỗi nếu loginErrors.email có giá trị (truthy) */}
            {loginErrors.email &&
              <span className="err-msg">
                {loginErrors.email}
              </span>}
          </div>

          {/* Field mật khẩu */}
          <div className="field">

            <label>Mật khẩu</label>

            {/* input-wrap bọc input + nút toggle để dễ style icon con mắt/nút Hiện-Ẩn nằm trong ô input */}
            <div className="input-wrap">

              {/* type đổi động theo showPass: "text" để lộ mật khẩu, "password" để che */}
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

              {/* type="button" để KHÔNG trigger submit form khi bấm (mặc định button trong form là type="submit") */}
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

          {/* Nút submit: không set type nên mặc định là type="submit", disabled khi đang gọi API để tránh double-click */}
          <button className="btn-submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Link chuyển sang trang đăng ký, dùng span + onClick thay vì Link/a (nên cân nhắc đổi để hỗ trợ bàn phím/SEO) */}
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
