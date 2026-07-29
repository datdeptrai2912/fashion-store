import useSafeBack from "../../utils/useSafeBack"; // hook tự viết, xử lý nút "Quay lại" an toàn — thường kiểm tra
                                                     // xem có lịch sử điều hướng (history) trước đó hay không,
                                                     // nếu không có (ví dụ người dùng vào thẳng link này từ Google/chia sẻ)
                                                     // thì điều hướng về trang chủ thay vì gọi navigate(-1) gây kẹt trang
import "../../pages/css/InfoPage.css"; // file CSS dùng chung cho các trang thông tin tĩnh (Info page) —
                                        // gợi ý rằng có nhiều trang khác cùng dùng chung style này
                                        // (ví dụ trang "Vận chuyển", "Hỗ trợ" — khớp với các link trong SupportStrip đã xem trước đó)

// Component thuần hiển thị (presentational component), không có state, không có props,
// không gọi API — toàn bộ nội dung là văn bản tĩnh (hard-code trực tiếp trong JSX).
// Đây là trang "Chính sách đổi trả", khớp với link "/doi-tra" đã thấy trong SupportStrip.
export default function ReturnsPage() {
  const goBack = useSafeBack(); // lấy hàm điều hướng quay lại an toàn, gán vào biến để dùng ở nút bên dưới

  return (
    <div className="info-page">

      {/* Nút quay lại trang trước — luôn đặt ở đầu trang cho các trang dạng thông tin/chính sách,
          vì đây thường là trang "phụ" người dùng ghé qua rồi quay lại luồng mua sắm chính */}
      <button className="back-btn" onClick={goBack}>← Quay lại</button>

      {/* Icon minh họa lớn ở đầu trang — dùng emoji 🔄 tượng trưng cho "đổi trả",
          nhất quán với icon đã dùng trong SupportStrip cho mục "Đổi trả trong 30 ngày" */}
      <div className="info-icon">🔄</div>

      <h1>Đổi trả trong 30 ngày</h1>

      {/* Đoạn mô tả ngắn, in đậm/nổi bật hơn nhờ class "info-lead" — đóng vai trò tóm tắt
          nhanh chính sách trước khi đi vào chi tiết từng phần bên dưới */}
      <p className="info-lead">
        Không hài lòng? Đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng.
      </p>

      {/* ===== Khối 1: Điều kiện đổi trả ===== */}
      {/* Mỗi khối nội dung được bọc trong div className="info-section" — cấu trúc lặp lại
          nhất quán (h2 + danh sách/đoạn văn), giúp CSS style đồng bộ cho từng phần */}
      <div className="info-section">
        <h2>Điều kiện đổi trả</h2>
        <ul>
          {/* Danh sách các điều kiện bắt buộc để được chấp nhận đổi trả — nội dung tĩnh,
              liệt kê dạng bullet point, không có logic động (không map từ mảng dữ liệu)
              vì đây chỉ có đúng 3 điều kiện cố định, không cần thiết phải trừu tượng hóa thành data */}
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng hoặc giặt ủi.</li>
          <li>Còn hóa đơn mua hàng hoặc mã đơn hàng.</li>
          <li>Trong vòng 30 ngày kể từ ngày nhận hàng.</li>
        </ul>
      </div>

      {/* ===== Khối 2: Quy trình đổi trả ===== */}
      <div className="info-section">
        <h2>Quy trình đổi trả</h2>
        <ul>
          {/* 3 bước quy trình, viết theo thứ tự tuyến tính (Bước 1 -> 2 -> 3) —
              văn bản tự đánh số "Bước 1:", "Bước 2:"... thay vì dùng <ol> (danh sách có thứ tự tự động),
              nghĩa là nếu sau này cần thêm/xóa bước ở giữa, phải tự sửa tay lại số thứ tự trong text,
              khác với <ol><li> sẽ tự động đánh lại số nếu dùng cấu trúc đó thay thế */}
          <li>Bước 1: Liên hệ hotline hoặc email để tạo yêu cầu đổi/trả.</li>
          <li>Bước 2: Đóng gói sản phẩm và gửi lại theo hướng dẫn của nhân viên hỗ trợ.</li>
          <li>Bước 3: Nhận sản phẩm mới hoặc hoàn tiền trong vòng 5–7 ngày làm việc sau khi chúng tôi nhận được hàng trả lại.</li>
        </ul>
      </div>

      {/* ===== Khối 3: Hoàn tiền ===== */}
      {/* Khối này dùng <p> thay vì <ul> vì nội dung chỉ là 1 đoạn văn giải thích,
          không phải danh sách các mục rời rạc như 2 khối trên */}
      <div className="info-section">
        <h2>Hoàn tiền</h2>
        <p>
          Tiền hàng sẽ được hoàn lại theo hình thức bạn đã thanh toán ban đầu
          (chuyển khoản, ví điện tử hoặc tiền mặt khi giao COD).
        </p>
      </div>

      {/* ===== Khối liên hệ hỗ trợ ===== */}
      {/* Đặt ngoài các "info-section" thông thường, dùng class riêng "info-contact"
          (có thể CSS style khác biệt, ví dụ nền màu khác để nổi bật là khối liên hệ cuối trang) */}
      <div className="info-contact">
        <h3>Cần hỗ trợ thêm?</h3>
        {/* Số hotline và email đều là text tĩnh, KHÔNG phải link — nghĩa là:
            - Số điện thoại không có href="tel:..." nên trên mobile không thể bấm gọi trực tiếp
            - Email không có href="mailto:..." nên không tự mở ứng dụng email khi bấm
            Đây là điểm có thể cải thiện về UX nếu muốn tăng khả năng tương tác của trang */}
        <p>Hotline: 1900 1234 (8:00 – 21:00, tất cả các ngày trong tuần)</p>
        <p>Email: support@luxeshop.vn</p>
      </div>
    </div>
  );
}
