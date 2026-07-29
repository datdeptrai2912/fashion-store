import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/bank.css";

// Dùng ảnh logo đặt trên host ngoài (postimg) để tránh thiếu file ảnh local trong repo
const bankLogo = "https://i.postimg.cc/xTQhJpC3/Screenshot-2026-07-08-224617.png";

// Sinh URL ảnh QR từ text, dùng API công khai qrserver.com (không cần backend tự generate QR)
const qrImage = (text) => {
  const payload = `BANK:${text}`;
  // encodeURIComponent để escape ký tự đặc biệt (khoảng trắng, |, v.v.) khi nhét vào query string
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
};

// Format số thành chuỗi tiền tệ kiểu Việt Nam, ví dụ 850000 -> "850.000 VNĐ"
// Number(n) || 0: phòng trường hợp n là NaN/undefined thì fallback về 0 thay vì hiện "NaN VNĐ"
const fmt = (n) => (Number(n) || 0).toLocaleString("vi-VN") + " VNĐ";

export default function Bank() {
  const navigate = useNavigate();

  // Số tiền do người dùng nhập — trước đây bị hard-code cố định 850.000đ,
  // không liên quan gì tới giỏ hàng/đơn hàng thật, gây hiểu nhầm.
  const [amount, setAmount] = useState("");

  // Thông tin tài khoản ngân hàng cố định (chưa lấy từ config/backend, đang hard-code trực tiếp trong component)
  const bankInfo = {
    bank: "MB BANK",
    accountNumber: "090440694",
    accountName: "DAO QUOC DAT",
    content: "FASHION STORE",
  };

  // Xử lý khi bấm "Tôi đã thanh toán"
  const handleConfirm = () => {
    // Validate: chưa nhập tiền hoặc nhập số <= 0 thì chặn lại
    if (!amount || Number(amount) <= 0) {
      alert("Vui lòng nhập số tiền cần chuyển.");
      return;
    }
    // Lưu ý: đây chỉ là xác nhận thủ công phía client, KHÔNG kiểm tra
    // giao dịch thật đã về tài khoản hay chưa (chưa có webhook/API xác thực ngân hàng)
    alert("Thanh toán thành công!");
    navigate("/");
  };

  return (
    <div className="bank-page">
      <div className="bank-card">

        {/* Logo ngân hàng hiển thị ở đầu card */}
        <div className="bank-logo">
          <img
            src={bankLogo}
            alt="Vietcombank"
          />
        </div>

        <h1>Thanh Toán Chuyển Khoản</h1>
        <p className="bank-desc">
          Vui lòng quét mã QR hoặc chuyển khoản theo thông tin dưới đây.
        </p>

        {/* Bảng thông tin chuyển khoản, mỗi bank-row là 1 dòng label + value */}
        <div className="bank-info">
          <div className="bank-row">
            <span>Ngân hàng</span>
            <strong>{bankInfo.bank}</strong>
          </div>
          <div className="bank-row">
            <span>Số tài khoản</span>
            <strong>{bankInfo.accountNumber}</strong>
          </div>
          <div className="bank-row">
            <span>Chủ tài khoản</span>
            <strong>{bankInfo.accountName}</strong>
          </div>

          {/* Duy nhất field này là input thật, còn lại đều là text tĩnh hiển thị từ bankInfo */}
          <div className="bank-row">
            <span>Số tiền</span>
            <input
              type="number"
              min="0"
              step="1000" // Bước nhảy 1.000đ khi dùng nút tăng/giảm của input number
              placeholder="Nhập số tiền (VNĐ)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              // Style inline thay vì class CSS riêng — nhanh nhưng khó tái sử dụng/maintain
              // nếu sau này cần đổi style input này ở nhiều nơi khác
              style={{
                textAlign: "right",
                fontWeight: 700,
                border: "1px solid var(--line, #d2d2d7)", // fallback #d2d2d7 nếu CSS variable --line chưa định nghĩa
                borderRadius: 8,
                padding: "6px 10px",
                width: 160,
              }}
            />
          </div>

          <div className="bank-row">
            <span>Nội dung CK</span>
            <strong>{bankInfo.content}</strong>
          </div>
        </div>

        {/* Khu vực mã QR, tự sinh lại mỗi khi amount thay đổi vì qrImage() được gọi lại mỗi render */}
        <div className="qr-section">
          <h3>Quét mã QR</h3>
          
          <img
            src={qrImage(`${bankInfo.accountNumber}|${amount || 0}|${bankInfo.content}`)}
            alt="QR Thanh Toán"
            className="qr-image"
          />
        </div>

        {/* Ghi chú hướng dẫn người dùng bước tiếp theo sau khi chuyển khoản */}
        <div className="note">
          <p>
            Sau khi chuyển khoản thành công, vui lòng bấm
            <b> "Tôi đã thanh toán"</b>
            để hoàn tất đơn hàng.
          </p>
        </div>

        {/* Nhóm 2 nút hành động: quay lại giỏ hàng hoặc xác nhận đã thanh toán */}
        <div className="button-group">
          <button
            className="back-btn"
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </button>
          <button
            className="confirm-btn"
            onClick={handleConfirm}
          >
            Tôi đã thanh toán
          </button>
        </div>

      </div>
    </div>
  );
}
