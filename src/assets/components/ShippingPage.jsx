import useSafeBack from "../../utils/useSafeBack";
// Import custom hook tự viết (không phải hook có sẵn của React)
// Tên "useSafeBack" gợi ý: xử lý việc "quay lại trang trước" một cách AN TOÀN
// (khả năng cao là để tránh trường hợp user vào thẳng trang này từ link ngoài
// -> lịch sử điều hướng (history) rỗng -> bấm "quay lại" sẽ thoát khỏi web luôn.
// useSafeBack chắc sẽ kiểm tra có history hay không, nếu không có thì điều hướng
// về trang chủ thay vì gọi navigate(-1) một cách "mù quáng")

import "../../pages/css/InfoPage.css";
// CSS DÙNG CHUNG cho các trang thông tin tĩnh (Shipping, Returns, Support...)
// -> khác với AdminPage.css riêng biệt trước đó, cho thấy các trang "info"
//    được thiết kế theo cùng 1 khuôn mẫu giao diện

export default function ShippingPage() {
  const goBack = useSafeBack();
  // Gọi hook, lấy về hàm goBack để gắn vào nút "Quay lại"
  // Component này KHÔNG có useState/useEffect nào khác
  // -> đây là "trang tĩnh" (static page), chỉ hiển thị nội dung, không có logic phức tạp,
  //    không fetch API, không quản lý state riêng

  return (
    <div className="info-page">
      <button className="back-btn" onClick={goBack}>← Quay lại</button>
      {/* Nút back gọi thẳng hàm goBack lấy từ hook, không dùng navigate(-1) trực tiếp */}

      <div className="info-icon">🚚</div>
      {/* Icon minh họa bằng emoji, đơn giản, không cần import thư viện icon ngoài */}

      <h1>Giao hàng nhanh toàn quốc</h1>
      <p className="info-lead">
        Miễn phí vận chuyển cho đơn từ 500.000đ. Giao trong 2–3 ngày làm việc trên toàn quốc.
      </p>
      {/* "info-lead": đoạn mô tả ngắn, nổi bật, đóng vai trò tóm tắt trước khi vào chi tiết */}

      <div className="info-section">
        <h2>Phí vận chuyển</h2>
        <ul>
          <li>Đơn hàng từ 500.000đ trở lên: <strong>miễn phí vận chuyển</strong>.</li>
          <li>Đơn hàng dưới 500.000đ: phí vận chuyển đồng giá 30.000đ.</li>
        </ul>
      </div>
      {/* Mỗi "info-section" là 1 khối nội dung có tiêu đề h2 riêng
          -> cấu trúc lặp lại nhiều lần trong trang, có thể tách thành
             component con <InfoSection title="..."><ul>...</ul></InfoSection>
             nếu muốn tái sử dụng, nhưng với trang tĩnh viết trực tiếp thế này
             cũng hoàn toàn ổn vì không có logic động */}

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
      {/* Lưu ý: nội dung này mô tả tính năng "tra cứu vận đơn" nhưng KHÔNG thấy
          link/nút thực sự dẫn tới trang tra cứu -> hiện tại chỉ là text mô tả,
          chưa có chức năng thật đi kèm (nếu dự án cần, đây là chỗ có thể bổ sung sau) */}

      <div className="info-contact">
        <h3>Cần hỗ trợ thêm?</h3>
        <p>Hotline: 1900 1234 (8:00 – 21:00, tất cả các ngày trong tuần)</p>
        <p>Email: support@luxeshop.vn</p>
      </div>
      {/* Thông tin liên hệ HARD-CODE cứng trong component
          -> nếu SupportPage.jsx cũng có đoạn hotline/email y hệt,
             nên cân nhắc tách ra 1 component chung <ContactInfo />
             để sửa 1 chỗ áp dụng cho nhiều trang, tránh lặp + dễ quên đồng bộ */}
    </div>
  );
}
