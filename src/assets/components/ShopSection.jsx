import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../api/products";
import "../../pages/css/ShopSection.css";

const PAGE_SIZE = 9; // số sản phẩm mỗi trang — hằng số cấu hình phân trang, đặt ở top-level để dễ chỉnh 1 chỗ duy nhất

// Format tiền tệ kiểu Việt Nam, ví dụ 850000 -> "850.000đ"
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

// Nhận props: wishlist (mảng id sản phẩm đã thích, default = [] để an toàn khi cha
// chưa kịp truyền), toggleWish (hàm thêm/xóa khỏi wishlist, state quản lý ở tầng cha)
export default function ShopSection({ wishlist = [], toggleWish }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]); // toàn bộ sản phẩm lấy từ API (chưa lọc)
  const [loading, setLoading] = useState(true); // cờ loading khi đang chờ fetch

  // Tải danh sách sản phẩm từ server 1 lần khi component mount
  useEffect(() => {
    // Cờ "alive" chống setState sau khi unmount, pattern lặp lại quen thuộc trong dự án
    let alive = true;
    getProducts()
      .then((data) => { if (alive) setProducts(data); })
      .catch(() => { if (alive) setProducts([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []); // [] => chỉ chạy 1 lần lúc mount

  // ===== Các tùy chọn lọc được suy ra (derive) từ danh sách sản phẩm đã tải =====
  // useMemo: chỉ tính lại các mảng này khi "products" thay đổi, tránh tính toán lại
  // (duyệt toàn bộ mảng sản phẩm) mỗi lần component re-render vì lý do khác (ví dụ đổi filter)

  // [...new Set(...)]: lấy danh sách category KHÔNG TRÙNG LẶP từ toàn bộ sản phẩm
  // (Set tự động loại bỏ giá trị trùng, spread ra lại thành mảng thường)
  const catOptions = useMemo(() => [...new Set(products.map((p) => p.cat))], [products]);

  // flatMap: với mỗi sản phẩm lấy mảng "sizes" của nó rồi "làm phẳng" (gộp) tất cả
  // các mảng con lại thành 1 mảng lớn duy nhất, sau đó loại trùng bằng Set —
  // ví dụ sản phẩm A có sizes ["S","M"], sản phẩm B có ["M","L"] => kết quả ["S","M","L"]
  const sizeOptions = useMemo(() => [...new Set(products.flatMap((p) => p.sizes || []))], [products]);
  const colorOptions = useMemo(() => [...new Set(products.flatMap((p) => p.colors || []))], [products]);

  // Lấy giá cao nhất hiện có trong data, làm tròn lên 100.000đ để thanh range luôn bao hết sản phẩm
  // Math.max(0, ...products.map(...)): thêm 0 vào đầu để tránh Math.max() trả về -Infinity
  // khi mảng products rỗng (Math.max() không tham số trả -Infinity, dễ gây lỗi tính toán sau đó)
  // Chia cho 100000 rồi Math.ceil rồi nhân lại 100000: làm tròn LÊN tới bội số gần nhất của 100.000
  // (ví dụ giá cao nhất là 850.000 -> MAX_PRICE = 900.000, đảm bảo thanh range luôn đủ khoảng cho sản phẩm đắt nhất)
  // "|| 100000" cuối cùng: fallback nếu kết quả tính ra là 0 (ví dụ chưa có sản phẩm nào),
  // tránh MAX_PRICE = 0 khiến thanh range bị vô nghĩa (min=max=0)
  const MAX_PRICE = useMemo(
    () => Math.ceil(Math.max(0, ...products.map((p) => p.price || 0)) / 100000) * 100000 || 100000,
    [products]
  );

  // ===== State cho các bộ lọc =====
  const [selectedCats, setSelectedCats]     = useState([]); // mảng category đang được tick chọn
  const [selectedSizes, setSelectedSizes]   = useState([]); // mảng size đang được tick chọn
  const [selectedColors, setSelectedColors] = useState([]); // mảng màu đang được chọn
  const [maxPrice, setMaxPrice]             = useState(null); // giá tối đa từ thanh range, null = chưa khởi tạo (chờ MAX_PRICE tính xong)
  const [sortBy, setSortBy]                 = useState("featured"); // kiểu sắp xếp đang chọn
  const [genderFilter, setGenderFilter]     = useState(""); // lọc theo giới tính ("", "Nam", "Nữ")
  const [subcatFilter, setSubcatFilter]     = useState(""); // lọc theo danh mục con (dropdown riêng, TRÙNG CHỨC NĂNG với checkbox catOptions ở sidebar — xem ghi chú bên dưới phần filter)
  const [q, setQ]                           = useState(""); // từ khóa tìm kiếm nhanh (input riêng trong ShopSection, khác với trang SearchPage)
  const [page, setPage]                     = useState(1); // trang hiện tại của phân trang

  // Khi MAX_PRICE được tính ra từ dữ liệu tải về, đặt giá trị mặc định cho thanh range
  // Effect này CHỈ chạy set maxPrice đúng 1 lần đầu tiên khi có dữ liệu (điều kiện maxPrice === null
  // đảm bảo không ghi đè lại giá trị mà người dùng đã tự kéo thanh range sau đó, kể cả khi
  // MAX_PRICE có tính toán lại do products đổi — thực tế products chỉ fetch 1 lần nên MAX_PRICE
  // cũng chỉ đổi 1 lần duy nhất, effect này thực chất chỉ chạy đúng 1 lần trong vòng đời component)
  useEffect(() => {
    if (maxPrice === null && MAX_PRICE) {
      setMaxPrice(MAX_PRICE);
    }
  }, [MAX_PRICE, maxPrice]);

  // Giá trị "hiệu lực" thực sự dùng để lọc/hiển thị: nếu maxPrice chưa được khởi tạo (null,
  // tức là useEffect trên chưa kịp chạy ở lần render đầu tiên), tạm dùng MAX_PRICE làm giá trị hiển thị
  // ngay lập tức, tránh thanh range bị hiện giá trị 0/undefined trong khoảnh khắc đầu khi trang vừa load
  const effectiveMaxPrice = maxPrice === null ? MAX_PRICE : maxPrice;

  // ===== Các hàm toggle chọn/bỏ chọn filter (checkbox) =====
  // Cả 3 hàm dưới đây dùng chung 1 pattern: nếu giá trị đã có trong mảng thì loại nó ra (filter),
  // nếu chưa có thì thêm vào cuối mảng (spread + giá trị mới) — đây là cách toggle chuẩn cho
  // multi-select checkbox trong React, dùng functional update (prev => ...) để đảm bảo
  // luôn thao tác trên giá trị state MỚI NHẤT, tránh bug khi có nhiều lần gọi setState liên tiếp
  const toggleCat = (c) => {
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
    setPage(1); // đổi filter thì quay lại trang 1 — tránh trường hợp đang ở trang 5 rồi lọc còn 2 trang, bị "kẹt" ở trang rỗng
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

  // Xử lý kéo thanh range giá — input type="range" trả về string, cần Number() ép kiểu lại
  const handlePriceChange = (e) => {
    setMaxPrice(Number(e.target.value));
    setPage(1);
  };

  // Reset toàn bộ bộ lọc về mặc định ban đầu, kể cả trang về lại trang 1
  const clearFilters = () => {
    setSelectedCats([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(MAX_PRICE); // reset về giá cao nhất (tức là không giới hạn giá)
    setGenderFilter("");
    setSubcatFilter("");
    setQ("");
    setPage(1);
  };

  // ===== LỌC DỮ LIỆU =====
  // Khai báo bằng "let" (không phải const) vì biến này sẽ bị GÁN LẠI (reassign) ngay sau đó
  // ở phần sort bên dưới (filtered = [...filtered].sort(...)) — đây là lý do duy nhất cần "let"
  let filtered = products.filter((p) => {
    // matchCat: nếu KHÔNG có category nào được chọn (mảng rỗng) thì coi như match tất cả (không lọc gì);
    // ngược lại chỉ match nếu category của sản phẩm nằm trong danh sách đã chọn
    const matchCat   = selectedCats.length === 0 || selectedCats.includes(p.cat);
    // matchSize: sản phẩm có ít nhất 1 size trong danh sách sizes của nó TRÙNG với size đã chọn
    // (.some(): chỉ cần 1 phần tử thỏa điều kiện là đủ, không cần TẤT CẢ size đều khớp)
    const matchSize  = selectedSizes.length === 0 || (p.sizes||[]).some((s) => selectedSizes.includes(s));
    const matchColor = selectedColors.length === 0 || (p.colors||[]).some((c) => selectedColors.includes(c));
    // matchPrice: giá sản phẩm phải <= giá tối đa đang chọn trên thanh range
    const matchPrice = (p.price || 0) <= effectiveMaxPrice;
    // matchGender: nếu chưa chọn giới tính (rỗng) thì match tất cả; nếu có chọn thì sản phẩm
    // phải đúng giới tính đó HOẶC là sản phẩm Unisex (áp dụng được cho cả 2 giới)
    const matchGender =
      !genderFilter || p.gender === genderFilter || p.gender === "Unisex";
    // matchSubcat: lọc theo dropdown "Danh mục" riêng ở khu vực toolbar chính —
    // LƯU Ý: đây là bộ lọc TRÙNG chức năng với checkbox "Danh mục" ở sidebar (catOptions/selectedCats),
    // chỉ khác là 1 cái cho phép chọn NHIỀU category (checkbox sidebar), còn cái này chỉ chọn được
    // 1 category DUY NHẤT (dropdown). Cả 2 điều kiện matchCat và matchSubcat đều phải TRUE cùng lúc
    // (nối bằng && ở dòng return cuối) — nghĩa là nếu người dùng chọn category khác nhau ở 2 nơi này,
    // kết quả có thể ra RỖNG dù ý người dùng chỉ muốn lọc theo 1 trong 2. Đây là điểm dễ gây
    // nhầm lẫn UX, nên cân nhắc hợp nhất 2 bộ lọc category thành 1 nguồn duy nhất.
    const matchSubcat = !subcatFilter || p.cat === subcatFilter;
    // matchQ: tìm kiếm nhanh riêng trong ShopSection, chỉ tìm theo TÊN sản phẩm (khác SearchPage
    // tìm cả tên + category + mô tả) — phạm vi tìm hẹp hơn trang Search chuyên dụng
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    // Sản phẩm chỉ được giữ lại nếu THỎA MÃN TẤT CẢ điều kiện trên (AND logic)
    return matchCat && matchSize && matchColor && matchPrice && matchGender && matchSubcat && matchQ;
  });

  // ===== SẮP XẾP =====
  // 3 nhánh if độc lập (không phải else if) nhưng thực chất loại trừ lẫn nhau vì sortBy
  // chỉ có thể mang đúng 1 giá trị tại 1 thời điểm — dùng if riêng lẻ ở đây không sai nhưng
  // về style, else if sẽ rõ ràng hơn là 4 lựa chọn loại trừ nhau (bao gồm "featured" không làm gì)
  // [...filtered].sort(...): spread tạo mảng MỚI trước khi sort, vì Array.sort() thay đổi
  // (mutate) trực tiếp mảng gốc — nếu sort thẳng lên "filtered" (biến tham chiếu tới kết quả
  // của .filter(), vốn đã là mảng mới nên thực ra sort trực tiếp cũng không sao ở đây,
  // nhưng cách viết [...filtered].sort() vẫn là thói quen an toàn, phòng trường hợp sau này
  // filtered được gán từ nguồn khác có thể bị mutate ngoài ý muốn)
  if (sortBy === "price-asc")  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  // "newest": đơn giản chỉ đảo ngược thứ tự mảng hiện có — GIẢ ĐỊNH dữ liệu trả về từ API
  // vốn đã được sắp xếp theo thứ tự CŨ -> MỚI, nên đảo ngược sẽ ra MỚI -> CŨ. Đây không phải
  // sắp xếp theo trường ngày tháng thật sự (không có p.createdAt hay tương tự), nên độ tin cậy
  // phụ thuộc hoàn toàn vào thứ tự trả về sẵn có từ backend.
  if (sortBy === "newest")     filtered = [...filtered].reverse();

  // ===== PHÂN TRANG =====
  // totalPages: làm tròn LÊN số trang cần thiết, Math.max(1, ...) đảm bảo luôn có ít nhất 1 trang
  // (kể cả khi filtered rỗng, tránh totalPages = 0 gây lỗi logic phân trang)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // currentPage: giới hạn lại "page" không được vượt quá totalPages — xử lý trường hợp
  // người dùng đang ở trang 5, sau đó áp dụng filter khiến danh sách thu hẹp chỉ còn 2 trang,
  // currentPage sẽ tự kẹp về trang 2 (trang cuối cùng còn tồn tại) thay vì hiện trang rỗng
  const currentPage = Math.min(page, totalPages);
  // pageItems: cắt đúng đoạn sản phẩm thuộc trang hiện tại từ mảng đã lọc + sắp xếp
  // useMemo để tránh tính lại slice() không cần thiết nếu filtered/currentPage không đổi
  // giữa các lần re-render (dù trong trường hợp này filtered được tính lại mỗi render nên
  // memo hóa ở đây tác dụng tối ưu thực tế khá hạn chế, nhưng không sai)
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  // Điều hướng sang trang p, có kiểm tra biên (không cho vượt quá 1..totalPages)
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    // id="shop-section": đây chính là ANCHOR mà PromoBar đã trỏ tới qua Link to="/#shop-section"
    // (đã phân tích ở component PromoBar trước đó) — xác nhận rằng đúng là 2 component này liên kết với nhau
    <div className="shop-section" id="shop-section">
      <div className="shop-section-title">
        Tất cả sản phẩm. <span className="light">Tìm đúng món bạn cần.</span>
      </div>

      <div className="shop-layout">

        {/* ===== SIDEBAR: các bộ lọc dạng checkbox/swatch/range ===== */}
        <aside className="filter-sidebar">

          {/* Lọc theo danh mục (checkbox, cho phép chọn NHIỀU category cùng lúc) */}
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

          {/* Lọc theo kích cỡ (checkbox, multi-select) */}
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

          {/* Lọc theo màu sắc — dùng "swatch" (ô màu vuông) thay vì checkbox chữ,
              trực quan hơn vì người dùng thấy ngay đúng màu thay vì đọc tên mã màu */}
          <div className="filter-group">
            <h4>Màu sắc <span className="chev">▾</span></h4>
            <div className="filter-swatches">
              {colorOptions.map((color) => (
                <span
                  key={color}
                  className={`swatch ${selectedColors.includes(color) ? "active" : ""}`}
                  style={{ background: color }} // dùng chính giá trị màu làm background trực tiếp
                  title={color} // tooltip hiện mã màu khi hover, hỗ trợ người không phân biệt được màu qua mắt thường
                  onClick={() => toggleColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Lọc theo khoảng giá — thanh range trượt, chỉ có 1 đầu (min cố định = 0,
              chỉ điều chỉnh được giá TỐI ĐA, không phải range 2 đầu thật sự) */}
          <div className="filter-group">
            <h4>Khoảng giá <span className="chev">▾</span></h4>
            <div className="price-range">
              <span>0đ</span>
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="10000" // mỗi lần kéo nhảy 10.000đ
                value={effectiveMaxPrice}
                onChange={handlePriceChange}
              />
              <span>{fmt(effectiveMaxPrice)}</span>
            </div>
          </div>

          <button className="btn-clear-filter" onClick={clearFilters}>
            Xóa tất cả bộ lọc
          </button>
        </aside>

        {/* ===== MAIN: toolbar lọc bổ sung + lưới sản phẩm + phân trang ===== */}
        <div className="shop-main">

          {/* Hàng lọc bổ sung: giới tính, danh mục con (dropdown), tìm kiếm nhanh —
              style inline (không dùng class CSS riêng) cho container này, khác với
              phần lớn phần còn lại của component đều dùng className + file CSS ngoài */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {/* Dropdown giới tính — mỗi lần đổi cũng reset về trang 1 giống các filter khác */}
            <select value={genderFilter} onChange={(e)=>{setGenderFilter(e.target.value); setPage(1);}}>
              <option value="">--Giới tính--</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            {/* Dropdown danh mục con — tái sử dụng lại catOptions đã tính ở trên,
                nhưng đây là bộ lọc SINGLE-SELECT, khác với checkbox sidebar (multi-select) */}
            <select value={subcatFilter} onChange={(e)=>{setSubcatFilter(e.target.value); setPage(1);}}>
              <option value="">--Danh mục--</option>
              {catOptions.map((c)=> <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Ô tìm kiếm nhanh riêng của ShopSection, chỉ match theo tên (biến "q", khác "query" của SearchPage) */}
            <input placeholder="Tìm kiếm sản phẩm..." value={q} onChange={(e)=>{setQ(e.target.value); setPage(1);}} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e5e7f0' }} />
          </div>

          {/* Toolbar: đếm số sản phẩm sau lọc + dropdown sắp xếp */}
          <div className="shop-toolbar">
            <span>Hiển thị {filtered.length} sản phẩm</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Sắp xếp: Nổi bật</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>

          {/* Render có điều kiện theo 3 trạng thái: đang tải / lọc ra rỗng / có sản phẩm */}
          {loading ? (
            <div className="empty">Đang tải sản phẩm...</div>
          ) : pageItems.length === 0 ? (
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
                      // Khác với các component khác (WishlistPage, SearchPage) hiện placeholder
                      // bằng <span>Ảnh sản phẩm</span> trực tiếp trong JSX, ở đây xử lý placeholder
                      // HOÀN TOÀN bằng CSS (pseudo-element ::before dựa vào việc THIẾU class "has-image")
                      // — 2 cách tiếp cận khác nhau cho cùng 1 vấn đề, không nhất quán giữa các component
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

          {/* Thanh phân trang — chỉ hiện nếu có nhiều hơn 1 trang */}
          {totalPages > 1 && (
            <div className="pagination">
              {/* Nút "trang trước", disabled khi đang ở trang đầu tiên */}
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>

              {/* Sinh ra mảng số trang [1, 2, 3, ..., totalPages] rồi render thành từng nút bấm.
                  Array.from({ length: totalPages }, (_, i) => i + 1): cách phổ biến để tạo
                  nhanh 1 mảng số nguyên liên tiếp mà không cần vòng lặp for thủ công.
                  LƯU Ý: cách này hiện TẤT CẢ số trang liền nhau, không rút gọn kiểu "1 ... 5 6 7 ... 20"
                  — nếu tổng số trang quá lớn, thanh phân trang sẽ rất dài, có thể cần cải thiện sau này */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === currentPage ? "active" : ""}
                  onClick={() => goToPage(n)}
                >
                  {n}
                </button>
              ))}

              {/* Nút "trang sau", disabled khi đang ở trang cuối cùng */}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
