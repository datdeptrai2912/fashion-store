import { useParams, useNavigate } from "react-router-dom";
/* 
useParams — hook mới, chưa gặp ở component trước. Dùng để lấy các tham số động trên URL. 
Ví dụ nếu route định nghĩa là /category/:slug, thì khi user vào /category/ao-thun, useParams() trả về { slug: "ao-thun" }.
→ Điều này cho thấy trang này hiển thị theo từng danh mục cụ thể, danh mục nào được xác định qua URL (không phải cứng trong code)*/
import { useState, useEffect } from "react";
/*
useState: cái hộp lưu dữ liệu của component — khi dữ liệu trong hộp đổi, giao diện tự vẽ lại theo.
useEffect: chạy code sau khi giao diện đã hiện lên — dùng để gọi API lấy dữ liệu (vì gọi API mất thời gian, không "vẽ" ngay được).
Kết hợp: useEffect gọi API → lấy data → đổ vào useState → giao diện tự cập nhật hiển thị data thật.*/
import { getProducts } from "../../api/products";
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
  const navigate = useNavigate(); // chuẩn bị sẵn để điều hướng bằng code đâu đó bên dưới.
  const goBack = useSafeBack(); // 

  const [products, setProducts] = useState([]); 
  // products — khởi tạo [] (mảng rỗng), sẽ chứa danh sách sản phẩm sau khi gọi API getProducts thành công.
  const [loading, setLoading] = useState(true); 
  // loading — khởi tạo true (đang tải) — dùng để hiển thị trạng thái loading (ví dụ spinner hoặc chữ "Đang tải...") ngay từ đầu, trước khi API trả kết quả về. Khi API xong, sẽ có code gọi setLoading(false) để tắt trạng thái loading

  useEffect(() => {
    let alive = true;
    getProducts() 
      // getProducts() — hàm import từ api/products.js, trả về 1 Promise (chuẩn bất đồng bộ của JS khi gọi API)
      .then((data) => { if (alive) setProducts(data); })
      // Chỉ gọi setProducts(data) nếu alive vẫn còn true — tức component vẫn đang hiển thị trên màn hình
      .catch(() => { if (alive) setProducts([]); })
      // Không hiển thị lỗi cụ thể cho user, chỉ đơn giản coi như "không có sản phẩm nào" (mảng rỗng)
      .finally(() => { if (alive) setLoading(false); });
      // Tắt trạng thái loading — vì dù kết quả là thành công hay lỗi thì cũng đã "xong việc tải", không cần hiện loading nữa
    return () => { alive = false; };
  }, []);

  // Lọc sản phẩm theo slug
  let filtered = products;
  // Khai báo biến filtered, gán ban đầu bằng chính products (toàn bộ danh sách chưa lọc gì cả)
  const catName = slugToCategory[slug];
  // Tra cứu trong object slugToCategory đã phân tích trước đó, 
   // dùng slug (lấy từ URL qua useParams()) làm key để lấy ra tên danh mục hiển thị.
  const genderName = slugToGender[slug];
  // Tương tự, nhưng tra trong slugToGender.
  // Ví dụ: nếu slug = "nu" → genderName = "Nữ". Nếu slug = "ao"

  if (slug === "sale") {
    filtered = products.filter((p) => p.oldPrice !== null);
    /*Nếu slug chính xác bằng chuỗi "sale" → lọc sản phẩm đang giảm giá.
Điều kiện lọc: p.oldPrice !== null — mỗi sản phẩm p có thuộc tính oldPrice (giá cũ, trước giảm). Nếu oldPrice khác null (tức có giá trị, ví dụ 500000) 
→ nghĩa là sản phẩm này đang giảm giá (có giá cũ để so sánh với giá hiện tại).*/
  } else if (slug === "moi") {
    filtered = products.filter((p) => p.badge === "Mới") ;
    /*Nếu slug === "moi" → lọc sản phẩm mới về.
Điều kiện: p.badge === "Mới" — mỗi sản phẩm có thuộc tính badge (nhãn/tag hiển thị, ví dụ để hiện icon "Mới" trên ảnh sản phẩm ở trang danh sách). 
So sánh bằng đúng chuỗi "Mới"*/
  } else if (genderName) {
    filtered = products.filter(
      (p) => p.gender === genderName || p.gender === "Unisex"
    );
    //Nếu không rơi vào 2 trường hợp trên, và genderName có giá trị (tức slug là "nu" hoặc "nam", tra ra được từ slugToGender) → lọc theo giới tính
  } else if (catName) {
    filtered = products.filter((p) => p.cat === catName);
  }
/*
Nếu không rơi vào 3 trường hợp trên, và catName có giá trị (tức slug là "ao", "quan"... tra ra được từ slugToCategory) 
→ lọc theo danh mục sản phẩm (p.cat khớp đúng với catName, ví dụ p.cat === "Áo")*/
  // Tên hiển thị trên trang
  const pageTitle = {
    "ao": "Áo", "quan": "Quần", "giay": "Giày",
    "tui-xach": "Túi xách", "phu-kien": "Phụ kiện",
    "ao-khoac": "Áo khoác", "vay-dam": "Váy / Đầm",
    "mu-non": "Mũ nón", "do-boi": "Đồ bơi",
    "nu": "Thời trang nữ", "nam": "Thời trang nam",
    "sale": "Sale", "moi": "Bộ sưu tập mới",
  }[slug] || "Sản phẩm";
// Đây là 1 bảng map thứ 3, riêng cho mục đích tiêu đề trang (page title) — có phần trùng lặp dữ liệu với slugToCategory và slugToGender đã có ở trên (ví dụ "ao": "Áo" xuất hiện y hệt ở cả slugToCategory lẫn ở đây)
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
      {loading ? (
        <div className="empty">Đang tải sản phẩm...</div>
      ) : filtered.length === 0 ? (
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
