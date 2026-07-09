import { products as defaultProducts } from "./products";
import { defaultUsers } from "./users";

const PRODUCT_KEY = "fashion-store-products";
const PRODUCT_VERSION_KEY = "fashion-store-products-version";
const USER_KEY = "fashion-store-users";

// Tăng số này mỗi khi cấu trúc/nội dung mặc định của products.js thay đổi
// (vd: thêm trường gender). Nếu không có bước này, những trình duyệt đã
// từng mở web trước đó sẽ tiếp tục dùng bản dữ liệu CŨ lưu trong localStorage
// và không bao giờ thấy được các trường/dữ liệu mới, dù code đã sửa xong.
const PRODUCT_DATA_VERSION = "2";

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const loadProducts = () => {
  if (typeof localStorage === "undefined") return defaultProducts;

  const storedVersion = localStorage.getItem(PRODUCT_VERSION_KEY);
  if (storedVersion !== PRODUCT_DATA_VERSION) {
    // Dữ liệu cũ hoặc chưa có version — reset về dữ liệu mặc định mới nhất
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(defaultProducts));
    localStorage.setItem(PRODUCT_VERSION_KEY, PRODUCT_DATA_VERSION);
    return defaultProducts;
  }

  return parseJSON(localStorage.getItem(PRODUCT_KEY), defaultProducts);
};

export const saveProducts = (products) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
};

export const loadUsers = () => {
  if (typeof localStorage === "undefined") return defaultUsers;
  return parseJSON(localStorage.getItem(USER_KEY), defaultUsers);
};

export const saveUsers = (users) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(users));
};

export const getProductById = (id) =>
  loadProducts().find((product) => product.id === Number(id));

export const getProducts = () => loadProducts();
