// ============================================================
//  AUTH API — gọi /api/auth/... và quản lý user + token đã đăng nhập
// ============================================================
import { apiPost, setToken, getToken } from "./client";

const USER_KEY = "fashion-store-user";

export const getStoredUser = () => {
  if (typeof localStorage === "undefined") return null;
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  if (typeof localStorage === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
};

// Đăng nhập: server trả về { token, user } — lưu cả hai lại
export async function login(email, password) {
  const data = await apiPost("/auth/login", { email, password });
  setToken(data.token);
  setStoredUser(data.user);
  return data.user;
}

// Đăng ký: server tạo user mới, KHÔNG tự động đăng nhập
// (giữ đúng hành vi cũ: sau khi đăng ký sẽ chuyển về trang /login)
export async function register(name, email, password) {
  return apiPost("/auth/register", { name, email, password });
}

// Đăng xuất: xóa token + user đã lưu
export function logout() {
  setToken(null);
  setStoredUser(null);
}

export function isLoggedIn() {
  return !!getToken();
}
