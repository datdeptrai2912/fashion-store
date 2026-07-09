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
