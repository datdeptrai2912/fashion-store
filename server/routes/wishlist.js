// File này là Router quản lý Danh sách yêu thích (Wishlist) dành riêng cho từng người dùng đã đăng nhập

import express from "express"; // Import thư viện Express để tạo router
import pool from "../db.js"; // Import kết nối cơ sở dữ liệu MySQL
import { authenticate } from "../middleware/auth.js"; // Import middleware xác thực JWT

const router = express.Router(); // Khởi tạo router

// [GET] Lấy danh sách sản phẩm yêu thích của người dùng đang đăng nhập
router.get("/", authenticate, async (req, res) => {
  try {
    // Truy vấn bảng wishlists dựa theo user_id lấy từ token (req.user.id)
    const [rows] = await pool.query("SELECT * FROM wishlists WHERE user_id = ?", [req.user.id]);
    res.json(rows); // Trả về danh sách dạng JSON
  } catch (err) {
    // Trả về lỗi 500 nếu xảy ra sự cố truy vấn
    res.status(500).json({ message: "Failed to load wishlist", error: err.message });
  }
});

// [POST] Thêm một sản phẩm vào danh sách yêu thích
router.post("/", authenticate, async (req, res) => {
  const { productId } = req.body; // Bóc tách productId từ body request
  try {
    // Lưu cặp (user_id, product_id) vào cơ sở dữ liệu
    await pool.query("INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)", [req.user.id, productId]);
    res.json({ message: "Added" }); // Thông báo thêm thành công
  } catch (err) {
    // Trả về lỗi 500 nếu không thêm được
    res.status(500).json({ message: "Failed to add", error: err.message });
  }
});

// [DELETE] Xóa sản phẩm khỏi danh sách yêu thích
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    // Xóa bản ghi có user_id và product_id trùng khớp (lấy productId từ URL)
    await pool.query("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    res.json({ message: "Removed" }); // Thông báo xóa thành công
  } catch (err) {
    // Trả về lỗi 500 nếu không xóa được
    res.status(500).json({ message: "Failed to remove", error: err.message });
  }
});

export default router; // Export router để gắn vào ứng dụng chính
