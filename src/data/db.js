/*Cụ thể nó làm 3 việc chính:

Khởi tạo & đồng bộ dữ liệu mặc định — Khi user mở web lần đầu (hoặc khi bạn cập nhật cấu trúc products.js), file tự động nạp dữ liệu mặc định (defaultProducts, defaultUsers) vào localStorage. Cơ chế PRODUCT_DATA_VERSION đảm bảo khi bạn sửa code (thêm sản phẩm, 
thêm field mới) thì dữ liệu cũ trong trình duyệt của user sẽ tự động được làm mới, thay vì bị "kẹt" mãi ở phiên bản cũ.
Đọc/ghi (persist) dữ liệu — Cung cấp cặp hàm load/save cho cả products và users, giúp các phần khác của app (giỏ hàng, trang admin, đăng ký/đăng nhập...) 
đọc và ghi dữ liệu mà không cần quan tâm tới chi tiết localStorage hay xử lý lỗi JSON (nhờ parseJSON an toàn).
Cung cấp API tiện lợi cho component — getProducts() và getProductById(id) là các hàm truy vấn nhanh, để component React không cần tự gọi loadProducts() rồi tự .find() mỗi lần cần lấy 1 sản phẩm.

Nói cách khác: đây là "database giả" chạy hoàn toàn ở phía client, giúp dự án hoạt động được ngay cả khi chưa nối với backend Node/Express + MySQL thật — rất hợp lý cho giai đoạn phát triển frontend độc lập trước khi tích hợp API thật.

*/

import { products as defaultProducts } from "./products";
import { defaultUsers } from "./users";

const PRODUCT_KEY = "fashion-store-products"; // key lưu danh sách sản phẩm trong localStorage
const PRODUCT_VERSION_KEY = "fashion-store-products-version"; // key lưu số phiên bản của dữ liệu sản phẩm

// Tăng số này mỗi khi cấu trúc/nội dung mặc định của products.js thay đổi
// (vd: thêm trường gender). Nếu không có bước này, những trình duyệt đã
// từng mở web trước đó sẽ tiếp tục dùng bản dữ liệu CŨ lưu trong localStorage
// và không bao giờ thấy được các trường/dữ liệu mới, dù code đã sửa xong.
const PRODUCT_DATA_VERSION = "2"; // "chốt chặn" version — đổi số này để buộc reset dữ liệu cũ

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
    // value có dữ liệu -> parse ra object/array
    // value là null (chưa từng lưu key này) -> trả fallback ngay, khỏi parse
  } catch {
    return fallback; // JSON.parse lỗi (dữ liệu bị hỏng/sửa tay) -> tránh crash app
  }
};

export const loadProducts = () => {
  if (typeof localStorage === "undefined") return defaultProducts;
  // Bảo vệ khi chạy ở môi trường không có localStorage (SSR, test env...)

  const storedVersion = localStorage.getItem(PRODUCT_VERSION_KEY);
  // Đọc version đã lưu từ lần trước (null nếu là lần đầu mở web)

  if (storedVersion !== PRODUCT_DATA_VERSION) {
    // Dữ liệu cũ hoặc chưa có version — reset về dữ liệu mặc định mới nhất
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(defaultProducts));
    // Ghi đè toàn bộ sản phẩm cũ bằng bộ dữ liệu mặc định hiện tại của code
    localStorage.setItem(PRODUCT_VERSION_KEY, PRODUCT_DATA_VERSION);
    // Cập nhật version để lần load sau không bị reset lại nữa
    return defaultProducts;
  }

  return parseJSON(localStorage.getItem(PRODUCT_KEY), defaultProducts);
  // Version khớp -> tin tưởng dữ liệu trong localStorage, đọc và parse nó
};

export const saveProducts = (products) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  // Chỉ ghi lại danh sách sản phẩm, KHÔNG đụng vào PRODUCT_VERSION_KEY
  // -> lần load sau vẫn coi đây là dữ liệu hợp lệ (version không đổi)
};

export const loadUsers = () => {
  if (typeof localStorage === "undefined") return defaultUsers;
  return parseJSON(localStorage.getItem(USER_KEY), defaultUsers);
  // Không có cơ chế check version như products
  // -> nếu sau này đổi cấu trúc defaultUsers, dữ liệu cũ sẽ không tự cập nhật
};

export const saveUsers = (users) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(users));
  // Ghi đè toàn bộ danh sách user vào localStorage
};

export const getProductById = (id) =>
  loadProducts().find((product) => product.id === Number(id));
  // Ép id sang Number vì id truyền vào (vd từ useParams() của React Router)
  // luôn là kiểu string, trong khi product.id trong data là number

export const getProducts = () => loadProducts();
// Alias/wrapper để component khác gọi tên rõ nghĩa hơn "loadProducts"
