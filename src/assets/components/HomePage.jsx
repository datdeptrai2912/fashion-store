import Hero from "./Hero";
import CategoryRow from "./CategoryRow";
import MosaicGrid from "./MosaicGrid";
import ShopSection from "./ShopSection";
import SupportStrip from "./SupportStrip";

// Trang chủ — gộp tất cả sections lại
export default function HomePage({ wishlist, toggleWish }) {
  return (
    <>
      <Hero />
      <CategoryRow />
      <MosaicGrid />
      <ShopSection wishlist={wishlist} toggleWish={toggleWish} />
      <SupportStrip />
    </>
  );
}
/*HomePage (không tự có logic/UI riêng)
  ├── Hero          — banner đầu trang
  ├── CategoryRow    — menu danh mục (đã phân tích)
  ├── MosaicGrid     — lưới ảnh/banner quảng cáo
  ├── ShopSection    — danh sách sản phẩm (cần wishlist)
  └── SupportStrip   — dải thông tin hỗ trợ/cam kết */
