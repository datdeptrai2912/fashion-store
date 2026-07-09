import { Link } from "react-router-dom";
import "../../pages/css/SupportStrip.css";

const supports = [
  {
    id: 1,
    icon: "🚚",
    title: "Giao hàng nhanh toàn quốc",
    desc: "Miễn phí vận chuyển cho đơn từ 500.000đ. Giao trong 2–3 ngày làm việc.",
    link: "/van-chuyen",
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

export default function SupportStrip() {
  return (
    <div className="support-strip">
      <h2>Hỗ trợ tại đây.</h2>
      <p>Chúng tôi luôn đồng hành cùng bạn trên mọi hành trình mua sắm.</p>

      <div className="support-grid">
        {supports.map((s) => (
          <div className="support-card" key={s.id}>
            <div className="icon-slot">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <Link className="link" to={s.link}>
              Tìm hiểu thêm ›
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
