import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js"; 
// 2 middleware từ file auth.js-kiểm tra người dùng có đăng nhập không - kiểm tra người dùng có quyền admin hay không 
import pool from "../db.js";

const router = express.Router();

router.get("/stats", authenticate, requireAdmin, async (req, res) => { 
  // gặp đường dân path "/stats/"- kiểm tra đăng nhập - kiểm tra quyền admin nếu thành công -> chạy hàm 
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users"); 
    // tạo biến totalUsers - tổng số người dùng 
    // câu lệnh truy vấn SELECT COUNT(*) as totalUsers FROM users là Đếm tất cả các dòng trong bảng users và đặt tên kết quả trả về là totalUsers.
    const [[{ totalProducts }]] = await pool.query("SELECT COUNT(*) as totalProducts FROM products");
    // tương tự câu trên lần này tổng số sản phẩm 
    const [[{ totalOrders }]] = await pool.query("SELECT COUNT(*) as totalOrders FROM orders");
    //  truy vấn  tổng số đơn hàng 
    res.json({ totalUsers, totalProducts, totalOrders }); 
    // trình duyệt trả về 
  } catch (err) { 
    
    res.status(500).json({ message: "Failed to load stats", error: err.message });
  }
});

export default router;
 // nếu lỗi trả về thông điệp kèm lỗi và cuóii cùng là xuất file 
 // xuất (export) biến router ra khỏi file để các file khác có thể import và sử dụng.
