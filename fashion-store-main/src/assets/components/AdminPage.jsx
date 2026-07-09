import { useMemo, useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { getProducts, saveProducts } from "../../data/db";
import "../../pages/css/AdminPage.css";

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
  const navigate = useNavigate();
  const [products, setProducts] = useState(getProducts);
  const [newProduct, setNewProduct] = useState(initialProduct);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((item) => item.cat))],
    [products]
  );

  const handleChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const price = Number(newProduct.price);
    const oldPrice = Number(newProduct.oldPrice) || null;
    if (!newProduct.name.trim() || !newProduct.desc.trim() || !price) {
      alert("Vui lòng nhập đầy đủ Tên sản phẩm, Mô tả và Giá (giá phải lớn hơn 0).");
      return;
    }
    const nextId = Math.max(...products.map((p) => p.id), 0) + 1;
    const created = {
      id: nextId,
      gender: newProduct.gender,
      cat: newProduct.subcat,
      subcat: newProduct.subcat,
      name: newProduct.name.trim(),
      desc: newProduct.desc.trim(),
      price,
      oldPrice,
      badge: newProduct.badge || null,
      colors: newProduct.colors.split(",").map((c) => c.trim()).filter(Boolean),
      sizes: newProduct.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      image: newProduct.image || null,
      stock: Number(newProduct.stock) || 0,
    };

    setProducts((prev) => {
      const next = [...prev, created];
      saveProducts(next);
      return next;
    });
    setNewProduct(initialProduct);
  };

  useEffect(() => {
    // ensure products persisted if they were loaded directly
    saveProducts(products);
  }, []);

  const handleEdit = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name || "",
      gender: product.gender || "Men",
      subcat: product.subcat || product.cat || "T-Shirts",
      desc: product.desc || "",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      badge: product.badge || "",
      colors: (product.colors || []).join(","),
      sizes: (product.sizes || []).join(","),
      image: product.image || "",
      stock: product.stock || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId) return;
    const price = Number(newProduct.price);
    const oldPrice = Number(newProduct.oldPrice) || null;
    if (!newProduct.name.trim() || !newProduct.desc.trim() || !price) {
      alert("Vui lòng nhập đầy đủ Tên sản phẩm, Mô tả và Giá (giá phải lớn hơn 0).");
      return;
    }
    const updated = products.map((p) =>
      p.id === editingId
        ? {
            ...p,
            gender: newProduct.gender,
            cat: newProduct.subcat,
            subcat: newProduct.subcat,
            name: newProduct.name.trim(),
            desc: newProduct.desc.trim(),
            price,
            oldPrice,
            badge: newProduct.badge || null,
            colors: newProduct.colors.split(",").map((c) => c.trim()).filter(Boolean),
            sizes: newProduct.sizes.split(",").map((s) => s.trim()).filter(Boolean),
            image: newProduct.image || null,
            stock: Number(newProduct.stock) || 0,
          }
        : p
    );
    setProducts(updated);
    saveProducts(updated);
    setEditingId(null);
    setNewProduct(initialProduct);
  };

  const handleDelete = (id) => {
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    saveProducts(next);
  };

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || (p.desc||"").toLowerCase().includes(search.toLowerCase());
  });

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

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
                  <div style={{ fontSize: 12, color: "#666" }}>{product.desc}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Stock: {product.stock || 0} • Sizes: {(product.sizes||[]).join(", ")} • Colors: {(product.colors||[]).join(", ")}</div>
                </div>
                <div>{(product.price || 0).toLocaleString("vi-VN")}đ</div>
                <div>
                  <button className="btn-submit" style={{ marginRight: 8 }} onClick={() => handleEdit(product)}>Sửa</button>
                  <button className="btn-submit" style={{ background: "#c0392b" }} onClick={() => handleDelete(product.id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
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
              <label>Số lượng tồn kho</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="0"
              />
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
              <button type="submit" className="btn-submit">{editingId ? "Cập nhật" : "Thêm sản phẩm"}</button>
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
