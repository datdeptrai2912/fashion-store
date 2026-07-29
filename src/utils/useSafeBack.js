import { useNavigate, useLocation } from "react-router-dom";

// Hook dùng chung cho nút "← Quay lại".
// Nếu người dùng vào thẳng trang này (không có lịch sử điều hướng trong app,
// ví dụ mở từ link chia sẻ / gõ URL trực tiếp), location.key sẽ là "default".
// Trường hợp đó navigate(-1) có thể thoát khỏi web hoặc không làm gì cả,
// nên ta điều hướng về trang chủ thay vì lùi lại lịch sử trình duyệt.
export default function useSafeBack(fallback = "/") {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (location.key === "default") {
      navigate(fallback);
    } else {
      navigate(-1);
    }
  };
}
