import { useNavigate } from "react-router-dom"; 
// hook của thư viện  react-router-dom dùng để điều hướng - dùng cho các hành động cần chuyển trang 
// ví dụ như là thanh toán - đăng nhập thành công chuyển sang trang khác 
import "../../pages/css/CartPage.css"; 

// nap file css của riêng page này vào  
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";
// hàm format tiền tệ - dùng buit-in của js qua tolacaleString("vi-VN") để tự động thêm dấu chấm ngăn cách hàng nghìn ví dụ 250000 -> 250.000 

export default function CartPage({ cart, setCart }) {
  /* default
Kết hợp với export thành export default — nghĩa là "đây là thứ được xuất ra mặc định (chính) của file này".
Mỗi file chỉ được có duy nhất 1 export default 
CartPage — đây chính là React Component.
*/
  const navigate = useNavigate();
/* Đây là hook đã import ở đầu file (import { useNavigate } from "react-router-dom").
Khi gọi hàm useNavigate() (có dấu ()), nó sẽ trả về một hàm khác — hàm dùng để điều hướng trang*/
  // Tăng / giảm số lượng
  const changeQty = (id, size, color, delta) => {
    setCart((prev) =>
      prev
        .map((i) => // duyệt qua từng item, cập nhật số lượng
          i.id === id && i.size === size && i.color === color
          // Điều kiện so khớp: i.id === id && i.size === size && i.color === color — kiểm tra cả 3 thuộc tính khớp mới coi là đúng item cần sửa (dùng && — phải đúng hết cả 3)
            ? { ...i, qty: i.qty + delta }
          // Nếu khớp → trả về object mới: { ...i, qty: i.qty + delta }
            : i // nếu không giữ nguyên giá trị i và trả về  
        )
        .filter((i) => i.qty > 0) // xóa nếu qty = 0
    );
  };

  // Xóa 1 item
  const removeItem = (id, size, color) => { 
    // arrow function gồm 3 tham số 
    setCart((prev) => 
       // gọi hàm setCart 
      prev.filter((i) => !(i.id === id && i.size === size && i.color === color))
            // → Duyệt qua từng item, giữ lại những item không phải là item cần xóa → tác dụng: xóa đúng 1 item cụ thể khỏi mảng.
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
// .reduce() — method mảng dùng để "gộp" nhiều phần tử thành 1 giá trị duy nhất
  // .reduce() — method mảng dùng để "gộp" nhiều phần tử thành 1 giá trị duy nhất

 /*Cú pháp: mảng.reduce((accumulator, currentItem) => ..., giá trị khởi tạo)

sum — accumulator (bộ tích lũy), giữ giá trị tổng đang cộng dồn qua từng vòng lặp.
i — phần tử hiện tại đang xét trong mảng cart.
sum + i.price * i.qty — công thức cộng dồn: lấy tổng hiện tại + (giá tiền × số lượng) của item hiện tại. */
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
          {
            /*Duyệt qua từng sản phẩm trong cart, với mỗi sản phẩm tạo ra 1 khối <div class="cart-item"> riêng,
            gắn key duy nhất để React quản lý danh sách hiệu quả.
            Phần bên trong <div> (hiển thị ảnh, tên, giá, nút +/-, nút xóa...) chưa thấy — bạn gửi tiếp phần code bên dưới để phân tích tiếp nhé.*/
            cart.map((item) => (
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
                  // Giống hệt nút giảm, chỉ khác delta = +1 (dấu + ở đây chỉ để nhấn mạnh số dương, về mặt kỹ thuật viết 1 cũng y hệt)
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
