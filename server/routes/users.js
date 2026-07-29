
// tên file user.js nhưng về nội dung là file dành riêng cho admin - người dùng quản lý 

import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
// yêu cầu đăng nhập - và xác thực admin 
const router = express.Router();

router.get("/", authenticate, requireAdmin, async (req, res) => { 
  // đúng đường dẫn , đăng nhập , là admin thì chạy hàm chính 
  try { 
    const [rows] = await pool.query("SELECT id, name, email, role FROM users ORDER BY id ASC");
    // truy vấn và lấy id , name , email , role từ bảng users ORDER BY id ASC: Sắp xếp kết quả trả về dựa trên cột id theo thứ tự tăng dần
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users", error: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { name, email, role } = req.body; 
  // tạo biến name , email , role gán từ dữ liệu người dùng nhập 
  try {
    await pool.query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [name, email, role, req.params.id]); 
    // câu lện sql này - cập nhật giá trị mới  - các gia trị mới như name , email , role với điều kiện đúng id 
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.params.id]); 
    // sau khi cập nhật và lấy nó ra để hiển thị 
    res.json(rows[0]); 
    // trả về dưới dạng json phần tử đầu của rows 
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]); 
     // câu lệnh sql xóa đi user có id  trùng khớp 
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

export default router;
