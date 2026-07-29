import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../api/orders";
// api/orders.js — cùng cấu trúc thư mục api/ đã thấy với getProducts. Tên gợi ý rất rõ: tạo đơn hàng mới — đây sẽ là hành động chính khi user bấm "Đặt hàng"/"Xác nhận thanh toán"
import { getStoredUser } from "../../api/auth";
// gọi file xử lý xác thực từ file auth.js 
import "../../pages/css/CheckoutPage.css";

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

import { Truck, Landmark, Wallet, CreditCard } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "cod",   label: "...", icon: <Truck size={24} /> },
  { id: "bank",  label: "...", icon: <Landmark size={24} /> },
  { id: "momo",  label: "...", icon: <Wallet size={24} /> },
  { id: "vnpay", label: "...", icon: <CreditCard size={24} /> },
];

export default function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Địa chỉ | 2: Thanh toán | 3: Xác nhận
  const [payMethod, setPayMethod] = useState("cod"); 
  // Lưu phương thức thanh toán đang được chọn — khớp đúng dự đoán từ mảng PAYMENT_METHODS đã phân tích trước
  const [ordered, setOrdered] = useState(false);
  //Cờ boolean, đánh dấu đã đặt hàng thành công hay chưa.
  // Khởi tạo false — khi true, khả năng UI sẽ chuyển sang hiển thị màn hình "Đặt hàng thành công!"
  // (giống bước 3 "Xác nhận" trong comment ở trên, hoặc 1 màn hình khác hẳn)
  const [placing, setPlacing] = useState(false);
  // đánh dấu đang trong quá trình gửi đơn hàng (đang gọi API createOrder, chờ phản hồi)
  const [orderError, setOrderError] = useState("");

  const [form, setForm] = useState({
    /*
    form — object chứa 8 trường dữ liệu, đại diện toàn bộ nội dung form địa chỉ giao hàng.
setForm — hàm cập nhật, dùng để ghi đè lại toàn bộ hoặc 1 phần object này*/
    name: "", phone: "", email: "",
    province: "", district: "", ward: "", address: "",
    note: "",
  });
  const [errors, setErrors] = useState({});

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship  = total >= 500000 ? 0 : 30000;

  // Nếu vào thẳng /checkout khi giỏ hàng đang trống (và chưa vừa đặt hàng xong)
  // thì đưa người dùng quay lại trang giỏ hàng thay vì hiện form thanh toán trống.
  useEffect(() => {
    if (!ordered && cart.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [ordered, cart.length, navigate]);

  // Đặt hàng cần biết user_id, nên yêu cầu đăng nhập trước khi thanh toán.
  useEffect(() => {
    if (!ordered && cart.length > 0 && !getStoredUser()) {
      navigate("/login", { replace: true });
    }
  }, [ordered, cart.length, navigate]);

  if (!ordered && (cart.length === 0 || !getStoredUser())) {
    return null;
  }

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
/*Bấm nút "Tiếp tục" → handleNextStep1() chạy
  ↓
validateStep1() kiểm tra 5 trường (name, phone, email, province, address)
  ↓
Có lỗi?
  → CÓ  → setErrors(errs) → hiện thông báo lỗi dưới từng ô sai → DỪNG, vẫn ở bước 1
  → KHÔNG → setErrors({}) xóa lỗi cũ → setStep(2) → chuyển sang bước Thanh toán*/
  const handleNextStep1 = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };
/*handleNextStep1: kiểm tra form bước 1 hợp lệ chưa — nếu sai thì báo lỗi và giữ nguyên tại chỗ,
nếu đúng thì xóa lỗi cũ và cho qua bước 2 (Thanh toán)*/
  // Đặt hàng — gửi POST /api/orders lên server
  const handleOrder = async () => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      navigate("/login");
      return;
      /*Kiểm tra lại lần nữa user đã đăng nhập chưa — 
      dù đã có useEffect guard ở đầu component redirect sang /login nếu chưa đăng nhập, đây là lớp bảo vệ thứ 2 ngay tại thời điểm bấm nút đặt hàng*/
    }

    setPlacing(true);
    setOrderError("");
    try {
      await createOrder({
        userId: currentUser.id,
        items: cart.map((item) => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
        })),
        total: total + ship,
        address: `${form.address}, ${form.ward ? form.ward + ", " : ""}${form.district ? form.district + ", " : ""}${form.province}`,
        payment: payMethod,
      });

      setOrdered(true);
      setCart([]);
      setStep(3);
    } catch (err) {
      setOrderError(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setPlacing(false);
    }
  };
  /* await createOrder({...}) — gọi API, chờ kết quả
  await — tạm dừng hàm tại đây, chờ cho tới khi createOrder hoàn tất (thành công hoặc lỗi) mới chạy tiếp dòng dưới — cách viết này giúp code bất đồng bộ đọc như code đồng bộ tuần tự, dễ hiểu hơn nhiều so với .then().catch()
  lồng nhau như đã thấy ở useEffect của CategoryPage */
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
                  <p><strong>Ngân hàng:</strong> MB BANK </p>
                  <p><strong>Số tài khoản:</strong> 0904440694</p>
                  <p><strong>Chủ tài khoản:</strong> CONG TY THOI TRANG XYZ</p>
                  <p><strong>Nội dung:</strong> Thanh toan don hang</p>
                </div>
              )}

              {orderError && <p className="err" style={{ color: "#c0392b", marginTop: 8 }}>{orderError}</p>}

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(1)} disabled={placing}>← Quay lại</button>
                <button className="btn-next" onClick={handleOrder} disabled={placing}>
                  {placing ? "Đang đặt hàng..." : "Đặt hàng"}
                </button>
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
