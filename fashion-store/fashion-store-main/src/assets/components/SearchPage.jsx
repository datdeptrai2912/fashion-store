import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../data/db";
import "../../pages/css/SearchPage.css";

const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);
  const products = getProducts();

  // Lọc sản phẩm theo từ khóa (tên + danh mục + mô tả)
  const results = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.cat.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Khi nhấn Enter hoặc click tìm
  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  return (
    <div className="search-page">
      {/* Ô tìm kiếm lớn */}
      <div className="search-hero">
        <h1>Tìm kiếm</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm sản phẩm, danh mục..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Tìm →</button>
        </form>

        {/* Gợi ý nhanh */}
        <div className="quick-tags">
          {["Áo", "Quần", "Váy", "Giày", "Sale", "Mới"].map((tag) => (
            <span
              key={tag}
              className="tag"
              onClick={() => {
                setInput(tag);
                setSearchParams({ q: tag });
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Kết quả */}
      {query && (
        <div className="search-results">
          <p className="result-count">
            {results.length > 0
              ? `Tìm thấy ${results.length} sản phẩm cho "${query}"`
              : `Không tìm thấy kết quả nào cho "${query}"`}
          </p>

          {results.length > 0 ? (
            <div className="search-grid">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="search-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="search-thumb">
                    {p.image
                      ? <img src={p.image} alt={p.name} />
                      : <span>Ảnh sản phẩm</span>
                    }
                    {p.badge && <span className="badge">{p.badge}</span>}
                  </div>
                  <div className="search-info">
                    <p className="search-cat">{p.cat}</p>
                    <h4>{p.name}</h4>
                    <p className="search-desc">{p.desc}</p>
                    <div className="search-colors">
                      {p.colors.map((c) => (
                        <span key={c} className="dot" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="search-price">
                      {fmt(p.price)}
                      {p.oldPrice && <span className="old">{fmt(p.oldPrice)}</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-result">
              <p>Thử tìm với từ khóa khác hoặc duyệt theo danh mục.</p>
              <button onClick={() => navigate("/")}>← Về trang chủ</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
