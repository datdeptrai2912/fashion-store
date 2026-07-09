import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/bank.css";

// Use external placeholders to avoid missing local image files
const bankLogo = "https://i.postimg.cc/xTQhJpC3/Screenshot-2026-07-08-224617.png";

// Generate QR image URL from text (uses public API)
const qrImage = (text) => {
  const payload = `BANK:${text}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
};

const fmt = (n) => (Number(n) || 0).toLocaleString("vi-VN") + " VNĐ";

export default function Bank() {
  const navigate = useNavigate();

  // Số tiền do người dùng nhập — trước đây bị hard-code cố định 850.000đ,
  // không liên quan gì tới giỏ hàng/đơn hàng thật, gây hiểu nhầm.
  const [amount, setAmount] = useState("");

  const bankInfo = {
    bank: "MB BANK",
    accountNumber: "090440694",
    accountName: "DAO QUOC DAT",
    content: "FASHION STORE",
  };

  const handleConfirm = () => {
    if (!amount || Number(amount) <= 0) {
      alert("Vui lòng nhập số tiền cần chuyển.");
      return;
    }
    alert("Thanh toán thành công!");
    navigate("/");
  };

  return (
    <div className="bank-page">
      <div className="bank-card">

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

          <div className="bank-row">
            <span>Số tiền</span>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="Nhập số tiền (VNĐ)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                textAlign: "right",
                fontWeight: 700,
                border: "1px solid var(--line, #d2d2d7)",
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

        <div className="qr-section">

          <h3>Quét mã QR</h3>
          

          <img
            src={qrImage(`${bankInfo.accountNumber}|${amount || 0}|${bankInfo.content}`)}
            alt="QR Thanh Toán"
            className="qr-image"
          />

        </div>

        <div className="note">
          <p>
            Sau khi chuyển khoản thành công, vui lòng bấm
            <b> "Tôi đã thanh toán"</b>
            để hoàn tất đơn hàng.
          </p>
        </div>

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