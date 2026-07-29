import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../data/db";
import "../../pages/css/ShopSection.css";

const products = getProducts();
const catOptions = [...new Set(products.map((p) => p.cat))];
const sizeOptions = [...new Set(products.flatMap((p) => p.sizes || []))];
const colorOptions = [...new Set(products.flatMap((p) => p.colors || []))];
// Lấy giá cao nhất hiện có trong data, làm tròn lên 100.000đ để thanh range luôn bao hết sản phẩm
const MAX_PRICE = Math.ceil(Math.max(...products.map((p) => p.price || 0)) / 100000) * 100000 || 100000;
const PAGE_SIZE = 9; // số sản phẩm mỗi trang

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function ShopSection({ wishlist = [], toggleWish }) {
  const navigate = useNavigate();
  const [selectedCats, setSelectedCats]     = useState([]);
  const [selectedSizes, setSelectedSizes]   = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice]             = useState(MAX_PRICE);
  const [sortBy, setSortBy]                 = useState("featured");
  const [genderFilter, setGenderFilter] = useState("");
  const [subcatFilter, setSubcatFilter] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage]                     = useState(1);

  const toggleCat = (c) => {
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
    setPage(1); // đổi filter thì quay lại trang 1
  };

  const toggleSize = (s) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    setPage(1);
  };

  const toggleColor = (c) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
    setPage(1);
  };

  const handlePriceChange = (e) => {
    setMaxPrice(Number(e.target.value));
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(MAX_PRICE);
    setGenderFilter("");
    setSubcatFilter("");
    setQ("");
    setPage(1);
  };

  // Lọc theo danh mục, size, màu, giới tính, danh mục con, khoảng giá, tìm kiếm
  let filtered = products.filter((p) => {
    const matchCat   = selectedCats.length === 0 || selectedCats.includes(p.cat);
    const matchSize  = selectedSizes.length === 0 || (p.sizes||[]).some((s) => selectedSizes.includes(s));
    const matchColor = selectedColors.length === 0 || (p.colors||[]).some((c) => selectedColors.includes(c));
    const matchPrice = (p.price || 0) <= maxPrice;
    const matchGender = !genderFilter || (p.gender ? p.gender === genderFilter : true);
    const matchSubcat = !subcatFilter || (p.subcat ? p.subcat === subcatFilter : true);
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchSize && matchColor && matchPrice && matchGender && matchSubcat && matchQ;
  });

  if (sortBy === "price-asc")  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "newest")     filtered = [...filtered].reverse();

  // Phân trang thật: cắt mảng theo trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // tránh đứng ở trang rỗng khi filter thu hẹp danh sách
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="shop-section">
      <div className="shop-section-title">
        Tất cả sản phẩm. <span className="light">Tìm đúng món bạn cần.</span>
      </div>

      <div className="shop-layout">
        {/* Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-group">
            <h4>Danh mục <span className="chev">▾</span></h4>
            <div className="filter-options">
              {catOptions.map((c) => (
                <label key={c}>
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(c)}
                    onChange={() => toggleCat(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Kích cỡ <span className="chev">▾</span></h4>
            <div className="filter-options">
              {sizeOptions.map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(s)}
                    onChange={() => toggleSize(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Màu sắc <span className="chev">▾</span></h4>
            <div className="filter-swatches">
              {colorOptions.map((color) => (
                <span
                  key={color}
                  className={`swatch ${selectedColors.includes(color) ? "active" : ""}`}
                  style={{ background: color }}
                  title={color}
                  onClick={() => toggleColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Khoảng giá <span className="chev">▾</span></h4>
            <div className="price-range">
              <span>0đ</span>
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="10000"
                value={maxPrice}
                onChange={handlePriceChange}
              />
              <span>{fmt(maxPrice)}</span>
            </div>
          </div>

          <button className="btn-clear-filter" onClick={clearFilters}>
            Xóa tất cả bộ lọc
          </button>
        </aside>

        {/* Main */}
        <div className="shop-main">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select value={genderFilter} onChange={(e)=>setGenderFilter(e.target.value)}>
              <option value="">--Giới tính--</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
            <select value={subcatFilter} onChange={(e)=>setSubcatFilter(e.target.value)}>
              <option value="">--Danh mục--</option>
              {catOptions.map((c)=> <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Tìm kiếm sản phẩm..." value={q} onChange={(e)=>setQ(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e5e7f0' }} />
          </div>
          <div className="shop-toolbar">
            <span>Hiển thị {filtered.length} sản phẩm</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Sắp xếp: Nổi bật</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>

          {pageItems.length === 0 ? (
            <div className="empty">Không có sản phẩm phù hợp với bộ lọc.</div>
          ) : (
            <div className="product-grid">
              {pageItems.map((p) => (
                <div
                  className="product-card"
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className={`product-thumb ${p.image ? "has-image" : ""}`}>
                    {p.image
                      ? <img src={p.image} alt={p.name} className="product-img" />
                      : null /* không có ảnh → CSS hiện chữ "Ảnh sản phẩm" qua ::before */
                    }
                    {p.badge && <span className="product-badge">{p.badge}</span>}
                    <span
                      className={`product-wish ${wishlist.includes(p.id) ? "wished" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation(); // không cho click lan ra card (tránh nhảy vào trang sản phẩm)
                        toggleWish(p.id);
                      }}
                      title="Yêu thích"
                    >
                      {wishlist.includes(p.id) ? "♥" : "♡"}
                    </span>
                  </div>
                  <div className="product-info">
                    <p className="product-cat">{p.cat}</p>
                    <h4>{p.name}</h4>
                    <span className="product-price">
                      {fmt(p.price)}
                      {p.oldPrice && (
                        <span className="old-price">{fmt(p.oldPrice)}</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === currentPage ? "active" : ""}
                  onClick={() => goToPage(n)}
                >
                  {n}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
