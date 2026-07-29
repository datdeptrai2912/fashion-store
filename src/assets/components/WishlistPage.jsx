import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import useSafeBack from "../../utils/useSafeBack"; // custom hook tự viết, xử lý nút "Quay lại" an toàn (tránh back ra khỏi app nếu không có history trước đó)
import "../../pages/css/WishlistPage.css";

// Format giá tiền kiểu VN, ví dụ 850000 -> "850.000đ"
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

// Nhận 2 props từ component cha: wishlist (mảng id sản phẩm đã thích)
// và toggleWish (hàm thêm/xóa 1 sản phẩm khỏi wishlist) — state wishlist
// được quản lý ở tầng trên (App.jsx), component này chỉ đọc + gọi hàm thay đổi nó
export default function WishlistPage({ wishlist, toggleWish }) {
  const navigate = useNavigate();
  const goBack = useSafeBack();

  const [products, setProducts] = useState([]); // toàn bộ danh sách sản phẩm lấy từ API
  const [loading, setLoading] = useState(true); // cờ loading trong lúc chờ fetch

  useEffect(() => {
    // Cờ "alive" chống race condition/memory leak: nếu component unmount
    // trước khi fetch xong thì không setState nữa
    let alive = true;

    getProducts()
      .then((data) => { if (alive) setProducts(data); })
      .catch(() => { if (alive) setProducts([]); })
      // finally đảm bảo loading luôn được tắt dù thành công hay lỗi
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, []); // [] => chỉ fetch 1 lần khi mount

  // Lấy thông tin đầy đủ của các sản phẩm có trong wishlist
  // Component chỉ nhận mảng id (wishlist) từ props, nên phải lọc từ
  // toàn bộ danh sách "products" đã fetch để lấy đủ thông tin hiển thị (tên, ảnh, giá...)
  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="cat-page">
      {/* Header trang: nút quay lại + tiêu đề + đếm số lượng sản phẩm yêu thích */}
      <div className="cat-page-header">
        <button className="back-btn" onClick={goBack}>← Quay lại</button>
        <h1>Sản phẩm yêu thích</h1>
        <p className="sub">
          {wishedProducts.length} sản phẩm. <span>Những món bạn đã lưu lại.</span>
        </p>
      </div>

      {/* Render có điều kiện theo 3 trạng thái: đang tải / rỗng / có dữ liệu */}
      {loading ? (
        <div className="empty">Đang tải sản phẩm...</div>
      ) : wishedProducts.length === 0 ? (
        <div className="empty">
          Bạn chưa thích sản phẩm nào.<br />
          Nhấn ♡ trên sản phẩm bạn thích để lưu vào đây.
        </div>
      ) : (
        <div className="cat-product-grid">
          {wishedProducts.map((p) => (
            <div className="cat-product-card" key={p.id}>

              {/* Vùng ảnh sản phẩm, click vào để xem chi tiết */}
              <div
                className="cat-thumb"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                {/* Hiện ảnh thật nếu có, không thì hiện placeholder text */}
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <span>Ảnh sản phẩm</span>
                }

                {/* Badge góc trên (Mới/Sale/Hot) chỉ hiện nếu sản phẩm có badge */}
                {p.badge && <span className="badge">{p.badge}</span>}

                {/* Nút trái tim xóa khỏi wishlist ngay tại trang này (không cần vào trang chi tiết) */}
                <span
                  className="wish-remove"
                  title="Xóa khỏi yêu thích"
                  onClick={(e) => {
                    // stopPropagation bắt buộc phải có: chặn sự kiện click nổi bọt lên
                    // div cha "cat-thumb" (đang có onClick điều hướng sang trang chi tiết),
                    // nếu không, bấm xóa sẽ vô tình bị điều hướng luôn
                    e.stopPropagation();
                    toggleWish(p.id);
                  }}
                >
                  ♥
                </span>
              </div>

              {/* Vùng thông tin sản phẩm (tên, danh mục, màu, giá), cũng click để xem chi tiết */}
              <div
                className="cat-info"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <p className="cat-label">{p.cat}</p>
                <h4>{p.name}</h4>

                {/* Render các chấm màu tương ứng với biến thể màu sắc của sản phẩm */}
                <div className="cat-colors">
                  {p.colors.map((c) => (
                    <span key={c} className="dot" style={{ background: c }} />
                  ))}
                </div>

                {/* Giá hiện tại, kèm giá cũ gạch ngang nếu có (đang giảm giá) */}
                <span className="price">
                  {fmt(p.price)}
                  {p.oldPrice && <span className="old">{fmt(p.oldPrice)}</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
