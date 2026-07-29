import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/login.css"; // dùng chung file CSS với LoginPage, vì 2 trang có layout/style giống nhau (card đăng nhập/đăng ký)
import { register } from "../../api/auth";

// Regex validate email cơ bản: local-part@domain.tld, không cho phép khoảng trắng hoặc thiếu "@"/dấu chấm
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function RegisterPage() {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false); // toggle hiện/ẩn cho CẢ 2 ô mật khẩu (dùng chung 1 state, xem chi tiết ở phần JSX bên dưới)
  const [submitting, setSubmitting] = useState(false); // cờ đang gọi API, dùng để disable nút submit

  // Gộp 4 field vào 1 object state duy nhất, thay vì 4 useState riêng lẻ —
  // gọn hơn khi submit (chỉ cần đọc regData.xxx), nhưng đổi lại mỗi lần gõ
  // phải spread lại toàn bộ object (xem các onChange bên dưới)
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "", // trường xác nhận mật khẩu, chỉ dùng để so khớp với password, không gửi lên server
  });

  const [regErrors, setRegErrors] = useState({}); // object lỗi tương ứng từng field: { name?, email?, password?, confirm? }

  // Validate toàn bộ form trước khi submit, trả về object lỗi (rỗng nếu hợp lệ)
  const validateRegister = () => {
    const errs = {};

    // trim() để loại bỏ trường hợp chỉ gõ toàn khoảng trắng (name = "   ") vẫn coi là "chưa nhập"
    if (!regData.name.trim()) {
      errs.name = "Vui lòng nhập họ tên.";
    }

    // Kiểm tra email theo 2 bước: rỗng trước, rồi mới tới sai định dạng
    // (giống hệt logic trong LoginPage đã phân tích trước đó)
    if (!regData.email) {
      errs.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(regData.email)) {
      errs.email = "Email không hợp lệ.";
    }

    // Kiểm tra password: rỗng trước, rồi tới độ dài tối thiểu 6 ký tự
    // (khác với LoginPage — ở trang login KHÔNG check độ dài, vì mật khẩu đã tồn tại từ trước;
    // còn ở đây là TẠO MỚI mật khẩu nên cần ràng buộc độ dài ngay từ đầu)
    if (!regData.password) {
      errs.password = "Vui lòng nhập mật khẩu.";
    } else if (regData.password.length < 6) {
      errs.password = "Mật khẩu tối thiểu 6 ký tự.";
    }

    // So khớp mật khẩu xác nhận với mật khẩu chính — LƯU Ý: điều kiện này
    // không nằm trong nhánh if/else như trên, nên nó LUÔN được kiểm tra
    // độc lập, kể cả khi password đang rỗng (lúc đó "" !== "" là false nên
    // không báo lỗi, hợp lý — nhưng nếu password rỗng mà confirm có gõ gì đó
    // thì "" !== "abc" => true, vẫn báo lỗi "không khớp" dù người dùng
    // còn chưa kịp thấy lỗi "chưa nhập mật khẩu" ở field password, 2 lỗi
    // cùng hiện một lúc — không sai nhưng hơi dư, có thể gộp logic để rõ ràng hơn)
    if (regData.confirm !== regData.password) {
      errs.confirm = "Mật khẩu xác nhận không khớp.";
    }

    return errs;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const errs = validateRegister();

    // Nếu có bất kỳ lỗi nào (object errs có ít nhất 1 key), set lỗi lên UI và dừng lại, không gọi API
    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      // Gọi POST /api/auth/register — server kiểm tra trùng email và tạo user
      // trim() + toLowerCase() cho email TRƯỚC khi gửi lên server: chuẩn hóa dữ liệu
      // (loại bỏ khoảng trắng thừa, đồng nhất chữ hoa/thường) để tránh trường hợp
      // "User@Gmail.com " và "user@gmail.com" bị coi là 2 tài khoản khác nhau
      await register(
        regData.name.trim(),
        regData.email.trim().toLowerCase(),
        regData.password
      );

      // Không tự động đăng nhập sau khi đăng ký.
      // Chuyển về trang đăng nhập (`/login`) và truyền email để điền sẵn.
      // Đây chính là nguồn dữ liệu cho đoạn useEffect đọc location.state.email
      // đã phân tích trong LoginPage trước đó — 2 component này liên kết với nhau qua router state
      navigate("/login", { state: { email: regData.email.trim().toLowerCase() } });
    } catch (err) {
      // Server trả 409 kèm message khi email đã tồn tại
      // Chỉ gán lỗi vào field "email" (khác với LoginPage — ở đó lỗi gán cho CẢ email lẫn password,
      // vì login không biết sai ở đâu; còn ở đây, lỗi 409 gần như chắc chắn là do email đã tồn tại)
      setRegErrors({
        email: err.message || "Đăng ký thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false); // luôn tắt trạng thái submitting dù thành công hay lỗi
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo dạng ký tự ◆, bấm vào để về trang chủ — LƯU Ý: LoginPage KHÔNG có phần tử này,
            2 trang dùng chung CSS nhưng cấu trúc JSX không hoàn toàn giống nhau */}
        <div
          className="auth-logo"
          onClick={() => navigate("/")}
        >
          ◆
        </div>

        <h1>Tạo tài khoản</h1>

        {/* noValidate: tắt validate mặc định của trình duyệt (ví dụ HTML5 tự bắt lỗi
            type="email" sai định dạng) — để component TỰ kiểm soát hoàn toàn việc
            hiển thị lỗi bằng validateRegister(), tránh xung đột giữa 2 lớp validate
            (trình duyệt hiện tooltip riêng, không đồng bộ với style .err-msg tự thiết kế) */}
        <form onSubmit={handleRegister} noValidate>

          {/* Field họ tên — class "field" ghép thêm "error" động khi có lỗi,
              CSS chắc hẳn dùng class "error" này để đổi border đỏ, khác với LoginPage
              (LoginPage không có class "error" trên div field, chỉ dựa vào có/không có span lỗi) */}
          <div className={`field ${regErrors.name ? "error" : ""}`}>
            <label>Họ và tên</label>

            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={regData.name}
              onChange={(e) =>
                setRegData({
                  ...regData, // giữ nguyên các field khác, chỉ ghi đè "name"
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

          {/* Field email — cùng pattern: controlled input + spread state + hiện lỗi có điều kiện */}
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

          {/* Field mật khẩu chính, kèm nút toggle hiện/ẩn dùng chung state showPass */}
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

              {/* type="button" bắt buộc để không trigger submit form khi bấm toggle */}
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

          {/* Field xác nhận mật khẩu — LƯU Ý: input này KHÔNG có nút toggle riêng,
              nhưng vẫn dùng chung state "showPass" để đổi type — nghĩa là khi người
              dùng bấm "Hiện" ở ô mật khẩu chính, ô xác nhận này CŨNG tự động hiện theo
              (type={showPass ? "text" : "password"}), dù không có nút bấm riêng cho nó.
              Đây là hành vi CHỦ Ý hợp lý (1 nút điều khiển cả 2 ô cho gọn UX), không phải bug. */}
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

          {/* Nút submit — type="submit" set tường minh (khác LoginPage để mặc định),
              disabled khi đang submitting để tránh double-click gửi 2 request liên tiếp */}
          <button
            type="submit"
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>

          {/* Link chuyển sang trang đăng nhập — vẫn dùng span+onClick thay vì Link/button,
              cùng điểm cần cân nhắc về accessibility như đã nói ở LoginPage */}
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
