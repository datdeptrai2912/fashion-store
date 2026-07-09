import { useNavigate } from "react-router-dom";
import "../../pages/css/CartPage.css";

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function CartPage({ cart, setCart }) {
  const navigate = useNavigate();

  // Tăng / giảm số lượng
  const changeQty = (id, size, color, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id && i.size === size && i.color === color
            ? { ...i, qty: i.qty + delta }
            : i
        )
        .filter((i) => i.qty > 0) // xóa nếu qty = 0
    );
  };

  // Xóa 1 item
  const removeItem = (id, size, color) => {
    setCart((prev) =>
      prev.filter((i) => !(i.id === id && i.size === size && i.color === color))
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>🛍 Giỏ hàng của bạn đang trống.</p>
        <button onClick={() => navigate("/")}>← Tiếp tục mua sắm</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Giỏ hàng</h1>

      <div className="cart-layout">
        {/* Danh sách sản phẩm */}
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={`${item.id}-${item.size}-${item.color}`}>
              <div className="cart-thumb">
                {item.image
                  ? <img src={item.image} alt={item.name} />
                  : <span>Ảnh</span>
                }
              </div>
              <div className="cart-info">
                <h4>{item.name}</h4>
                <p>
                  <span
                    className="color-preview"
                    style={{ background: item.color }}
                  />
                  Size: {item.size}
                </p>
                <div className="qty-control">
                  <button onClick={() => changeQty(item.id, item.size, item.color, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, item.size, item.color, +1)}>+</button>
                </div>
              </div>
              <div className="cart-item-right">
                <span className="item-price">{fmt(item.price * item.qty)}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id, item.size, item.color)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền + thanh toán */}
        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{fmt(total)}</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span>{total >= 500000 ? "Miễn phí" : fmt(30000)}</span>
          </div>
          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span>{fmt(total >= 500000 ? total : total + 30000)}</span>
          </div>
          <button className="btn-checkout" onClick={() => navigate("/checkout")}>Tiến hành thanh toán</button>
          <button className="btn-continue" onClick={() => navigate("/")}>
            ← Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
