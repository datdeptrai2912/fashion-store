import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/CheckoutPage.css";

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

const PAYMENT_METHODS = [
  { id: "cod",   label: "Thanh toán khi nhận hàng (COD)", icon: "💵" },
  { id: "bank",  label: "Chuyển khoản ngân hàng",          icon: "🏦" },
  { id: "momo",  label: "Ví MoMo",                         icon: "💜" },
  { id: "vnpay", label: "VNPay",                           icon: "🔵" },
];

export default function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Địa chỉ | 2: Thanh toán | 3: Xác nhận
  const [payMethod, setPayMethod] = useState("cod");
  const [ordered, setOrdered] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    province: "", district: "", ward: "", address: "",
    note: "",
  });
  const [errors, setErrors] = useState({});

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship  = total >= 500000 ? 0 : 30000;

  // Validate bước 1
  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = "Vui lòng nhập họ tên.";
    if (!form.phone.match(/^0\d{9}$/)) errs.phone = "Số điện thoại không hợp lệ.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Email không hợp lệ.";
    if (!form.province)       errs.province = "Vui lòng chọn tỉnh/thành phố.";
    if (!form.address.trim()) errs.address  = "Vui lòng nhập địa chỉ cụ thể.";
    return errs;
  };

  const handleNextStep1 = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  // Đặt hàng
  const handleOrder = () => {
    // ← Sau này gọi API POST /api/orders
    setOrdered(true);
    setCart([]);
    setStep(3);
  };

  // ── BƯỚC 3: THÀNH CÔNG ──────────────────────────────────
  if (ordered) {
    return (
      <div className="checkout-success">
        <div className="success-icon">✓</div>
        <h2>Đặt hàng thành công!</h2>
        <p>Cảm ơn bạn đã mua sắm. Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.</p>
        <p className="success-info">
          Đơn hàng sẽ được giao đến: <strong>{form.address}, {form.province}</strong>
        </p>
        <button className="btn-home" onClick={() => navigate("/")}>← Tiếp tục mua sắm</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Thanh toán</h1>

      {/* Thanh tiến trình */}
      <div className="checkout-steps">
        {["Địa chỉ giao hàng", "Phương thức thanh toán", "Xác nhận"].map((s, i) => (
          <div key={s} className={`step-item ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
            <div className="step-circle">{step > i + 1 ? "✓" : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        {/* Cột trái — form */}
        <div className="checkout-main">

          {/* ── BƯỚC 1: ĐỊA CHỈ ── */}
          {step === 1 && (
            <div className="checkout-section">
              <h2>Địa chỉ giao hàng</h2>

              <div className="form-row">
                <div className={`field ${errors.name ? "error" : ""}`}>
                  <label>Họ và tên *</label>
                  <input placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {errors.name && <span className="err">{errors.name}</span>}
                </div>
                <div className={`field ${errors.phone ? "error" : ""}`}>
                  <label>Số điện thoại *</label>
                  <input placeholder="0912345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  {errors.phone && <span className="err">{errors.phone}</span>}
                </div>
              </div>

              <div className={`field ${errors.email ? "error" : ""}`}>
                <label>Email *</label>
                <input placeholder="example@email.com" type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {errors.email && <span className="err">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className={`field ${errors.province ? "error" : ""}`}>
                  <label>Tỉnh / Thành phố *</label>
                  <select value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}>
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {["Hà Nội","TP. Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ",
                      "Hải Dương","Bắc Ninh","Hưng Yên","Quảng Ninh","Thanh Hóa"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.province && <span className="err">{errors.province}</span>}
                </div>
                <div className="field">
                  <label>Quận / Huyện</label>
                  <input placeholder="Quận/Huyện"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </div>
              </div>

              <div className={`field ${errors.address ? "error" : ""}`}>
                <label>Địa chỉ cụ thể *</label>
                <input placeholder="Số nhà, tên đường, phường/xã"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
                {errors.address && <span className="err">{errors.address}</span>}
              </div>

              <div className="field">
                <label>Ghi chú đơn hàng</label>
                <textarea placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>

              <button className="btn-next" onClick={handleNextStep1}>
                Tiếp theo →
              </button>
            </div>
          )}

          {/* ── BƯỚC 2: THANH TOÁN ── */}
          {step === 2 && (
            <div className="checkout-section">
              <h2>Phương thức thanh toán</h2>

              <div className="payment-list">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`payment-item ${payMethod === m.id ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="pay"
                      value={m.id}
                      checked={payMethod === m.id}
                      onChange={() => setPayMethod(m.id)}
                    />
                    <span className="pay-icon">{m.icon}</span>
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>

              {/* Hướng dẫn chuyển khoản */}
              {payMethod === "bank" && (
                <div className="bank-info">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>Số tài khoản:</strong> 1234567890</p>
                  <p><strong>Chủ tài khoản:</strong> CONG TY THOI TRANG XYZ</p>
                  <p><strong>Nội dung:</strong> Thanh toan don hang</p>
                </div>
              )}

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn-next" onClick={handleOrder}>Đặt hàng</button>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải — tóm tắt đơn hàng */}
        <div className="checkout-summary">
          <h3>Đơn hàng của bạn</h3>

          <div className="summary-items">
            {cart.map((item) => (
              <div className="summary-item" key={`${item.id}-${item.size}`}>
                <div className="summary-thumb">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <span>Ảnh</span>
                  }
                  <span className="qty-badge">{item.qty}</span>
                </div>
                <div>
                  <p className="s-name">{item.name}</p>
                  <p className="s-meta">Size: {item.size}</p>
                </div>
                <span className="s-price">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="summary-rows">
            <div className="s-row"><span>Tạm tính</span><span>{fmt(total)}</span></div>
            <div className="s-row"><span>Vận chuyển</span><span>{ship === 0 ? "Miễn phí" : fmt(ship)}</span></div>
            <div className="s-row total"><span>Tổng cộng</span><span>{fmt(total + ship)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
