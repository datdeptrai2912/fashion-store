// file này nhằm quản lý toàn bộ thao tác thêm-sửa-xóa-xem cho đối sản phẩm ( products) trong cơ sở dữ liệu 
import express from "express";
import pool from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js"; 
// yêu cầu đăng nhập và xác thực có phải là admin không 

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC"); 
    // tạo biến rows và truy vấn - lấy từ database tất cả  dữ liệu từ bảng  products và sắp xếp theo id tăng dần  
    res.json(rows); // trả về trình duyệt dưới dạng json dữ liệu của biến rows 
  } catch (err) {
    res.status(500).json({ message: "Failed to load products", error: err.message });
  }
});

router.get("/:id", async (req, res) => { 
  // phương thức get - đường dẫn path là /:id 
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]); 
     // tạo biến rows và truy ván tới database để lấy tất cả dữ liệu từ bảng products với điều kiện những nơi nào có id trùng với người dùng nhập vào 
    
    if (!rows[0]) return res.status(404).json({ message: "Product not found"  })  
     // nếu kh có gì trả về thông điệp lỗi 
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to load product", error: err.message });
  }
});

router.post("/", authenticate, requireAdmin, async (req, res) => { 
  // phương thứ post yêu cầu đăng nhập - xác thực admin 
  const { name, cat, desc, price, oldPrice, badge, colors, sizes, image } = req.body; 
  // tạo các biến  liên quan tới sản phẩm sẽ được gán cho dữ liệu gửi về từ phần thân của request 
  try {
    const [result] = await pool.query( // tạo biến results 
      "INSERT INTO products (name, cat, description, price, old_price, badge, colors, sizes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, cat, desc, price, oldPrice || null, badge || null, JSON.stringify(colors || []), JSON.stringify(sizes || []), image || null]
    ); 
    // thêm các giá trị mới này vào bảng products , có vài đặc biệt như kiểu badge || null: Nếu không truyền nhãn, gán null.
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]); 
    // lấy tất cả dữ liệu từ  bảng product với điều kiện trùng khứp với  insertId và gán nó cho bién rows 
    res.status(201).json(rows[0]); // trả về index 0 của biến  destructing rows 
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  // phương thức put - đường dẫn path /:id  - yêu cầu đăng nhập - xác nhận admin 
  const { name, cat, desc, price, oldPrice, badge, colors, sizes, image } = req.body; 
  // Trích xuất dữ liệu mới do Client gửi lên trong body của request.
  try {
    await pool.query(
      "UPDATE products SET name = ?, cat = ?, description = ?, price = ?, old_price = ?, badge = ?, colors = ?, sizes = ?, image = ? WHERE id = ?",
      [name, cat, desc, price, oldPrice || null, badge || null, JSON.stringify(colors || []), JSON.stringify(sizes || []), image || null, req.params.id]
      // Lệnh UPDATE: Đè dữ liệu mới lên các cột tương ứng trong bảng products tại bản ghi có id trùng với req.params.id
    ); 
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    // SELECT * ... WHERE id = ?: Lấy lại dữ liệu mới nhất của sản phẩm vừa sửa bằng req.params.id
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  // router.delete("/:id"): Tiếp nhận request với phương thức HTTP DELETE
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]); 
  //  Dùng câu lệnh SQL DELETE FROM để xóa bản ghi trong bảng products.

 // Dấu ? được thay thế bằng req.params.id nhằm bảo mật, chống tấn công SQL Injection.
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
