import useSafeBack from "../../utils/useSafeBack";
import "../../pages/css/InfoPage.css";

export default function SupportPage() {
  const goBack = useSafeBack();

  return (
    <div className="info-page">
      <button className="back-btn" onClick={goBack}>← Quay lại</button>

      <div className="info-icon">💬</div>
      <h1>Hỗ trợ 24/7</h1>
      <p className="info-lead">
        Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn qua chat, email hoặc hotline.
      </p>

      <div className="info-section">
        <h2>Các kênh hỗ trợ</h2>
        <ul>
          <li>Hotline: 1900 1234 — hỗ trợ nhanh nhất, phản hồi trong vài phút.</li>
          <li>Email: support@luxeshop.vn — phản hồi trong vòng 24 giờ.</li>
          <li>Fanpage / chat trực tuyến — hỗ trợ 24/7, kể cả ngày lễ.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Câu hỏi thường gặp</h2>
        <ul>
          <li>Làm sao để theo dõi đơn hàng? — Xem chi tiết tại trang Giao hàng.</li>
          <li>Tôi muốn đổi/trả sản phẩm? — Xem chi tiết tại trang Đổi trả.</li>
          <li>Tôi quên mật khẩu đăng nhập? — Liên hệ hotline hoặc email để được hỗ trợ đặt lại mật khẩu.</li>
        </ul>
      </div>

      <div className="info-contact">
        <h3>Liên hệ trực tiếp</h3>
        <p>Hotline: 1900 1234 (8:00 – 21:00, tất cả các ngày trong tuần)</p>
        <p>Email: support@luxeshop.vn</p>
      </div>
    </div>
  );
}
