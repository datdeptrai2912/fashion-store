import useSafeBack from "../../utils/useSafeBack";
import "../../pages/css/InfoPage.css";

export default function ReturnsPage() {
  const goBack = useSafeBack();

  return (
    <div className="info-page">
      <button className="back-btn" onClick={goBack}>← Quay lại</button>

      <div className="info-icon">🔄</div>
      <h1>Đổi trả trong 30 ngày</h1>
      <p className="info-lead">
        Không hài lòng? Đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng.
      </p>

      <div className="info-section">
        <h2>Điều kiện đổi trả</h2>
        <ul>
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng hoặc giặt ủi.</li>
          <li>Còn hóa đơn mua hàng hoặc mã đơn hàng.</li>
          <li>Trong vòng 30 ngày kể từ ngày nhận hàng.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Quy trình đổi trả</h2>
        <ul>
          <li>Bước 1: Liên hệ hotline hoặc email để tạo yêu cầu đổi/trả.</li>
          <li>Bước 2: Đóng gói sản phẩm và gửi lại theo hướng dẫn của nhân viên hỗ trợ.</li>
          <li>Bước 3: Nhận sản phẩm mới hoặc hoàn tiền trong vòng 5–7 ngày làm việc sau khi chúng tôi nhận được hàng trả lại.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Hoàn tiền</h2>
        <p>
          Tiền hàng sẽ được hoàn lại theo hình thức bạn đã thanh toán ban đầu
          (chuyển khoản, ví điện tử hoặc tiền mặt khi giao COD).
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
