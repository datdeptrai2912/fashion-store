import useSafeBack from "../../utils/useSafeBack";
import "../../pages/css/InfoPage.css";

export default function ShippingPage() {
  const goBack = useSafeBack();

  return (
    <div className="info-page">
      <button className="back-btn" onClick={goBack}>← Quay lại</button>

      <div className="info-icon">🚚</div>
      <h1>Giao hàng nhanh toàn quốc</h1>
      <p className="info-lead">
        Miễn phí vận chuyển cho đơn từ 500.000đ. Giao trong 2–3 ngày làm việc trên toàn quốc.
      </p>

      <div className="info-section">
        <h2>Phí vận chuyển</h2>
        <ul>
          <li>Đơn hàng từ 500.000đ trở lên: <strong>miễn phí vận chuyển</strong>.</li>
          <li>Đơn hàng dưới 500.000đ: phí vận chuyển đồng giá 30.000đ.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Thời gian giao hàng</h2>
        <ul>
          <li>Nội thành Hà Nội / TP. Hồ Chí Minh: 1–2 ngày làm việc.</li>
          <li>Các tỉnh thành khác: 2–4 ngày làm việc.</li>
          <li>Đơn hàng được xử lý trong vòng 24 giờ kể từ khi xác nhận.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Theo dõi đơn hàng</h2>
        <p>
          Sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận được mã vận đơn
          qua email hoặc số điện thoại đã đăng ký để theo dõi hành trình đơn hàng.
        </p>
      </div>

      <div className="info-contact">
        <h3>Cần hỗ trợ thêm?</h3>
        <p>Hotline: 1900 1234 (8:00 – 21:00, tất cả các ngày trong tuần)</p>
        <p>Email: support@luxeshop.vn</p>
      </div>
    </div>
  );
}
