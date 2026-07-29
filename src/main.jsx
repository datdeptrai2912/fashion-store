import { StrictMode } from "react";
// một component đặc biệt của React dùng để kiểm tra và cảnh báo các vấn đề tiềm ẩn trong code (không ảnh hưởng đến giao diện thực tế, chỉ hỗ trợ lúc phát triển)
import { createRoot } from "react-dom/client";
/* dùng để tạo "root" - điểm gắn kết giữa React và DOM thật của trình duyệ */ 
import "./index.css";
// "./index.css": import file CSS toàn cục, áp dụng style cho cả ứng dụng.
import App from "./App.jsx";
// App: component gốc của ứng dụng, chứa toàn bộ giao diện và logic chính (nằm trong file App.jsx)
createRoot(document.getElementById("root")).render(
  // lấy thẻ HTML có id="root" trong file - hiển thị ra màn hình 
  <StrictMode>
    <App /> 
  </StrictMode>
); 
// bọc component App bên trong StrictMode
