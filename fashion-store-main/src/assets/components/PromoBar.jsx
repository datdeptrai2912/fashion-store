import { Link } from "react-router-dom";
import "../../pages/css/PromoBar.css";

export default function PromoBar() {
  return (
    <div className="promo">
      Miễn phí vận chuyển cho đơn hàng từ <strong>500.000đ</strong>.{" "}
      <Link to="/#shop-section">Mua ngay</Link> ⓘ
    </div>
  );
}
