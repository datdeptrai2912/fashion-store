import { useNavigate } from "react-router-dom";
import { getProducts } from "../../data/db";
import "../../pages/css/WishlistPage.css";

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function WishlistPage({ wishlist, toggleWish }) {
  const navigate = useNavigate();
  const products = getProducts();

  // Lấy thông tin đầy đủ của các sản phẩm có trong wishlist
  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="cat-page">
      <div className="cat-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
        <h1>Sản phẩm yêu thích</h1>
        <p className="sub">
          {wishedProducts.length} sản phẩm. <span>Những món bạn đã lưu lại.</span>
        </p>
      </div>

      {wishedProducts.length === 0 ? (
        <div className="empty">
          Bạn chưa thích sản phẩm nào.<br />
          Nhấn ♡ trên sản phẩm bạn thích để lưu vào đây.
        </div>
      ) : (
        <div className="cat-product-grid">
          {wishedProducts.map((p) => (
            <div className="cat-product-card" key={p.id}>
              <div
                className="cat-thumb"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <span>Ảnh sản phẩm</span>
                }
                {p.badge && <span className="badge">{p.badge}</span>}
                <span
                  className="wish-remove"
                  title="Xóa khỏi yêu thích"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWish(p.id);
                  }}
                >
                  ♥
                </span>
              </div>
              <div
                className="cat-info"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <p className="cat-label">{p.cat}</p>
                <h4>{p.name}</h4>
                <div className="cat-colors">
                  {p.colors.map((c) => (
                    <span key={c} className="dot" style={{ background: c }} />
                  ))}
                </div>
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
