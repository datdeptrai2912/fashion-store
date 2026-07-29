import { useMemo, useState, useEffect } from "react";
// useMemo: tính toán giá trị phái sinh (derived) mà không tính lại mỗi lần render
// useState: quản lý state cục bộ (form nhập liệu, danh sách sản phẩm...)
// useEffect: chạy side-effect (vd: fetch dữ liệu khi component mount)

import { useNavigate, Navigate } from "react-router-dom";
// useNavigate: điều hướng bằng code (vd sau khi thêm/xóa sản phẩm xong thì redirect)
// Navigate: component dùng để redirect ngay trong JSX (thường dùng để chặn truy cập nếu không phải admin)

import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/products";
// Import các hàm gọi API CRUD sản phẩm — cho thấy AdminPage này gọi thẳng
// tới backend thật (api/products), KHÁC với storage.js (localStorage) đã phân tích trước đó
// -> đây là dấu hiệu dự án đã tích hợp backend Node/Express + MySQL, không còn dùng data giả nữa

import "../../pages/css/AdminPage.css";
// CSS riêng cho trang admin


const initialProduct = {
  name: "",
  gender: "Nam",
  subcat: "Áo",
  desc: "",
  price: "",
  oldPrice: "",
  badge: "",
  colors: "#111111,#ffffff",
  sizes: "S,M,L",
  image: "",
  stock: 10,
};
// Đây là object mẫu để reset form mỗi khi mở modal "Thêm sản phẩm mới"
// Danh mục con dùng đúng tên tiếng Việt đang có trong dữ liệu sản phẩm
// (khớp với slugToCategory trong CategoryPage.jsx) để sản phẩm thêm mới
// vẫn hiển thị đúng khi khách duyệt theo danh mục từ thanh điều hướng.
const CATEGORY_MAP = {
  Nam: [
    "Áo",
    "Quần",
    "Áo khoác",
    "Giày",
    "Phụ kiện",
    "Mũ nón",
    "Đồ bơi",
  ],
  Nữ: [
    "Áo",
    "Quần",
    "Váy / Đầm",
    "Áo khoác",
    "Giày",
    "Phụ kiện",
    "Mũ nón",
    "Đồ bơi",
  ],
};

export default function AdminPage({ user }) {
  // Component nhận prop "user" (thông tin người đang đăng nhập)
  // -> dùng để kiểm tra có phải admin không (thấy Navigate ở phần import trước đó,
  //    khả năng cao có đoạn "if (!user || user.role !== 'admin') return <Navigate ... />")

  const navigate = useNavigate();
  // Hàm điều hướng bằng code, vd: navigate("/login") nếu không đủ quyền

  const [products, setProducts] = useState([]);
  // products: mảng chứa TOÀN BỘ sản phẩm lấy về từ backend (qua getProducts())
  // Ban đầu là mảng rỗng [] vì chưa fetch xong -> sẽ được set sau khi gọi API

  const [loading, setLoading] = useState(true);
  // loading: cờ boolean, true = đang tải dữ liệu -> dùng để hiện "Đang tải..." trên UI
  // Bắt đầu là true vì lúc component vừa mount, chưa fetch xong dữ liệu

  const [saving, setSaving] = useState(false);
  // saving: cờ boolean riêng, true = đang trong quá trình gửi request thêm/sửa/xóa
  // Khác với "loading" (tải danh sách) — cái này dùng để disable nút Save
  // khi đang gửi request, tránh user bấm nhiều lần gây gửi trùng

  const [newProduct, setNewProduct] = useState(initialProduct);
  // newProduct: dữ liệu đang nhập trong FORM (thêm mới hoặc đang sửa)
  // Khởi tạo bằng initialProduct (object rỗng mẫu đã thấy ở phần trước)
  // Đây chính là state bị "set lại" mỗi khi mở form thêm sản phẩm mới

  const [editingId, setEditingId] = useState(null);
  // editingId: nếu null -> đang ở chế độ "Thêm mới"
  // Nếu có giá trị (id của sản phẩm) -> đang ở chế độ "Sửa" sản phẩm đó
  // Đây là kỹ thuật dùng 1 form DUY NHẤT cho cả 2 chức năng thêm/sửa,
  // thay vì viết 2 form riêng biệt

  const [search, setSearch] = useState("");
  // search: chuỗi tìm kiếm, dùng để lọc bảng danh sách sản phẩm theo tên
  // (thường sẽ thấy dùng trong useMemo để filter products theo search)

  // Chỉ load danh sách sản phẩm khi user thực sự là admin (tránh gọi API thừa
  // trước khi bị điều hướng ra khỏi trang ở đoạn Navigate bên dưới).
useEffect(() => {
    if (!user || user.role !== "admin") return;
    // Bảo vệ: nếu chưa đăng nhập (user null/undefined) hoặc không phải admin
    // -> return sớm, KHÔNG gọi API lấy sản phẩm (tránh gọi API thừa/lộ dữ liệu)

    let alive = true;
    // Biến cờ để kiểm soát "component còn đang mount hay không"
    // Dùng để tránh bug gọi setState sau khi component đã unmount
    // (vd: user chuyển trang khác trước khi API kịp trả về)

    getProducts()
      .then((data) => { if (alive) setProducts(data); })
      // API trả về thành công -> nếu component vẫn còn "sống" thì mới set state
      .catch(() => { if (alive) setProducts([]); })
      // API lỗi (mất mạng, lỗi server...) -> set về mảng rỗng để tránh crash UI
      .finally(() => { if (alive) setLoading(false); });
      // Dù thành công hay thất bại, đều tắt trạng thái "đang tải"

    return () => { alive = false; };
    // Đây là "cleanup function" của useEffect — React tự động gọi hàm này
    // khi component unmount (rời trang) HOẶC trước khi effect chạy lại lần sau.
    // Khi đó alive = false -> nếu API trả về sau khi component đã unmount,
    // đoạn if (alive) sẽ chặn lại, không gọi setState trên component đã "chết"
    // (nếu không có bước này, React sẽ cảnh báo lỗi "memory leak")
  }, [user]);
  // Mảng dependency [user]: effect này chạy lại mỗi khi "user" thay đổi
  // (vd: user đăng nhập/đăng xuất, hoặc đổi role)

  const categories = useMemo(
    () => [...new Set(products.map((item) => item.cat))],
    [products]
  );
  // Tính danh sách các danh mục (category) DUY NHẤT xuất hiện trong products
  // products.map((item) => item.cat)  -> lấy ra mảng cat của từng sản phẩm, vd: ["Áo","Áo","Quần"]
  // new Set(...)                       -> loại bỏ trùng lặp, vd: Set{"Áo","Quần"}
  // [...Set]                           -> chuyển Set về lại mảng: ["Áo","Quần"]
  //
  // useMemo bọc quanh để KHÔNG tính toán lại phép này ở MỌI lần render,
  // mà chỉ tính lại khi "products" thực sự thay đổi (dependency array [products]).
  // Nếu không có useMemo, mỗi lần AdminPage render lại (vd gõ vào ô search)
  // thì đoạn tính categories này sẽ chạy lại dù products không đổi -> lãng phí

  const handleChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };
  // Hàm dùng chung để cập nhật MỘT trường bất kỳ trong form newProduct
  // field: tên trường muốn đổi, vd "name", "price", "gender"...
  // value: giá trị mới muốn gán vào trường đó
  //
  // (prev) => ({ ...prev, [field]: value })
  //   - prev: giá trị newProduct HIỆN TẠI (React tự truyền vào)
  //   - {...prev}: copy toàn bộ các trường cũ ra object mới (giữ nguyên field khác)
  //   - [field]: value: computed property name — ghi đè ĐÚNG field cần đổi
  //
  // Ví dụ gọi: handleChange("price", "199000")
  // -> newProduct sẽ trở thành { ...tất cả field cũ, price: "199000" }
  //
  // Đây là lý do dùng 1 hàm chung thay vì viết setNewProduct riêng cho từng ô input
  // (không cần viết handleNameChange, handlePriceChange... riêng lẻ),
  // trong JSX sẽ thấy dùng dạng: onChange={(e) => handleChange("name", e.target.value)}
  // Chuyển state form -> payload gửi lên API (đúng tên field server đang nhận)
const buildPayload = () => ({
    name: newProduct.name.trim(),
    // Cắt khoảng trắng thừa ở đầu/cuối tên sản phẩm (tránh lưu "  Áo thun  " vào DB)

    cat: newProduct.subcat,
    // Chuyển field "subcat" trong form thành field "cat" khi gửi lên backend
    // -> tên field trong form và tên field backend mong đợi KHÔNG giống nhau,
    //    hàm này đóng vai trò "mapping"/chuẩn hóa dữ liệu trước khi gửi đi

    desc: newProduct.desc.trim(),

    price: Number(newProduct.price),
    // Ép string từ input (vd "199000") thành kiểu number thực sự để backend lưu đúng kiểu

    oldPrice: Number(newProduct.oldPrice) || null,
    // Nếu oldPrice rỗng -> Number("") = 0 -> 0 là falsy -> fallback về null
    // Nghĩa là: không nhập giá cũ thì gửi null (không có giá gạch ngang),
    // thay vì gửi 0 (sẽ hiển thị sai là "giá cũ: 0đ")

    badge: newProduct.badge || null,
    // Nếu badge rỗng ("") thì gửi null thay vì chuỗi rỗng

    colors: newProduct.colors.split(",").map((c) => c.trim()).filter(Boolean),
    // "#111111, #ffffff" 
    //   .split(",")        -> ["#111111", " #ffffff"]
    //   .map(c => c.trim())-> ["#111111", "#ffffff"]  (xóa khoảng trắng thừa)
    //   .filter(Boolean)   -> loại bỏ phần tử rỗng "" (vd nếu user gõ "#111111,,#fff" dư dấu phẩy)
    // Kết quả: mảng màu sạch, đúng định dạng để lưu vào DB

    sizes: newProduct.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    // Y hệt logic colors, áp dụng cho size: "S,M,L" -> ["S","M","L"]

    image: newProduct.image || null,
  });
  // buildPayload: hàm dùng CHUNG cho cả THÊM và SỬA sản phẩm,
  // chuyển state form (newProduct) thành object đúng định dạng backend cần.
  // Tách riêng ra thành hàm để không lặp code giữa handleAddProduct và handleUpdate.

  const handleAddProduct = async (e) => {
    e.preventDefault();
    // Chặn hành vi mặc định của <form onSubmit> (reload lại trang)

    const price = Number(newProduct.price);
    if (!newProduct.name.trim() || !newProduct.desc.trim() || !price) {
      // Validate tối thiểu ở phía client: tên/mô tả không rỗng, giá phải > 0
      // (price=0 hoặc NaN đều là falsy -> !price = true -> chặn submit)
      alert("Vui lòng nhập đầy đủ Tên sản phẩm, Mô tả và Giá (giá phải lớn hơn 0).");
      return; // dừng luôn, không gọi API
    }

    setSaving(true);
    // Bật cờ "đang lưu" -> UI có thể disable nút Submit, hiện loading...

    try {
      const created = await createProduct(buildPayload());
      // Gọi API tạo sản phẩm, "created" là sản phẩm mới backend trả về (đã có id thật)

      setProducts((prev) => [...prev, created]);
      // Thêm sản phẩm mới vào CUỐI mảng products hiện tại trên UI
      // -> không cần gọi lại getProducts() để fetch toàn bộ, tiết kiệm 1 request

      setNewProduct(initialProduct);
      // Reset form về trạng thái rỗng ban đầu sau khi thêm thành công
    } catch (err) {
      alert(err.message || "Thêm sản phẩm thất bại.");
      // Nếu err có message cụ thể (từ backend/API) thì hiện nó, không thì hiện thông báo mặc định
    } finally {
      setSaving(false);
      // Dù thành công hay lỗi, đều tắt cờ "đang lưu"
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    // Đánh dấu đang sửa sản phẩm có id này -> form chuyển sang chế độ "Sửa"

    setNewProduct({
      name: product.name || "",
      gender: product.gender || "Nam",
      subcat: product.subcat || product.cat || "Áo",
      // Ưu tiên product.subcat, nếu không có thì fallback về product.cat,
      // nếu vẫn không có thì mặc định "Áo"
      // -> cho thấy dữ liệu sản phẩm trong DB có thể không đồng nhất field
      //    (một số bản ghi cũ dùng "cat", bản ghi mới dùng "subcat")

      desc: product.desc || product.description || "",
      // Tương tự: một số sản phẩm dùng field "desc", số khác dùng "description"
      // -> đây là dấu hiệu dữ liệu KHÔNG đồng nhất giữa các nguồn (seed cũ vs backend mới)

      price: product.price || "",
      oldPrice: product.oldPrice || product.old_price || "",
      // "old_price" (snake_case) vs "oldPrice" (camelCase)
      // -> khả năng cao DB dùng snake_case (chuẩn SQL) nhưng frontend/JS convention dùng camelCase,
      //    nên phải fallback cả 2 kiểu để chắc chắn lấy được giá trị dù backend trả về kiểu nào

      badge: product.badge || "",
      colors: (product.colors || []).join(","),
      // Chiều NGƯỢC lại với buildPayload: mảng ["#111111","#ffffff"] -> chuỗi "#111111,#ffffff"
      // để hiển thị lại đúng trong ô input text (input không nhận mảng, chỉ nhận string)

      sizes: (product.sizes || []).join(","),
      image: product.image || "",
      stock: product.stock || 0,
    });
    // Đổ toàn bộ dữ liệu sản phẩm đang chọn vào form -> user thấy dữ liệu cũ để sửa

    window.scrollTo({ top: 0, behavior: "smooth" });
    // Cuộn trang lên đầu (nơi có form) để user thấy ngay form đã được điền,
    // hữu ích khi bảng sản phẩm dài, bấm "Sửa" ở dưới thì form vẫn ở trên cùng
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    // Phòng thủ: nếu vì lý do gì đó gọi hàm này mà không có editingId -> dừng luôn

    const price = Number(newProduct.price);
    if (!newProduct.name.trim() || !newProduct.desc.trim() || !price) {
      alert("Vui lòng nhập đầy đủ Tên sản phẩm, Mô tả và Giá (giá phải lớn hơn 0).");
      return;
    }
    // Validate giống hệt handleAddProduct -> có thể cân nhắc tách thành hàm dùng chung
    // (vd validateProduct(newProduct)) để tránh lặp code, nhưng không bắt buộc

    setSaving(true);
    try {
      const updated = await updateProduct(editingId, buildPayload());
      // Gọi API update, truyền kèm id sản phẩm đang sửa + payload mới

      setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      // Duyệt qua mảng products hiện tại, sản phẩm nào có id trùng editingId
      // thì THAY bằng bản "updated" (dữ liệu mới nhất từ backend), giữ nguyên các sản phẩm khác
      // -> cập nhật UI ngay lập tức mà không cần fetch lại toàn bộ danh sách

      setEditingId(null);
      // Thoát chế độ "Sửa", quay về chế độ "Thêm mới"

      setNewProduct(initialProduct);
      // Reset form về rỗng
    } catch (err) {
      alert(err.message || "Cập nhật sản phẩm thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;
    // confirm(): hộp thoại xác nhận có sẵn của trình duyệt (OK/Cancel)
    // Nếu user bấm Cancel -> confirm trả về false -> !false = true -> return, không xóa

    try {
      await deleteProduct(id);
      // Gọi API xóa sản phẩm theo id trên backend thật

      setProducts((prev) => prev.filter((p) => p.id !== id));
      // Xóa sản phẩm khỏi state UI: giữ lại tất cả sản phẩm CÓ id khác id vừa xóa
    } catch (err) {
      alert(err.message || "Xóa sản phẩm thất bại.");
    }
    // Lưu ý: handleDelete KHÔNG có setSaving(true/false) như 2 hàm trên
    // -> nút xóa sẽ không bị disable trong lúc đang gửi request xóa
    // (có thể là điểm chưa nhất quán, nhưng không phải lỗi nghiêm trọng)
  };

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    // search rỗng -> không lọc gì cả, giữ nguyên toàn bộ sản phẩm

    return p.name.toLowerCase().includes(search.toLowerCase()) || (p.desc||"").toLowerCase().includes(search.toLowerCase());
    // So khớp KHÔNG phân biệt hoa thường (toLowerCase cả 2 vế)
    // Tìm theo TÊN sản phẩm HOẶC MÔ TẢ (chỉ cần khớp 1 trong 2 là đủ)
    // (p.desc||"") -> phòng trường hợp desc là undefined/null thì không bị crash khi gọi .toLowerCase()
  });
  // filteredProducts: KHÔNG dùng useMemo như "categories" ở trên
  // -> mỗi lần AdminPage render lại (kể cả khi gõ search) đều tính lại filter này
  // Thường chấp nhận được vì filter là phép toán rẻ, nhưng nếu products rất lớn (hàng nghìn)
  // thì có thể cân nhắc bọc useMemo(() => ..., [products, search]) để tối ưu

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  // Đây chính là đoạn "chặn truy cập" đã dự đoán từ trước:
  // nếu không đăng nhập hoặc không phải admin -> redirect thẳng về trang login
  // replace: thay thế lịch sử điều hướng hiện tại, để user bấm nút Back của trình duyệt
  //          không quay lại được trang Admin vừa bị chặn

  // LƯU Ý QUAN TRỌNG: đoạn check quyền này đặt Ở CUỐI, SAU tất cả hook (useState/useEffect/useMemo)
  // Đây là ĐÚNG theo "Rules of Hooks" của React — hook LUÔN phải được gọi vô điều kiện,
  // không được đặt sau 1 return sớm hay trong if. Nếu bạn từng thấy code đặt check quyền
  // TRƯỚC các hook, đó là một lỗi phổ biến gây ra warning "Rendered more hooks than during the previous render".

  return (
    <div className="admin-page page">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <h1>Trang Quản trị</h1>
            <p>Xin chào, {user.name}. Bạn đang đăng nhập với quyền admin.</p>
          </div>
          <button className="btn-submit" onClick={() => navigate("/")}>Về trang chủ</button>
        </div>

        <div className="admin-summary">
          <div className="summary-item">
            <span>{products.length}</span>
            <p>Tổng sản phẩm</p>
          </div>
          <div className="summary-item">
            <span>{categories.length}</span>
            <p>Danh mục</p>
          </div>
        </div>

        <section className="admin-section">
          <h2>Danh sách sản phẩm</h2>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Tìm sản phẩm theo tên hoặc mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e7f0" }}
            />
          </div>
          {loading ? (
            <p>Đang tải danh sách sản phẩm...</p>
          ) : (
            <div className="admin-table">
              <div className="admin-row admin-row-head">
                <div>ID</div>
                <div>Loại</div>
                <div>Tên</div>
                <div>Giá</div>
                <div>Hành động</div>
              </div>
              {filteredProducts.map((product) => (
                <div key={product.id} className="admin-row">
                  <div>{product.id}</div>
                  <div>{(product.gender? product.gender + " / " : "") + (product.subcat||product.cat)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{product.desc || product.description}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Sizes: {(product.sizes||[]).join(", ")} • Colors: {(product.colors||[]).join(", ")}</div>
                  </div>
                  <div>{(product.price || 0).toLocaleString("vi-VN")}đ</div>
                  <div>
                    <button className="btn-submit" style={{ marginRight: 8 }} onClick={() => handleEdit(product)}>Sửa</button>
                    <button className="btn-submit" style={{ background: "#c0392b" }} onClick={() => handleDelete(product.id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2>{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
          <form className="admin-form" onSubmit={editingId ? handleUpdate : handleAddProduct}>
            <div className="form-row">
              <label>Tên sản phẩm</label>
              <input
                value={newProduct.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>Giới tính</label>
                <select value={newProduct.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                  {Object.keys(CATEGORY_MAP).map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Danh mục con</label>
                <select value={newProduct.subcat} onChange={(e) => handleChange("subcat", e.target.value)}>
                  {(CATEGORY_MAP[newProduct.gender] || []).map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>Mô tả</label>
              <input
                value={newProduct.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                placeholder="Mô tả ngắn"
              />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>Giá</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="form-row">
                <label>Giá cũ</label>
                <input
                  type="number"
                  value={newProduct.oldPrice}
                  onChange={(e) => handleChange("oldPrice", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="form-row">
                <label>Badge</label>
                <select
                  value={newProduct.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                >
                  <option value="">Không</option>
                  <option value="Mới">Mới</option>
                  <option value="Sale">Sale</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>Màu sắc</label>
                <input
                  value={newProduct.colors}
                  onChange={(e) => handleChange("colors", e.target.value)}
                  placeholder="#000000,#ffffff"
                />
              </div>
              <div className="form-row">
                <label>Size</label>
                <input
                  value={newProduct.sizes}
                  onChange={(e) => handleChange("sizes", e.target.value)}
                  placeholder="S,M,L"
                />
              </div>
            </div>
            <div className="form-row">
              <label>Ảnh (URL hoặc path hoặc upload)</label>
              <input
                value={newProduct.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="/images/ten-anh.jpg"
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm sản phẩm"}
              </button>
              {editingId && (
                <button type="button" className="btn-submit" style={{ background: '#888' }} onClick={() => { setEditingId(null); setNewProduct(initialProduct); }}>Hủy</button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
