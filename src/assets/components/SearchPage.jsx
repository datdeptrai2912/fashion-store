import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../api/products";
import "../../pages/css/SearchPage.css";

// Format tiền tệ kiểu Việt Nam, ví dụ 850000 -> "850.000đ"
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

export default function SearchPage() {
  // useSearchParams: hook của react-router-dom để đọc/ghi query string trên URL
  // (ví dụ /search?q=áo). Trả về mảng [searchParams, setSearchParams] giống useState,
  // nhưng "searchParams" là đồng bộ trực tiếp với URL — khi đổi nó, URL trên trình duyệt
  // cũng đổi theo (và ngược lại, back/forward trình duyệt cũng làm searchParams đổi theo)
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy giá trị query "q" hiện tại từ URL, ví dụ /search?q=áo -> query = "áo"
  // Nếu không có param "q" nào (ví dụ vào thẳng /search), fallback về chuỗi rỗng
  const query = searchParams.get("q") || "";

  // "input" là state cục bộ riêng cho Ô NHẬP LIỆU, TÁCH BIỆT với "query" (lấy từ URL).
  // Lý do cần tách 2 state này: "query" chỉ đổi khi submit form (bấm Enter/nút Tìm),
  // còn "input" đổi ngay mỗi lần gõ phím — nếu dùng chung 1 state với query/URL,
  // mỗi ký tự gõ vào sẽ kích hoạt việc đổi URL ngay lập tức, gây fetch lại/re-render
  // dư thừa và làm lịch sử trình duyệt (browser history) bị spam quá nhiều entry.
  // Khởi tạo input = query để nếu người dùng vào thẳng link có sẵn ?q=..., ô input
  // sẽ hiện sẵn đúng từ khóa đó thay vì trống trơn.
  const [input, setInput] = useState(query);

  const [products, setProducts] = useState([]); // toàn bộ danh sách sản phẩm lấy từ API
  const [loading, setLoading] = useState(true); // cờ loading trong lúc chờ fetch

  useEffect(() => {
    // Cờ "alive" chống setState sau khi unmount (race condition), pattern quen thuộc
    // đã thấy lặp lại ở nhiều component khác trong dự án (WishlistPage, ProductPage, MosaicGrid)
    let alive = true;

    getProducts()
      .then((data) => { if (alive) setProducts(data); })
      .catch(() => { if (alive) setProducts([]); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, []); // [] => chỉ fetch 1 lần khi mount, KHÔNG phụ thuộc vào "query" —
  // vì đây là fetch TOÀN BỘ sản phẩm, còn việc lọc theo từ khóa được xử lý
  // hoàn toàn ở phía client (dòng "results" bên dưới), không cần gọi lại API mỗi lần search

  // Lọc sản phẩm theo từ khóa (tên + danh mục + mô tả)
  // Đây là tìm kiếm phía CLIENT (client-side filter), không phải gọi API search riêng —
  // phù hợp khi tổng số sản phẩm không quá lớn (toàn bộ đã có sẵn trong "products")
  const results = query.trim()
    // .toLowerCase() ở cả 2 vế (query và từng field sản phẩm) để so khớp
    // không phân biệt chữ hoa/thường (ví dụ "Áo" và "áo" đều khớp)
    // Dùng includes() (không phải so khớp chính xác toàn bộ chuỗi) nên
    // tìm kiếm dạng "chứa từ khóa ở bất kỳ đâu trong chuỗi" (partial match)
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.cat.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
      )
    // Nếu query rỗng (chưa search gì), trả về mảng rỗng thay vì hiện toàn bộ sản phẩm —
    // tránh trường hợp trang search hiện sẵn cả catalog khi người dùng chưa nhập gì
    : [];

  // Khi nhấn Enter hoặc click tìm
  const handleSearch = (e) => {
    e.preventDefault(); // chặn reload trang mặc định của form

    // Chỉ update URL (qua setSearchParams) nếu input có nội dung thật sự (sau khi trim)
    // Việc gọi setSearchParams sẽ tự động cập nhật lại "query" ở lần render tiếp theo
    // (vì query được đọc trực tiếp từ searchParams.get("q")), kích hoạt "results" tính lại
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  return (
    <div className="search-page">

      {/* ===== Ô tìm kiếm lớn (search hero) ===== */}
      <div className="search-hero">
        <h1>Tìm kiếm</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm sản phẩm, danh mục..."
            value={input} // controlled input, gắn với state "input" (KHÔNG phải "query")
            onChange={(e) => setInput(e.target.value)}
            autoFocus // tự động focus vào ô này ngay khi trang search vừa load, tiện cho người dùng gõ ngay
          />
          <button type="submit">Tìm →</button>
        </form>

        {/* ===== Gợi ý nhanh (quick tags) ===== */}
        {/* Mảng tag cố định, khai báo trực tiếp inline trong JSX (không phải hằng số
            khai báo riêng ở ngoài như "layout" trong MosaicGrid hay "navLinks" trong Navbar) —
            nghĩa là mảng này bị tạo lại mỗi lần component re-render, tuy nhiên với
            mảng nhỏ cố định 6 phần tử thì ảnh hưởng hiệu năng gần như không đáng kể */}
        <div className="quick-tags">
          {["Áo", "Quần", "Váy", "Giày", "Sale", "Mới"].map((tag) => (
            <span
              key={tag}
              className="tag"
              onClick={() => {
                // Bấm vào tag gợi ý sẽ làm 2 việc CÙNG LÚC:
                // 1. Cập nhật luôn ô input hiển thị đúng tag vừa bấm (đồng bộ UI)
                setInput(tag);
                // 2. Set luôn searchParams để trigger search ngay lập tức,
                //    KHÔNG cần người dùng phải bấm thêm nút "Tìm →"
                //    (khác với gõ tay, phải submit form mới search)
                setSearchParams({ q: tag });
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Khu vực kết quả ===== */}
      {/* Chỉ render toàn bộ khối kết quả nếu "query" có giá trị (đã từng search ít nhất 1 lần) —
          nếu người dùng mới vào trang, chưa gõ gì, khối này ẩn hoàn toàn, chỉ hiện search-hero ở trên */}
      {query && (
        <div className="search-results">

          {/* Dòng thông báo số lượng kết quả — có 3 trạng thái khác nhau tùy loading/có kết quả/không có kết quả,
              dùng toán tử 3 ngôi lồng nhau (nested ternary) để chọn đúng câu hiển thị */}
          <p className="result-count">
            {loading
              ? "Đang tải sản phẩm..."
              : results.length > 0
                ? `Tìm thấy ${results.length} sản phẩm cho "${query}"`
                : `Không tìm thấy kết quả nào cho "${query}"`}
          </p>

          {results.length > 0 ? (
            // ===== NHÁNH CÓ KẾT QUẢ: hiện lưới sản phẩm =====
            <div className="search-grid">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="search-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="search-thumb">
                    {/* Hiện ảnh thật nếu có, không thì placeholder text */}
                    {p.image
                      ? <img src={p.image} alt={p.name} />
                      : <span>Ảnh sản phẩm</span>
                    }
                    {/* Badge chỉ hiện nếu sản phẩm có (Mới/Sale/Hot) */}
                    {p.badge && <span className="badge">{p.badge}</span>}
                  </div>

                  <div className="search-info">
                    <p className="search-cat">{p.cat}</p>
                    <h4>{p.name}</h4>
                    <p className="search-desc">{p.desc}</p>

                    {/* Chấm màu tương ứng các biến thể màu sắc của sản phẩm */}
                    <div className="search-colors">
                      {p.colors.map((c) => (
                        <span key={c} className="dot" style={{ background: c }} />
                      ))}
                    </div>

                    {/* Giá hiện tại + giá cũ gạch ngang nếu có giảm giá */}
                    <span className="search-price">
                      {fmt(p.price)}
                      {p.oldPrice && <span className="old">{fmt(p.oldPrice)}</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ===== NHÁNH KHÔNG CÓ KẾT QUẢ: hiện thông báo + gợi ý quay về trang chủ =====
            // Chỉ hiện nhánh này khi results.length === 0 VÀ không phải đang loading
            // (vì nếu đang loading, dòng result-count phía trên đã hiện "Đang tải..." rồi,
            // nhưng lưu ý: nhánh này VẪN render dù đang loading, vì điều kiện chỉ check
            // results.length > 0, không check thêm "!loading" — nghĩa là trong lúc đang tải,
            // "Thử tìm với từ khóa khác..." có thể hiện ra trong tích tắc trước khi có dữ liệu thật,
            // đây là điểm nhỏ có thể cải thiện nếu muốn UX mượt hơn, tránh nhấp nháy nội dung sai)
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
