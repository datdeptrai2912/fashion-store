import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../data/db";
import useSafeBack from "../../utils/useSafeBack";
import "../../pages/css/CategoryPage.css";

// Map slug URL → tên danh mục trong data
const slugToCategory = {
  "ao":        "Áo",
  "quan":      "Quần",
  "giay":      "Giày",
  "tui-xach":  "Phụ kiện",
  "phu-kien":  "Phụ kiện",
  "ao-khoac":  "Áo khoác",
  "vay-dam":   "Váy / Đầm",
  "mu-non":    "Mũ nón",
  "do-boi":    "Đồ bơi",
  "sale":      "sale",
  "moi":       "moi",
};

// Slug "nu"/"nam" lọc theo giới tính (gender), sản phẩm "Unisex" hiện ở cả hai
const slugToGender = {
  "nu":  "Nữ",
  "nam": "Nam",
};

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function CategoryPage({ addToCart, wishlist = [], toggleWish }) {
  const { slug } = useParams();   // lấy slug từ URL
  const navigate = useNavigate();
  const goBack = useSafeBack();
  const products = getProducts();

  // Lọc sản phẩm theo slug
  let filtered = products;
  const catName = slugToCategory[slug];
  const genderName = slugToGender[slug];

  if (slug === "sale") {
    filtered = products.filter((p) => p.oldPrice !== null);
  } else if (slug === "moi") {
    filtered = products.filter((p) => p.badge === "Mới");
  } else if (genderName) {
    filtered = products.filter(
      (p) => p.gender === genderName || p.gender === "Unisex"
    );
  } else if (catName) {
    filtered = products.filter((p) => p.cat === catName);
  }

  // Tên hiển thị trên trang
  const pageTitle = {
    "ao": "Áo", "quan": "Quần", "giay": "Giày",
    "tui-xach": "Túi xách", "phu-kien": "Phụ kiện",
    "ao-khoac": "Áo khoác", "vay-dam": "Váy / Đầm",
    "mu-non": "Mũ nón", "do-boi": "Đồ bơi",
    "nu": "Thời trang nữ", "nam": "Thời trang nam",
    "sale": "Sale", "moi": "Bộ sưu tập mới",
  }[slug] || "Sản phẩm";

  return (
    <div className="cat-page">
      {/* Header trang danh mục */}
      <div className="cat-page-header">
        <button className="back-btn" onClick={goBack}>← Quay lại</button>
        <h1>{pageTitle}</h1>
        <p className="sub">
          {filtered.length} sản phẩm. <span>Hãy chọn mẫu bạn thích.</span>
        </p>
      </div>

      {/* Lưới sản phẩm */}
      {filtered.length === 0 ? (
        <div className="empty">Chưa có sản phẩm trong danh mục này.</div>
      ) : (
        <div className="cat-product-grid">
          {filtered.map((p) => (
            <div
              className="cat-product-card"
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <div className="cat-thumb">
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <span>Ảnh sản phẩm</span>
                }
                {p.badge && <span className="badge">{p.badge}</span>}
                {toggleWish && (
                  <span
                    className={`cat-wish ${wishlist.includes(p.id) ? "wished" : ""}`}
                    title="Yêu thích"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWish(p.id);
                    }}
                  >
                    {wishlist.includes(p.id) ? "♥" : "♡"}
                  </span>
                )}
              </div>
              <div className="cat-info">
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
