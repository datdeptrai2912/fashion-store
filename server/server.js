import express from "express"; //  đây là thư viện có 2 chức năng chính : giúp định nghĩa các đường dẫn url cho ứng dụng  , lắng nghe các cổng port  - lắng nghe các request từ mạng gửi tới thông qua lệnh app.listen() 
import cors from "cors"; // đây là thư viện chia sẻ tài nguyên   , có 2 chức năng quan trong là bảo mật trình duyệt  ( trình duyệt sẽ chặn nếu fe và be chạy khác cổng nếu bạn kh bật cors lên ) , cấp quyền truy cập ( cho phép fe này lấy dữ liệu be kia)  
import dotenv from "dotenv"; // Dotenv là thư viện dùng để quản lý các thông tin cấu hình nhạy cảm của dự án bằng cách tách biệt chúng ra khỏi mã nguồn (code).
// ========= SAU ĐÂY LÀ CÁC ĐÒNG LỆNH  có chức năng nhập các tuyến đường ( các trang ) vè  
// chung quản lý trong một file 
import authRoutes from "./routes/auth.js"; 
// đây là cổng xác thực , cung cấp quyền để người dùng có thể ra vào các khu vực khác trên web 
import adminRoutes from "./routes/admin.js";
// như tên - đây là cổng admin - có quyền xem sản phẩm - xóa sản phẩm - chặn người dùng  v.v.v 
import userRoutes from "./routes/users.js";
// đây là cổng xử lý các thông tin của khách hàng sau khi đã đăng nhập thành công 
import productRoutes from "./routes/products.js";
// đây là cổng có chức năng kho hàng ,xử lý toàn bộ vòng dời của một món đồ thời trang 
import categoryRoutes from "./routes/categories.js";
// đây là cổng quản lý giỏ hàng , dữ liệu được lưu trực tiếp vào database và gắn với người đó 
import orderRoutes from "./routes/orders.js";
// xử lý các thao tác đặt hàng  và  việc vận chuyển 
import cartRoutes from "./routes/cart.js"; 
// nơi xử lý logic  bên trong của giỏ  hàng  
import wishlistRoutes from "./routes/wishlist.js";
// cổng này là phần yêu thích ( icon trái tim ) 
dotenv.config();
// Lệnh dotenv.config(); có nhiệm vụ: Đọc file .env đó, dịch các dòng chữ trong đó ra, rồi nạp (config) toàn bộ các biến đó vào một cái kho chung của hệ thống Node.js gọi là process.env.
// Sau khi lệnh này chạy, code của bạn được lợi gì?
// Sau khi dotenv.config() được gọi ở đầu file, từ các dòng code phía dưới (hoặc ở bất kỳ file route nào khác như auth.js, products.js), bạn có thể lôi các thông tin bảo mật ra dùng một cách an toàn thông qua cú pháp process.env.TÊN_BIẾN




const app = express(); // tạo ra biến app này  nắm giữ mọi phương thức quản lý của server ( nhận reqest , gửi res , cấu hình bảo mật ) 
app.use(cors({ origin: true, credentials: true }));
// Cho phép Frontend khác cổng truy cập API và truyền nhận Cookie/Token bảo mật
app.use(express.json());
//Bộ dịch ngôn ngữ, biến các chuỗi văn bản dữ liệu thô (raw text) do Frontend gửi lên thành các đối tượng JavaScript (JSON Object) để lập trình viên dễ dàng đọc được qua biến req.body
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
// đây là các dòng  điều hướng : Khách hàng gửi yêu cầu đến địa chỉ nào, Express sẽ điều hướng đúng về file xử lý đó.

app.get("/", (req, res) => res.json({ message: "Fashion store backend is running." }));

const port = process.env.PORT || 4000; 
// vế 1 : Đây là giá trị lấy từ file cấu hình .env 

//  nếu vế 1 không đúng  hệ thống sẽ tự động lấy cổng 4000 để chạy 

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
