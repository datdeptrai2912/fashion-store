// ============================================================
//  PRODUCTS API — thay cho localStorage trong src/data/db.js cũ
// ============================================================
import { apiGet, apiPost, apiPut, apiDelete } from "./client";

// Bảng `products` ở MySQL lưu cột "description" (không phải "desc" như
// front-end đang dùng), và "colors"/"sizes" được lưu dạng chuỗi JSON
// (xem server/routes/products.js: JSON.stringify(colors || [])).
// Hàm này chuẩn hóa lại record trả về để các component dùng như cũ:
// product.desc, product.colors (mảng), product.sizes (mảng).
const parseMaybeJSON = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const normalizeProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    desc: p.desc ?? p.description ?? "",
    colors: parseMaybeJSON(p.colors),
    sizes: parseMaybeJSON(p.sizes),
    oldPrice: p.oldPrice ?? p.old_price ?? null,
  };
};

// Lấy toàn bộ sản phẩm (public, không cần đăng nhập)
export const getProducts = () => apiGet("/products").then((rows) => rows.map(normalizeProduct));

// Lấy 1 sản phẩm theo id (public)
export const getProductById = (id) => apiGet(`/products/${id}`).then(normalizeProduct);

// Các thao tác dưới cần quyền admin (server tự kiểm tra qua middleware)
export const createProduct = (product) => apiPost("/products", product, { auth: true }).then(normalizeProduct);
export const updateProduct = (id, product) => apiPut(`/products/${id}`, product, { auth: true }).then(normalizeProduct);
export const deleteProduct = (id) => apiDelete(`/products/${id}`, { auth: true });
