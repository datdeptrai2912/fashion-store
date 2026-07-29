// ============================================================
//  ORDERS API
// ============================================================
import { apiGet, apiPost } from "./client";

// Tạo đơn hàng mới (yêu cầu đăng nhập)
// order: { userId, items: [{ productId, qty, price }], total, address, payment }
export const createOrder = (order) => apiPost("/orders", order, { auth: true });

// Xem chi tiết 1 đơn hàng (yêu cầu đăng nhập)
export const getOrderById = (id) => apiGet(`/orders/${id}`, { auth: true });

// Danh sách tất cả đơn hàng — chỉ admin
export const getOrders = () => apiGet("/orders", { auth: true });
