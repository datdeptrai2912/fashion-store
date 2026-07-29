import { useNavigate } from "react-router-dom";
/*
Chỉ cần useNavigate — không cần useState/useEffect vì component này không gọi API,
không có state riêng — dữ liệu là hằng số cố định viết sẵn trong code (xem phần dưới).*/
import "../../pages/css/CategoryRow.css";
// Import CSS riêng cho component này — cùng pattern đã thấy ở 2 file trước.
const ICON_BASE =
  "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets";
const categories = [
  {
    icon: `https://product.hstatic.net/1000382882/product/triet_11__1__e37ee8a4f53d4ec4a33cdb8b62fac201_large.png`,
    label: "Áo",
    slug: "ao",
  },
  { icon: `${ICON_BASE}/1f456_3d.png`, label: "Quần", slug: "quan" },
  { icon: `${ICON_BASE}/1f460_3d.png`, label: "Giày", slug: "giay" },
  { icon: `${ICON_BASE}/1f45c_3d.png`, label: "Túi xách", slug: "tui-xach" },
  { icon: `${ICON_BASE}/1f9e3_3d.png`, label: "Phụ kiện", slug: "phu-kien" },
  { icon: `${ICON_BASE}/1f9e5_3d.png`, label: "Áo khoác", slug: "ao-khoac" },
  { icon: `${ICON_BASE}/1f452_3d.png`, label: "Mũ nón", slug: "mu-non" },
  { icon: `${ICON_BASE}/1fa71_3d.png`, label: "Đồ bơi", slug: "do-boi" },
];
/*
icon — emoji hiển thị (thay cho ảnh/icon SVG, cách làm nhanh gọn, không cần asset riêng).
label — tên hiển thị cho người dùng.
slug — chuỗi dùng trên URL, khớp chính xác với các key đã thấy trong slugToCategory ở
CategoryPage ("ao", "quan", "giay"...) — xác nhận 2 component này liên kết chặt với nhau: bấm vào đây sẽ điều hướng sang đúng trang danh mục tương ứng */
export default function CategoryRow() {
  const navigate = useNavigate();
  // Nói ngắn gọn: toàn bộ phần sau return (...) là mô tả "giao diện sẽ trông như thế nào trên màn hình" —
  // đây chính là JSX, thứ React dùng để vẽ ra HTML thật
  return (
    <div className="cat-row">
      {categories.map(({ icon, label, slug }) => (
        <div
          className="cat-item"
          key={slug}
          onClick={() => navigate(`/category/${slug}`)}
        >
          {" "}
          <div className="cat-circle">
            <img
              src={icon}
              alt={label}
              className="cat-icon-img"
              loading="lazy"
            />
          </div>
          <span className="label">{label}</span>
        </div>
      ))}
    </div>
  );
}
