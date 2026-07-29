// ============================================================
//  API CLIENT — lớp gọi fetch dùng chung cho toàn bộ front-end
//  - Đọc base URL từ biến môi trường VITE_API_URL (xem file .env)
//  - Tự động gắn header Authorization: Bearer <token> khi auth: true
//  - Ném lỗi (throw) kèm message lấy từ response của server khi request lỗi
// ============================================================

// VITE_API_URL ví dụ: http://localhost:4000/api
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "fashion-store-token";

// ── Lưu / đọc / xóa JWT token trong localStorage ──────────────
export const getToken = () => {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  if (typeof localStorage === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage có thể bị chặn (chế độ ẩn danh...) — bỏ qua lỗi
  }
};

// ── Hàm gọi request dùng chung ─────────────────────────────────
async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const finalHeaders = { "Content-Type": "application/json", ...headers };

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Lỗi mạng (server chưa chạy, sai VITE_API_URL, mất kết nối...)
    const error = new Error("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.");
    error.cause = err;
    throw error;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.message) || `Yêu cầu thất bại (mã lỗi ${res.status}).`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiGet = (path, opts) => request(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts) => request(path, { ...opts, method: "POST", body });
export const apiPut = (path, body, opts) => request(path, { ...opts, method: "PUT", body });
export const apiDelete = (path, opts) => request(path, { ...opts, method: "DELETE" });
