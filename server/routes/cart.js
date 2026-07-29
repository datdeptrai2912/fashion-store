

// tổng quan về file này - như tên đây lf file quản lý  của giỏ hàng  - có 2 việc chính là lấy giỏ hàng và lưu giỏ hàng 
import express from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js"; 
// chỉ yêu cầu lấy middleware yêu cầu đăng nhập từ auth.js 

const router = express.Router();

router.get("/", authenticate, async (req, res) => {  
  // đường dẫn path "/"  , yêu cầu đăng nhập  - đúng hết thì chạy hàm chính 
  // phương thức get 
  try {
    const [rows] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [req.user.id]);
    // tạo biến rows và công việc là lấy tất cả từ giỏ hàng cái nào liên quan tới id người dùng nhập vào 
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load cart", error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { items } = req.body; 
  // tạo biến items lưu mảng mà body gửi lên 
  
  try {
    await pool.query("DELETE FROM carts WHERE user_id = ?", [req.user.id]);
    // xóa hết toàn bộ giỏ hàng ( những cái có id trùng khớp ) 
    if (items && items.length) { // kiểm tra xem items có tồn tại hay không và độ dài của items đó phải khác 0 
      for (const it of items) {
        await pool.query(
          "INSERT INTO carts (user_id, product_id, qty, size, color) VALUES (?, ?, ?, ?, ?)",
          [req.user.id, it.productId, it.qty, it.size, it.color] 
        );
      } // chạy vòng lặp với mỗi một sản phẩm it , thực hiện 1 câu lệnh insert riêng để thêm hết vào bảng carts 
    }
    res.json({ message: "Cart saved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save cart", error: err.message });
  }
});

export default router;
