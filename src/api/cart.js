// ============================================================
//  CART API — đồng bộ giỏ hàng của người dùng đã đăng nhập với server
//  (server lưu theo user_id, nên bắt buộc phải có token)
// ============================================================
import { apiGet, apiPost } from "./client";

// Trả về danh sách item đã lưu: [{ id, user_id, product_id, qty, size, color }, ...]
export const getCart = () => apiGet("/cart", { auth: true });

// Ghi đè toàn bộ giỏ hàng hiện tại lên server
// items: [{ productId, qty, size, color }, ...]
export const saveCart = (items) => apiPost("/cart", { items }, { auth: true });
