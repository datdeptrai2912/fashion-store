import express from "express";
import jwt from "jsonwebtoken";
// lấy từ thư viện jsonwebtoken dùng để tạo (sign) và xác minh (verify) nhằm cho việc đăng nhập / xác thực
import pool from "../db.js";
import dotenv from "dotenv";
// lấy từ thư viện dotenv để đọc các biến môi trường từ file .env và nạp vào process.env
dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // tạo biến email, password và nạp từ dữ liệu người dùng gửi lên trong phần thân request

  if (!email || !password) {
    // nếu thiếu email hoặc password thì trả về mã 400
    return res.status(400).json({ message: "Email and password are required" });
  }

  // khối try/catch chính
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    // tạo biến rows lấy dữ liệu id, name, email, role từ bảng users WHERE email = ? AND password = ?" - yêu cầu phải lấy  từ đúng dữ liệu mà người dùng nhập vào 
    const user = rows[0];
// const user = rows[0]; ở đây phải lấy rows tai vị trí thứ nhất làm người dùng  -Vì email là duy nhất nên chỉ có 1 phần tử trong mảng, nằm ở vị trí [0]
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(  
      //  tạo biến token 
      // hàm jwt.sign có 3 tham số 
      // tham số 1 : dữ liệu nhúng vào token như ở đây lần lượt là id , name , email của user 
      // tham số 2 : là chuỗi bí mật lấy từ file .env - đảm bảo token không bị giả mạo 
      // tham số 3 : tùy chọn - như ở đây token chỉ tồn tại đợc trong 12h từ khi tạo 
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, user }); 
    // trình duyệt trả về dưới dạng json user và token  
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

const ADMIN_EMAILS = ["admin@example.com", "admin@admin.com"]; 
// đây là admin email - nghĩa là đây là 2 email cứng dùng để cho đăng nhập admin - admin chỉ nhận 2 email này 

router.post("/register", async (req, res) => { 
  // định nghĩa router đăng ký - chỉ thực hiện khi gặp /register 
  const { name, email, password } = req.body;
 //  tạo bién name , email , password  và các bién này sẽ người dùng trả về 
  if (!name || !email || !password) { 
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu" });
  } // nếu không có  trả về thông điệp dưới dạng json và mã lỗi 400 

  const cleanEmail = email.trim().toLowerCase();
// tao biến cleanEmail =  tức là khi có email người dùng nhập - phải chuyển về dạng viết thường - xóa khoảng trắng thừa 2 đầu 
  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [cleanEmail]); 
    // tạo biến existing( tồn tại )  sẽ lấy trong bảng users cái id nào mà giống như cái cleanEmail người dùng nhập 
    // ý nghĩa là xem email này đã tồn tại hay chưa 
    if (existing[0]) {
      return res.status(409).json({ message: "Email này đã được đăng ký." }); 
      //  nếu tồn tại  thì trả về thông điệp lỗi dưới dạng json và mã lỗi 
    }

    const role = ADMIN_EMAILS.includes(cleanEmail) ? "admin" : "customer";
// tạo biến vai trò  có chức năng kiểm tra cái admin emails có đúng hoàn toàn không 
// includes là method của array kiểm tra xem giá trị cần tìm bên trong hàm includes() có hay không 
// tiếp tới trong đoạn code này là toán tử 3 ngôi ? đúng trả "admin" : sai trả về "customer"     
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name.trim(), cleanEmail, password, role] 
      // tạo biến result chèn các  dữ liệu name , email , password , role vào bảng users sau khi đã thành công 
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [result.insertId] 
      // tạo biến rows- để lấy giá trị id , name , email , role từ bảng users từ id nhập vào từ insert trên 
    );

    res.status(201).json(rows[0]); 
    // trình duyệt trả về phần tử đầu tiên của biến rows 
    // có thể là { id: 15, name: "An Nguyễn", email: "an@gmail.com", role: "customer" }
  } catch (err) {
    res.status(500).json({ message: "Đăng ký thất bại", error: err.message });
  }
});

export default router;
