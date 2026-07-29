import { Link } from "react-router-dom";
import "../../pages/css/SupportStrip.css";

// Dữ liệu tĩnh (static data) khai báo sẵn ở ngoài component — không phải fetch từ API,
// vì nội dung này (chính sách giao hàng/đổi trả/hỗ trợ) cố định, không cần backend quản lý
const supports = [
  {
    id: 1,
    icon: "🚚", // Dùng emoji thay vì icon library (giảm dependency, nhưng khó custom style/màu hơn icon SVG)
    title: "Giao hàng nhanh toàn quốc",
    desc: "Miễn phí vận chuyển cho đơn từ 500.000đ. Giao trong 2–3 ngày làm việc.",
    link: "/van-chuyen", // Route nội bộ, điều hướng qua Link (SPA, không reload trang)
  },
  {
    id: 2,
    icon: "🔄",
    title: "Đổi trả trong 30 ngày",
    desc: "Không hài lòng? Đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng.",
    link: "/doi-tra",
  },
  {
    id: 3,
    icon: "💬",
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn qua chat, email hoặc hotline.",
    link: "/ho-tro",
  },
];

// Component thuần hiển thị (presentational component) — không có state,
// không có logic phức tạp, không nhận props, chỉ render dữ liệu tĩnh ở trên.
// Đây là "strip" (dải) 3 thẻ chính sách hỗ trợ, thường đặt ở trang chủ hoặc footer.
export default function SupportStrip() {
  return (
    <div className="support-strip">
      <h2>Hỗ trợ tại đây.</h2>
      <p>Chúng tôi luôn đồng hành cùng bạn trên mọi hành trình mua sắm.</p>

      <div className="support-grid">
        {/* Lặp qua mảng supports, mỗi phần tử render thành 1 card */}
        {supports.map((s) => (
          <div className="support-card" key={s.id}>
            <div className="icon-slot">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>

            {/* Dùng Link thay vì <a href> để điều hướng theo kiểu SPA,
                tránh reload lại toàn trang khi chuyển route */}
            <Link className="link" to={s.link}>
              Tìm hiểu thêm ›
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
