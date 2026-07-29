import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../../api/products";
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

export default function MosaicGrid() {
  const navigate = useNavigate();
  const [mosaicProducts, setMosaicProducts] = useState([]);

  useEffect(() => {
    // Cờ "alive" chống race condition: nếu component unmount trước khi
    // fetch xong (ví dụ chuyển trang nhanh), không được setState nữa
    // để tránh warning "Can't perform a React state update on unmounted component".
    let alive = true;

    getProducts()
      .then((products) => {
        if (!alive) return;

        // Chọn 6 sản phẩm có badge (Mới/Sale/Hot) để làm nổi bật trong mosaic;
        // nếu không đủ 6, lấy thêm sản phẩm bất kỳ cho đủ.
        const featured = [
          ...products.filter((p) => p.badge),
          ...products.filter((p) => !p.badge),
        ].slice(0, 6);

        // Gắn thêm span + theme (lấy từ layout theo đúng vị trí index)
        // vào từng sản phẩm để component biết render to/nhỏ, nền sáng/tối ra sao.
        setMosaicProducts(
          featured.map((p, i) => ({
            ...p,
            span: layout[i].span,
            theme: layout[i].theme,
          }))
        );
      })
      // Nếu fetch lỗi, chỉ set về mảng rỗng (ẩn cả mosaic) thay vì hiện lỗi ra UI
      .catch(() => { if (alive) setMosaicProducts([]); });

    // Cleanup function: chạy khi component unmount, đánh dấu alive = false
    return () => { alive = false; };
  }, []); // [] => chỉ fetch 1 lần khi mount

  return (
    <div className="grid-wrap">
      <div className="section-title">
        Mới nhất. <span className="light">Xem ngay có gì mới.</span>
      </div>

      <div className="mosaic">
        {mosaicProducts.map((p) => (
          // Mỗi card là 1 "ô" trong lưới mosaic, class động ghép theme + span
          // (ví dụ "card dark span-2") để CSS grid quyết định kích thước/màu.
          <div
            key={p.id}
            className={`card ${p.theme} span-${p.span}`}
            onClick={() => navigate(`/product/${p.id}`)}
            // role + tabIndex + onKeyDown: biến div thành thứ có thể focus/bấm
            // Enter được bằng bàn phím, bù lại việc dùng div thay vì button/a
            // để hỗ trợ accessibility cho phần tử vốn không tương tác được mặc định.
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") navigate(`/product/${p.id}`); }}
          >
            {/* Nhãn góc trên (badge) chỉ hiện nếu sản phẩm có badge thật từ API */}
            {p.badge && <div className="eyebrow">{p.badge}</div>}

            <h3>{p.name}</h3>

            {/* Fallback desc || description: phòng trường hợp API trả về tên field không đồng nhất */}
            <p className="desc">{p.desc || p.description}</p>

            <div className="price">{fmtFrom(p.price)}</div>

            {/* media-slot luôn render (giữ layout ổn định kể cả khi chưa có ảnh),
                class "has-image" thêm vào để CSS style khác khi có ảnh thật */}
            <div className={`media-slot ${p.image ? "has-image" : ""}`}>
              {p.image && <img src={p.image} alt={p.name} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
