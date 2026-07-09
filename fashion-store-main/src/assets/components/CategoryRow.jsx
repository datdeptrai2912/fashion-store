import { useNavigate } from "react-router-dom";
import "../../pages/css/CategoryRow.css";

const categories = [
  { icon: "👗", label: "Áo",        slug: "ao" },
  { icon: "👖", label: "Quần",      slug: "quan" },
  { icon: "👠", label: "Giày",      slug: "giay" },
  { icon: "👜", label: "Túi xách",  slug: "tui-xach" },
  { icon: "🧣", label: "Phụ kiện",  slug: "phu-kien" },
  { icon: "🧥", label: "Áo khoác",  slug: "ao-khoac" },
  { icon: "👒", label: "Mũ nón",    slug: "mu-non" },
  { icon: "🩱", label: "Đồ bơi",    slug: "do-boi" },
];

export default function CategoryRow() {
  const navigate = useNavigate();

  return (
    <div className="cat-row">
      {categories.map(({ icon, label, slug }) => (
        <div
          className="cat-item"
          key={slug}
          onClick={() => navigate(`/category/${slug}`)}
        >
          <div className="cat-circle">{icon}</div>
          <span className="label">{label}</span>
        </div>
      ))}
    </div>
  );
}
