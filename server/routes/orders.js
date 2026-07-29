import express from "express";  
 // Lấy từ thư viện express để dùng các công cụ tạo Server
// định tuyến đường dẫn  và xủ lý các yêu cầu ( GET , POST , PUT , DELETE ) 
import pool from "../db.js"; 
// lấy biến pool từ thư viện db.js 
// chức năng là chuẩn bị thao tác với cơ sở dữ liệu fashion_shop 
import { authenticate, requireAdmin } from "../middleware/auth.js";
// dòng này giúp lấy ra 2 cái bảo mật quan trọng nhất của file middleware  dể kiểm tra người dùng có quyền truy cập hay không trước khi cho phép xử lý dữ liệu 
const router = express.Router(); 
// tạo một bién router để giúp tạo ra một "thư mục con" để chứa các đường dẫn API của riêng một chức năng (như Đơn hàng), giúp code không bị dồn cục vào một file
router.get("/", authenticate, requireAdmin, async (req, res) => { 
  //  đây là toàn bộ đơn hàng của tất cả user nên cần phải có quyền admin 
  // có  3  bước để chạy 
  // thứ nhất đường dẫn path phải là "/" ví dụ như là : get/api/order 
  //   2  .authenticate  yêu cầu đăng nhập  , có chạy yc 3
  //3.requireAdmin  xem có phải là admin hay không  , có chạy hàm hàm chính  
  try {
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY id DESC"); 
    // néu đúng tạo 1 destructuring** và nó Lấy toàn bộ thông tin của tất cả đơn hàng trong bảng orders, sắp xếp sao cho đơn hàng mới tạo gần đây nhất nằm trên cùng.
    res.json(rows);
    // res.json(rows); trả rows về dưới dạng json đúng  k
  } catch (err) { 
    // nếu sai server trả về thông điệp kèm lỗi 
    res.status(500).json({ message: "Failed to load orders", error: err.message });
  }
});  

router.get("/:id", authenticate, async (req, res) => {
  // tương tự ở trên với đường dẫn là /:id ví dụ như get/api/order/:id thì sẽ yêu cầu quyền đăng nhập  
// nếu đúng sẽ chạy hàm dưới 
  try {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    // rows lấy dữ liệu từ database ( trả về thông tin tổng quan của 1 đơn hàng)  
    // SELECT * FROM orders  lấy  tất cả cột từ bảng order  
    // WHERE id  = ? thêm một điều kiện là chỉ lấy dòng có có cột id khớp với một giá trị nào đó 
    // dấu ? là dấu chờ điền giá trị - chưa biết giá trị thật ngay lúc viết câu lệnh này 
    // [req.params.id]  là giá trị id được lấy từ url sẽ được điền vào dấu  ? đó 
    if (!rows[0]) return res.status(404).json({ message: "Order not found" });
    // nếu giá trị đầu tiên trả về không có  , server sẽ trả về thông điệp dưới dạng json như trên  
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    // như  câu lệnh ở trên lần này là sẽ trả về dữ liệu thông tin về sản phẩm có tron 1 đơn hàng 
    res.json({ ...rows[0], items });
    // trình duyệt trả về dưới dạng json thông tin của phần tử đầu tiên trog mảng rows tìm được và danh sách sản phẩm trong đơn hàng 
   // {
  //"id": 3,
 // "user_id": 2,
  //"total": 400000,
  //"address": "...",
  //"payment": "...",
  //"items": [ {...}, {...} ]
//} 
    
  } catch (err) {
    res.status(500).json({ message: "Failed to load order", error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => { 
  // phương thức post - ở đây là tạo đơn hàng mới 
  const { userId, items, total, address, payment } = req.body; 
  // tạo các biến là các dữ liệu đơn hàng mà người dùng phải nhập đủ , và được lấy từ phần thân của cùa request POST khác với url 
  try {
    const [result] = await pool.query( // tạo biến kết quả ghi  dữ liệu vào  database 
      "INSERT INTO orders (user_id, total, address, payment) VALUES (?, ?, ?, ?)",
      // thêm 1 dòng mới vào bảng orders
      [userId, total, address, payment]
    );
    const orderId = result.insertId; 
    // dòng này lấy id vừa tạo  và gắn với tên orderID 
    for (const it of items) { // vòng lặp mảng sản phẩm lấy từ  req.body gửi lên 
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)",
        [orderId, it.productId, it.qty, it.price]
      ); 
      // mỗi lần chạy insert một dòng mới vào bảng order , biến it được tạo cũng đại diện cho từng phần tử items chạy vòng lặp 
      
    }
    res.status(201).json({ id: orderId }); 
    // trả vè id của đơn hàng vừa tạo dưới dạng json 
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
     // như đã phân tích id 500 ám chỉ lỗi máy chủ nội bộ 
  }
});

export default router; 
// xuất router ra bên ngoài để sử dụng 
