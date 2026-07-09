import { useNavigate } from "react-router-dom";
import { products } from "../../data/products";
import "../../pages/css/MosaicGrid.css";

const fmtFrom = (n) => `Từ ${n.toLocaleString("vi-VN")}đ`;

// Cấu hình layout mosaic: span (độ rộng) + theme (màu nền) cho từng vị trí.
// eyebrow tự suy ra từ badge thật của sản phẩm (Mới/Sale/Hot) ở bước render.
const layout = [
  { span: 2, theme: "dark"  },
  { span: 1, theme: "light" },
  { span: 1, theme: "light" },
  { span: 1, theme: "light" },
  { span: 1, theme: "dark"  },
  { span: 1, theme: "dark"  },
];

// Chọn 6 sản phẩm có badge (Mới/Sale/Hot) để làm nổi bật trong mosaic;
// nếu không đủ 6, lấy thêm sản phẩm bất kỳ cho đủ.
const featured = [
  ...products.filter((p) => p.badge),
  ...products.filter((p) => !p.badge),
].slice(0, 6);

const mosaicProducts = featured.map((p, i) => ({
  ...p,
  span: layout[i].span,
  theme: layout[i].theme,
}));

export default function MosaicGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid-wrap">
      <div className="section-title">
        Mới nhất. <span className="light">Xem ngay có gì mới.</span>
      </div>
      <div className="mosaic">
        {mosaicProducts.map((p) => (
          <div
            key={p.id}
            className={`card ${p.theme} span-${p.span}`}
            onClick={() => navigate(`/product/${p.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") navigate(`/product/${p.id}`); }}
          >
            {p.badge && <div className="eyebrow">{p.badge}</div>}
            <h3>{p.name}</h3>
            <p className="desc">{p.desc}</p>
            <div className="price">{fmtFrom(p.price)}</div>
            <div className={`media-slot ${p.image ? "has-image" : ""}`}>
              {p.image && <img src={p.image} alt={p.name} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
