// đây là file quản lý danh mục sản phẩm 
import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js"; 
// yêu cầu đăng nhập - xác nhận admin 

const router = express.Router();

router.get("/", async (req, res) => {  
  // phương thức get - đường dẫn path là "/"
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC"); 
     // truy vấn lấy tất cả dữ liệu từ bảng sản phẩm và sắp xếp theo thứ tự id tăng dần và show ra dưới dạng json 
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load categories", error: err.message });
  }
});

router.post("/", authenticate, requireAdmin, async (req, res) => { 
  // phương thức post - ở đây là mục tạo mới một sản phẩm nên yêu cầu đăng nhập và cần là admin 
  const { name } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]); 
    // thêm  vào bảng sản phẩm tên mà đã lấy  ở phần thân request 
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [result.insertId]); 
     // để lấy lại bản ghi đầy đủ của danh mục vừa tạo trong database. 
    res.status(201).json(rows[0]); // trả ra ngoài rows đấy 
  } catch (err) {
    res.status(500).json({ message: "Failed to create category", error: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  // router.put("/:id"): Tiếp nhận HTTP Request phương thức PUT.

 // /:id: Tham số động trên URL (ví dụ: /categories/3), giá trị này được lưu vào req.params.id
  const { name } = req.body;
  try {
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, req.params.id]);
    // Thực thi câu lệnh SQL UPDATE để gán tên mới cho danh mục có id trùng khớp với req.params.id
    // SET name = ?: "SET" trong tiếng Anh nghĩa là "Gán / Đặt lại giá trị". Lệnh này bảo Database: "Hãy đặt lại giá trị của cột name bằng giá trị mới truyền vào dấu ?".

 // WHERE id = ?: Chỉ định rõ chỉ sửa dòng nào có id tương ứng, tránh sửa nhầm toàn bộ các dòng khác
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]); 
    //Lấy lại bản ghi danh mục vừa sửa bằng req.params.id để đảm bảo dữ liệu trả về phản ánh chính xác trạng thái mới nhất trong Database
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update category", error: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try { 
    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category", error: err.message });
  }
});
// đây là mục xóa sản phẩm cú pháp giống các file trước 
export default router;
