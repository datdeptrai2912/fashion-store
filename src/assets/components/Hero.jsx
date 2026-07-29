import "../../pages/css/Hero.css";
// CSS riêng cho phần Hero (banner lớn ở đầu trang chủ)

export default function Hero() {
  return (
    <header className="hero">
      {/* Dùng thẻ <header> (semantic HTML) thay vì <div> thường
          -> tốt cho SEO và accessibility, vì đây đúng là phần mở đầu/giới thiệu trang */}

      <h1>Cửa Hàng</h1>
      {/* Tiêu đề chính của trang — chỉ nên có DUY NHẤT 1 thẻ <h1> trên mỗi trang
          theo chuẩn SEO, cần lưu ý các component khác (CategoryPage, ProductPage...)
          không nên dùng thêm <h1> nào khác nếu Hero này xuất hiện chung trang với chúng */}

      <div className="sub">
        Phong cách đỉnh cao — bộ sưu tập mới nhất đã có mặt.{" "}
        {/* {" "} — đây là cách JSX chèn khoảng trắng RÕ RÀNG giữa 2 dòng text.
            Lý do cần thiết: JSX tự động xóa khoảng trắng/xuống dòng thừa ở đầu-cuối
            mỗi dòng text khi format code nhiều dòng, nên nếu không có {" "}
            thì 2 câu sẽ bị DÍNH LIỀN nhau: "...có mặt.Khám phá ngay..." (mất dấu cách) */}

        <strong>Khám phá ngay hôm nay.</strong>
        {/* Nhấn mạnh câu kêu gọi hành động (CTA) bằng thẻ <strong>,
            vừa có ý nghĩa ngữ nghĩa (quan trọng) vừa in đậm mặc định qua CSS trình duyệt */}
      </div>
    </header>
  );
}
