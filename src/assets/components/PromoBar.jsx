import { Link } from "react-router-dom";
import "../../pages/css/PromoBar.css";

// Component thuần hiển thị (presentational component) — không có state, không có props,
// không có logic gì phức tạp. Đây là thanh thông báo khuyến mãi (promo bar) thường
// đặt cố định ở đầu trang (trên cùng navbar), nội dung hoàn toàn tĩnh (hard-code).
export default function PromoBar() {
  return (
    <div className="promo">
      Miễn phí vận chuyển cho đơn hàng từ <strong>500.000đ</strong>.
      {" "}
      {/* {" "} là cách JSX chèn 1 khoảng trắng tường minh giữa 2 dòng —
          vì JSX tự động loại bỏ khoảng trắng/xuống dòng thừa giữa các thẻ,
          nên nếu không có {" "} này, chữ "500.000đ." và "Mua ngay" có thể
          bị dính liền nhau không có khoảng cách khi render ra HTML */}
      <Link to="/#shop-section">Mua ngay</Link> ⓘ
      {/* Link trỏ tới "/#shop-section": điều hướng về trang chủ VÀ kèm theo
          anchor "#shop-section" — với react-router-dom, hành vi tự động
          scroll tới đúng phần tử có id="shop-section" trên trang chủ
          KHÔNG được đảm bảo mặc định (khác với thẻ <a> thường của HTML thuần),
          nên cần kiểm tra xem trang chủ có tự xử lý scroll-to-anchor
          (ví dụ qua useEffect đọc location.hash) hay không, nếu không thì
          link này chỉ điều hướng về "/" mà không tự cuộn xuống đúng vị trí. */}
    </div>
  );
}
