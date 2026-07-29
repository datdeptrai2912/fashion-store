import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../pages/css/Navbar.css";
import logo from "../../pages/images/logo.png";

// Danh sách link điều hướng chính của navbar, khai báo tĩnh ở ngoài component
// để không bị tạo lại mỗi lần re-render (component chỉ đọc, không thay đổi mảng này)
const navLinks = [
  { label: "Cửa Hàng", path: "/" },
  { label: "Nữ", path: "/category/nu" },
  { label: "Nam", path: "/category/nam" },
  { label: "Phụ Kiện", path: "/category/phu-kien" },
  { label: "Bộ Sưu Tập Mới", path: "/category/moi" },
  { label: "Sale", path: "/category/sale" },
];

// Nhận props từ component cha (App.jsx):
// cartCount/wishCount: số lượng hiển thị trên badge giỏ hàng/wishlist (default = 0 nếu không truyền)
// user: object user đang đăng nhập (null nếu chưa đăng nhập) — dùng để hiển thị UI khác nhau
// setUser: hàm cập nhật user ở tầng cha, dùng khi đăng xuất
export default function Navbar({
  cartCount = 0,
  wishCount = 0,
  user,
  setUser,
}) {
  const [menuOpen, setMenuOpen] = useState(false); // trạng thái mở/đóng menu hamburger (mobile)
  const [searchOpen, setSearchOpen] = useState(false); // trạng thái hiện/ẩn thanh tìm kiếm
  const [searchVal, setSearchVal] = useState(""); // giá trị người dùng gõ vào ô tìm kiếm
  const navigate = useNavigate();

  // useRef tạo tham chiếu DOM tới thẻ <nav> — không gây re-render khi thay đổi
  // (khác với useState), dùng để kiểm tra vị trí click có nằm trong vùng nav hay không
  const navRef = useRef(null); // bao quanh toàn bộ <nav> để phát hiện click bên ngoài

  // Đóng menu hamburger khi click ra ngoài vùng nav
  useEffect(() => {
    // Nếu menu đang đóng thì không cần gắn listener làm gì — tối ưu, tránh lắng nghe
    // sự kiện click toàn trang một cách không cần thiết khi menu đã đóng sẵn
    if (!menuOpen) return;

    // Hàm xử lý: kiểm tra vị trí click (e.target) có nằm trong navRef.current hay không.
    // navRef.current.contains(e.target) trả về true nếu phần tử bị click là con của <nav>
    // (hoặc chính <nav>) — nếu click ra ngoài (contains = false) thì đóng menu lại.
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    // Lắng nghe sự kiện "mousedown" (không phải "click") trên toàn document —
    // mousedown bắt sớm hơn click, giúp UX mượt hơn khi đóng menu ngay lúc bắt đầu nhấn
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: gỡ listener khi menuOpen đổi (component re-run effect) hoặc unmount,
    // tránh rò rỉ bộ nhớ (memory leak) và tránh gắn trùng nhiều listener cùng lúc
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]); // effect chạy lại mỗi khi menuOpen thay đổi (mở/đóng)

  // Xử lý submit form tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault(); // chặn hành vi mặc định của form (reload trang)

    // trim() để loại bỏ khoảng trắng thừa đầu/cuối, tránh search với chuỗi chỉ toàn dấu cách
    if (searchVal.trim()) {
      // encodeURIComponent để escape ký tự đặc biệt (dấu cách, tiếng Việt có dấu, ký tự &, ?, v.v.)
      // khi nhét vào query string, tránh phá vỡ cấu trúc URL
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false); // đóng thanh tìm kiếm sau khi search
      setSearchVal(""); // reset lại ô input về rỗng
    }
    // Nếu searchVal rỗng (chỉ có khoảng trắng), không làm gì cả — không điều hướng, không đóng thanh search
  };

  return (
    // Fragment <> </> bọc ngoài cùng — không cần thiết lắm ở đây vì chỉ có 1 phần tử con
    // duy nhất (<nav>), có thể bỏ Fragment và trả thẳng <nav> mà không ảnh hưởng gì
    <>
      {/* ref={navRef} gắn tham chiếu DOM vào chính thẻ nav, dùng cho logic click-outside phía trên */}
      <nav className="topnav" ref={navRef}>
        <div className="topnav-inner">
          {/* Logo, click về trang chủ */}
          <Link to="/" className="topnav-logo">
            <img src={logo} alt="Duy & Đạt Fashion House" />
          </Link>

          {/* Danh sách link điều hướng — class "open" được thêm động khi menuOpen = true,
              CSS sẽ dựa vào class này để hiện menu trượt ra trên mobile */}
          <ul className={`topnav-links ${menuOpen ? "open" : ""}`}>
            {navLinks.map((link) => (
              // onClick trên <li> để đóng menu ngay khi chọn 1 link (chủ yếu có ý nghĩa trên mobile,
              // vì trên desktop menu luôn hiện sẵn, không cần đóng)
              <li key={link.label} onClick={() => setMenuOpen(false)}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}

            {/* Link "Admin" chỉ hiện thêm nếu user đã đăng nhập VÀ có role admin.
                Optional chaining user?.role tránh lỗi crash nếu user là null (chưa đăng nhập) */}
            {user?.role === "admin" && (
              <li onClick={() => setMenuOpen(false)}>
                <Link to="/admin">Admin</Link>
              </li>
            )}
          </ul>

          {/* Cụm icon bên phải: tìm kiếm, yêu thích, giỏ hàng, khu vực tài khoản */}
          <div className="topnav-icons">
            {/* Icon tìm kiếm — bật/tắt thanh search */}
            {/* Toggle searchOpen bằng phép phủ định !searchOpen — bấm lần 1 mở, bấm lần 2 đóng */}
            <span title="Tìm kiếm" onClick={() => setSearchOpen(!searchOpen)}>
              🔍
            </span>

            {/* Icon yêu thích */}
            {/* Badge số lượng chỉ hiện khi wishCount > 0, tránh hiện số "0" thừa thãi trên UI */}
            <span
              title="Yêu thích"
              className="cart-icon"
              onClick={() => navigate("/wishlist")}
            >
              ♡
              {wishCount > 0 && <span className="cart-badge">{wishCount}</span>}
            </span>

            {/* Icon giỏ hàng */}
            {/* Cùng pattern với wishlist: badge số lượng chỉ hiện nếu cartCount > 0 */}
            <span
              title="Giỏ hàng"
              className="cart-icon"
              onClick={() => navigate("/cart")}
            >
              🛍
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>

            {/* Khu vực xác thực người dùng — render 2 nhánh khác nhau tùy user đã đăng nhập hay chưa */}
            <div className="topnav-auth">
              <span className="divider" />{" "}
              {/* Đường kẻ phân cách giữa icon và khu vực auth */}
              {user ? (
                // NHÁNH 1: đã đăng nhập — hiện tên, nút đăng xuất, nút nạp tiền
                <>
                  <span className="user-name">👤 {user.name}</span>
                  {/* setUser(null) reset state user ở component cha về null => coi như đăng xuất.
                      Lưu ý: chỉ xóa state trong React, chưa thấy xóa token/localStorage ở đây —
                      nếu login() có lưu token vào localStorage thì cần thêm bước xóa token
                      tương ứng (thường nằm trong 1 hàm logout() riêng ở api/auth.js) để tránh
                      trường hợp token cũ vẫn còn sau khi bấm đăng xuất. */}
                  <button className="btn-logout" onClick={() => setUser(null)}>
                    Đăng xuất
                  </button>
                  <Link to="/bank" className="btn-bank">
                    Nạp Tiền
                  </Link>
                </>
              ) : (
                // NHÁNH 2: chưa đăng nhập — hiện nút nạp tiền, đăng nhập, đăng ký
                // Lưu ý: nút "Nạp Tiền" xuất hiện ở CẢ 2 nhánh (đã đăng nhập lẫn chưa),
                // nghĩa là người chưa đăng nhập vẫn bấm được /bank — cần kiểm tra lại
                // xem đây có phải chủ ý hay không, vì thông thường "nạp tiền" nên yêu cầu
                // đã đăng nhập trước (nếu không, trang /bank cần tự check lại user ở phía nó).
                <>
                  <Link to="/bank" className="btn-bank">
                    Nạp Tiền
                  </Link>
                  <Link to="/login" className="btn-login">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn-register">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Nút hamburger chỉ hiện trên mobile (ẩn qua CSS media query ở desktop),
              toggle menuOpen để mở/đóng menu điều hướng dạng dropdown/slide */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        {/* Thanh tìm kiếm mở rộng */}
        {/* Render có điều kiện: chỉ mount vào DOM khi searchOpen = true,
            khác với việc dùng CSS display:none — ở đây phần tử thực sự không tồn tại
            trong DOM khi đóng, giúp autoFocus hoạt động đúng mỗi lần mở lại */}
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                autoFocus // tự động focus vào ô input ngay khi thanh search vừa mở ra, không cần người dùng click thêm
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <button type="submit">Tìm →</button>
              {/* type="button" để KHÔNG trigger submit form khi bấm nút đóng (✕),
                  nếu không set sẽ mặc định type="submit" và vô tình gọi handleSearch */}
              <button
                type="button"
                className="close-search"
                onClick={() => setSearchOpen(false)}
              >
                ✕
              </button>
            </form>
          </div>
        )}
      </nav>
    </>
  );
}
