// File này là middleware xác thực (Authentication) và phân quyền (Authorization) cho ứng dụng Node.js



import jwt from "jsonwebtoken"; 
//  thư viện chuẩn của node js dùng để khởi tạo (sign) , và xác thực (verify)  và giải mã các chuỗi json web 
import dotenv from "dotenv";

dotenv.config();

export const authenticate = (req, res, next) => { 
  // tạo biến authenticate  trong đó có hàm gồm 3 tham số  
  const authHeader = req.headers.authorization; 
     // tạo biến authHeader-tiêu đề xác thực 
  // req.headers.authorization - Trích xuất thông tin: Lấy giá trị của header Authorization lưu vào biến authHeader
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
// nếu kh thấy có authHeader hoặc kiểm tra xem authHeader có bắt đầu bằng đúng tiền tố "Bearer" hay không 
  const token = authHeader.split(" ")[1]; 
  // tạo biến token = Dòng code authHeader.split(" ")[1]; được dùng để tách lấy riêng chuỗi JWT Token nguyên bản ra khỏi tiền tố "Bearer ".
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Giải mã và kiểm tra tính hợp lệ của chuỗi token
    req.user = payload; 
    // Gắn dữ liệu người dùng vừa giải mã được vào đối tượng req (Request).
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (req, res, next) => { 
  // tạo biến này nhằm yêu cầu tài khoản phải là admin 
  if (!req.user || req.user.role !== "admin") { 
    // kiểm tra xem thông tin có tồn tại trong req hay không - và thuộc tính ( role) trong req.user có phải là adim hay không
  
    return res.status(403).json({ message: "Admin access required" });
  }
  next();  // nếu không có lỗi gì thì cho phép chạy 
};
