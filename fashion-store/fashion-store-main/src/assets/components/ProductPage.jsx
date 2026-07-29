import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getProducts } from "../../data/db";
import "../../pages/css/ProductPage.css";

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function ProductPage({ addToCart, wishlist = [], toggleWish }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = getProducts();

  // Tìm sản phẩm theo id
  const product = products.find((p) => p.id === Number(id));

  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [added, setAdded]                 = useState(false);

  if (!product) {
    return (
      <div className="not-found">
        <p>Không tìm thấy sản phẩm.</p>
        <button onClick={() => navigate(-1)}>← Quay lại</button>
      </div>
    );
  }

  // Sản phẩm liên quan (cùng danh mục, trừ sản phẩm hiện tại)
  const related = products
    .filter((p) => p.cat === product.cat && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) { alert("Vui lòng chọn kích cỡ!"); return; }
    if (!selectedColor) { alert("Vui lòng chọn màu sắc!"); return; }
    addToCart(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>

      <div className="product-layout">
        {/* Ảnh sản phẩm */}
        <div className="product-gallery">
          <div className="main-img">
            {product.image
              ? <img src={product.image} alt={product.name} />
              : <span>Ảnh sản phẩm</span>
            }
            {product.badge && <span className="badge">{product.badge}</span>}
            {toggleWish && (
              <span
                className={`product-wish-btn ${wishlist.includes(product.id) ? "wished" : ""}`}
                title="Yêu thích"
                onClick={() => toggleWish(product.id)}
              >
                {wishlist.includes(product.id) ? "♥" : "♡"}
              </span>
            )}
          </div>
        </div>

        {/* Thông tin + chọn size/màu */}
        <div className="product-detail">
          <p className="detail-cat">{product.cat}</p>
          <h1>{product.name}</h1>

          <div className="detail-price">
            {fmt(product.price)}
            {product.oldPrice && (
              <span className="old-price">{fmt(product.oldPrice)}</span>
            )}
          </div>

          <p className="detail-desc">{product.desc}</p>

          {/* Chọn màu */}
          <div className="option-group">
            <label>Màu sắc {selectedColor && <span className="chosen">— đã chọn</span>}</label>
            <div className="color-list">
              {product.colors.map((c) => (
                <span
                  key={c}
                  className={`color-dot ${selectedColor === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Chọn size */}
          <div className="option-group">
            <label>Kích cỡ {selectedSize && <span className="chosen">— {selectedSize}</span>}</label>
            <div className="size-list">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${selectedSize === s ? "active" : ""}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Nút thêm giỏ hàng */}
          <button
            className={`btn-add-cart ${added ? "added" : ""}`}
            onClick={handleAddToCart}
          >
            {added ? "✓ Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
          </button>

          <button
            className="btn-buy-now"
            onClick={() => { handleAddToCart(); navigate("/cart"); }}
          >
            Mua ngay
          </button>

          {/* Thông tin thêm */}
          <div className="detail-meta">
            <p>🚚 Miễn phí vận chuyển cho đơn từ 500.000đ</p>
            <p>🔄 Đổi trả miễn phí trong 30 ngày</p>
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <div className="related">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-grid">
            {related.map((p) => (
              <div
                key={p.id}
                className="related-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="related-thumb">
                  {p.image ? <img src={p.image} alt={p.name} /> : <span>Ảnh</span>}
                </div>
                <h4>{p.name}</h4>
                <span>{fmt(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
