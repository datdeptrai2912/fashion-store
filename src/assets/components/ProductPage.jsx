import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import useSafeBack from "../../utils/useSafeBack"; // hook tự viết, xử lý nút back an toàn (tránh thoát ra ngoài app nếu không có history)
import "../../pages/css/ProductPage.css";

// Format số tiền theo chuẩn Việt Nam, ví dụ 850000 -> "850.000đ"
const fmt = (n) => n.toLocaleString("vi-VN") + "đ";

// Props nhận từ component cha:
// addToCart: hàm thêm sản phẩm (kèm size/màu đã chọn) vào giỏ hàng, state giỏ hàng nằm ở tầng trên
// wishlist: mảng id sản phẩm đã yêu thích, default = [] để tránh lỗi khi component cha
//           chưa kịp truyền props này (ví dụ lúc đầu load app, wishlist load từ localStorage async)
// toggleWish: hàm thêm/xóa sản phẩm khỏi wishlist — nếu không được truyền (undefined),
//             component sẽ tự ẩn nút yêu thích đi (check ở dưới bằng {toggleWish && (...)})
export default function ProductPage({ addToCart, wishlist = [], toggleWish }) {
  // useParams lấy tham số động trên URL, ví dụ route "/product/:id" thì
  // truy cập vào /product/5 sẽ cho id = "5" (luôn là string, kể cả khi URL là số)
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useSafeBack();

  const [products, setProducts] = useState([]); // toàn bộ danh sách sản phẩm lấy từ API
  const [loading, setLoading] = useState(true); // cờ loading trong lúc chờ fetch xong

  useEffect(() => {
    // Cờ "alive" chống race condition: nếu người dùng điều hướng rời trang
    // (unmount component) trước khi fetch xong, không được gọi setState nữa —
    // tránh warning "Can't perform a React state update on an unmounted component"
    let alive = true;

    getProducts()
      .then((data) => { if (alive) setProducts(data); })
      .catch(() => { if (alive) setProducts([]); })
      // finally đảm bảo loading luôn tắt dù fetch thành công hay thất bại
      .finally(() => { if (alive) setLoading(false); });

    // Cleanup function chạy khi unmount, đánh dấu alive = false
    return () => { alive = false; };
  }, []); // mảng dependency rỗng => chỉ fetch 1 LẦN DUY NHẤT khi component mount
  // LƯU Ý QUAN TRỌNG: effect này KHÔNG có "id" trong dependency, nghĩa là nếu người dùng
  // đang ở trang chi tiết sản phẩm A rồi bấm sang sản phẩm B (route đổi từ /product/1
  // sang /product/2 mà KHÔNG unmount/remount component, ví dụ bấm link related product),
  // effect này sẽ KHÔNG chạy lại — nhưng thực ra không sao vì nó chỉ fetch toàn bộ danh sách
  // sản phẩm (không phụ thuộc id), còn việc "tìm đúng sản phẩm theo id mới" nằm ở dòng
  // product = products.find(...) bên dưới, dòng đó luôn tính lại mỗi lần "id" đổi vì
  // component re-render theo route mới => vẫn hiển thị đúng sản phẩm, không bug.

  // Tìm sản phẩm theo id
  // Number(id): ép kiểu vì useParams() luôn trả string, còn product.id trong data là số,
  // nếu không ép kiểu thì so sánh "5" === 5 sẽ luôn false (strict equality, khác kiểu dữ liệu)
  const product = products.find((p) => p.id === Number(id));

  // 3 state cục bộ cho phần chọn mua: size, màu, và trạng thái "vừa thêm vào giỏ" (để đổi UI nút)
  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [added, setAdded]                 = useState(false);

  // EARLY RETURN 1: đang tải dữ liệu — hiện màn hình loading, dừng render phần còn lại
  if (loading) {
    return <div className="not-found"><p>Đang tải sản phẩm...</p></div>;
  }

  // EARLY RETURN 2: đã tải xong nhưng KHÔNG tìm thấy sản phẩm có id tương ứng
  // (ví dụ người dùng gõ tay URL /product/9999 không tồn tại, hoặc id bị xóa khỏi DB)
  if (!product) {
    return (
      <div className="not-found">
        <p>Không tìm thấy sản phẩm.</p>
        <button onClick={goBack}>← Quay lại</button>
      </div>
    );
  }
  // Nhờ 2 early return trên, từ đây trở xuống CHẮC CHẮN "product" đã tồn tại và có dữ liệu hợp lệ,
  // nên các dòng bên dưới truy cập product.name, product.price, v.v. không cần optional chaining

  // Sản phẩm liên quan (cùng danh mục, trừ sản phẩm hiện tại)
  // filter theo cùng "cat" (category) và loại chính sản phẩm đang xem ra khỏi danh sách gợi ý,
  // slice(0, 4) giới hạn chỉ lấy tối đa 4 sản phẩm liên quan để không làm rối trang
  const related = products
    .filter((p) => p.cat === product.cat && p.id !== product.id)
    .slice(0, 4);

  // Trả về true nếu đã thêm vào giỏ thành công, false nếu còn thiếu lựa chọn
  const handleAddToCart = () => {
    // Validate bắt buộc phải chọn size trước khi thêm giỏ hàng
    if (!selectedSize) { alert("Vui lòng chọn kích cỡ!"); return false; }
    // Validate bắt buộc phải chọn màu trước khi thêm giỏ hàng
    if (!selectedColor) { alert("Vui lòng chọn màu sắc!"); return false; }

    // Gọi hàm addToCart từ props, truyền cả object product đầy đủ + lựa chọn size/màu
    // (giỏ hàng cần biết chính xác biến thể nào được chọn, không chỉ id sản phẩm)
    addToCart(product, selectedSize, selectedColor);

    setAdded(true); // bật trạng thái "đã thêm" để đổi text nút thành "✓ Đã thêm vào giỏ!"
    // setTimeout tự động tắt trạng thái "added" sau 2 giây, để nút trở lại bình thường
    // (nếu không có dòng này, nút sẽ mãi mãi hiện "Đã thêm" dù người dùng chưa bấm lại)
    setTimeout(() => setAdded(false), 2000);

    return true; // báo hiệu thêm giỏ hàng thành công cho hàm gọi nó (ví dụ handleBuyNow)
  };

  // "Mua ngay" chỉ chuyển sang giỏ hàng khi đã thêm được sản phẩm thành công
  const handleBuyNow = () => {
    // Tái sử dụng lại toàn bộ logic validate + thêm giỏ của handleAddToCart,
    // tránh lặp code kiểm tra size/màu ở đây thêm lần nữa
    const ok = handleAddToCart();
    // Chỉ điều hướng sang trang giỏ hàng NẾU handleAddToCart trả về true
    // (tức là đã chọn đủ size + màu và thêm thành công) — nếu người dùng
    // chưa chọn gì, hàm sẽ tự alert cảnh báo và KHÔNG điều hướng đi đâu cả
    if (ok) navigate("/cart");
  };

  return (
    <div className="product-page">
      {/* Nút quay lại trang trước, dùng hook useSafeBack thay vì navigate(-1) trực tiếp
          để xử lý an toàn trường hợp không có history (ví dụ vào thẳng bằng link chia sẻ) */}
      <button className="back-btn" onClick={goBack}>← Quay lại</button>

      <div className="product-layout">

        {/* ===== CỘT TRÁI: Ảnh sản phẩm ===== */}
        <div className="product-gallery">
          <div className="main-img">
            {/* Hiện ảnh thật nếu có trường image, ngược lại hiện placeholder text
                (phòng trường hợp dữ liệu sản phẩm thiếu ảnh) */}
            {product.image
              ? <img src={product.image} alt={product.name} />
              : <span>Ảnh sản phẩm</span>
            }

            {/* Badge góc ảnh (ví dụ "Mới", "Sale", "Hot") chỉ hiện nếu sản phẩm có badge */}
            {product.badge && <span className="badge">{product.badge}</span>}

            {/* Nút trái tim yêu thích — CHỈ render nếu component cha có truyền hàm toggleWish xuống.
                Đây là cách làm nút này "optional": ở những nơi dùng ProductPage mà không cần
                chức năng wishlist (ví dụ preview trong trang admin) thì không cần lo phải xử lý gì thêm,
                chỉ cần không truyền prop toggleWish là nút tự động biến mất, không lỗi. */}
            {toggleWish && (
              <span
                // className động: thêm class "wished" nếu sản phẩm đã có trong wishlist,
                // CSS sẽ dựa vào class này để tô màu trái tim (ví dụ đỏ khi đã thích)
                className={`product-wish-btn ${wishlist.includes(product.id) ? "wished" : ""}`}
                title="Yêu thích"
                onClick={() => toggleWish(product.id)}
              >
                {/* Icon trái tim đổi giữa filled (♥) và outline (♡) tùy trạng thái đã thích hay chưa */}
                {wishlist.includes(product.id) ? "♥" : "♡"}
              </span>
            )}
          </div>
        </div>

        {/* ===== CỘT PHẢI: Thông tin + chọn size/màu ===== */}
        <div className="product-detail">
          <p className="detail-cat">{product.cat}</p>
          <h1>{product.name}</h1>

          <div className="detail-price">
            {fmt(product.price)}
            {/* Giá cũ gạch ngang chỉ hiện nếu sản phẩm có oldPrice (đang giảm giá) */}
            {product.oldPrice && (
              <span className="old-price">{fmt(product.oldPrice)}</span>
            )}
          </div>

          <p className="detail-desc">{product.desc}</p>

          {/* --- Chọn màu --- */}
          <div className="option-group">
            {/* Label động: hiện thêm "— đã chọn" ngay cạnh chữ "Màu sắc" khi người dùng đã bấm chọn 1 màu,
                giúp xác nhận trực quan ngay tại label, không chỉ dựa vào chấm màu highlight */}
            <label>Màu sắc {selectedColor && <span className="chosen">— đã chọn</span>}</label>
            <div className="color-list">
              {product.colors.map((c) => (
                <span
                  key={c}
                  // class "active" thêm vào chấm màu đang được chọn, so sánh trực tiếp
                  // giá trị màu (c) với selectedColor hiện tại trong state
                  className={`color-dot ${selectedColor === c ? "active" : ""}`}
                  // style inline: dùng chính giá trị màu (ví dụ "#000", "red") làm background
                  // — đây là lý do không thể tách class CSS cố định cho từng màu, vì màu là dữ liệu động
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </div>

          {/* --- Chọn size --- */}
          <div className="option-group">
            {/* Tương tự màu, label hiện thêm chính giá trị size đã chọn (ví dụ "— M", "— XL") */}
            <label>Kích cỡ {selectedSize && <span className="chosen">— {selectedSize}</span>}</label>
            <div className="size-list">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${selectedSize === s ? "active" : ""}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Nút thêm giỏ hàng — text và class đổi động dựa trên state "added"
              (đã phân tích ở handleAddToCart phía trên: tự tắt lại sau 2 giây) */}
          <button
            className={`btn-add-cart ${added ? "added" : ""}`}
            onClick={handleAddToCart}
          >
            {added ? "✓ Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
          </button>

          {/* Nút mua ngay: validate + thêm giỏ + điều hướng sang /cart nếu thành công */}
          <button
            className="btn-buy-now"
            onClick={handleBuyNow}
          >
            Mua ngay
          </button>

          {/* Thông tin phụ trợ tĩnh (chính sách vận chuyển/đổi trả), không phụ thuộc dữ liệu sản phẩm */}
          <div className="detail-meta">
            <p>🚚 Miễn phí vận chuyển cho đơn từ 500.000đ</p>
            <p>🔄 Đổi trả miễn phí trong 30 ngày</p>
          </div>
        </div>
      </div>

      {/* ===== Sản phẩm liên quan ===== */}
      {/* Chỉ render toàn bộ khối này nếu có ít nhất 1 sản phẩm liên quan,
          tránh hiện tiêu đề "Sản phẩm liên quan" trống trơn không có gì bên dưới */}
      {related.length > 0 && (
        <div className="related">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-grid">
            {related.map((p) => (
              <div
                key={p.id}
                className="related-card"
                // Bấm vào card liên quan sẽ điều hướng sang trang chi tiết của CHÍNH sản phẩm đó
                // (route thay đổi /product/:id => component re-render lại toàn bộ với id mới,
                // vì đây là cùng 1 component ProductPage, React sẽ tái sử dụng instance
                // thay vì mount lại từ đầu — đây cũng là lý do useEffect fetch ở trên
                // không có "id" trong dependency vẫn hoạt động đúng như đã giải thích)
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="related-thumb">
                  {p.image ? <img src={p.image} alt={p.name} /> : <span>Ảnh</span>}
                </div>
                <h4>{p.name}</h4>
                <span>{fmt(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
