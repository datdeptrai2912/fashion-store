import mysql from "mysql2/promise"; 
// Dòng này  có nghĩa là "Lấy công cụ kết nối MySQL từ thư viện mysql2 (bản có hỗ trợ async/await) để chuẩn bị làm việc với Database"
import dotenv from "dotenv";
// Lấy công cụ dotenv từ thư viện để chuẩn bị cho việc đọc file .env
dotenv.config();
// kích hoạt việc đọc file .env để nạp các thông báo bí mật như user , pass word 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}); // chức năng là tạo một biến pool để thao tác 
// [Yêu cầu từ người dùng]
// 1. Tìm trong Pool có Connection nào RẢNH không?
//  ├── CÓ  ──> Lấy dùng ──> Chạy query SQL ──> Xong thì TRẢ LẠI Pool.
//  └── KHÔNG ──> Nhìn vào 'waitForConnections: true' ──> Xếp vào HÀNG CHỜ (Queue).
//      (Khi có Connection rảnh ──> Lấy ra xử lý tiếp)

export default pool;
// xuất pool ra ngoài Chia sẻ đối tượng pool này ra toàn bộ ứng dụng theo chuẩn ES Modules.
