import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../pages/css/Navbar.css";

const navLinks = [
  { label: "Cửa Hàng",        path: "/" },
  { label: "Nữ",               path: "/category/nu" },
  { label: "Nam",              path: "/category/nam" },
  { label: "Phụ Kiện",        path: "/category/phu-kien" },
  { label: "Bộ Sưu Tập Mới",  path: "/category/moi" },
  { label: "Sale",             path: "/category/sale" },
];

export default function Navbar({ cartCount = 0, wishCount = 0, user, setUser }) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState("");
  const navigate = useNavigate();
  const navRef = useRef(null); // bao quanh toàn bộ <nav> để phát hiện click bên ngoài

  // Đóng menu hamburger khi click ra ngoài vùng nav
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  };

  return (
    <>
      <nav className="topnav" ref={navRef}>
        <div className="topnav-inner">
          <Link to="/" className="topnav-logo">◆LUXE SHOP</Link>

          <ul className={`topnav-links ${menuOpen ? "open" : ""}`}>
            {navLinks.map((link) => (
              <li key={link.label} onClick={() => setMenuOpen(false)}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
            {user?.role === "admin" && (
              <li onClick={() => setMenuOpen(false)}>
                <Link to="/admin">Admin</Link>
              </li>
            )}
          </ul>

          <div className="topnav-icons">
            {/* Icon tìm kiếm — bật/tắt thanh search */}
            <span title="Tìm kiếm" onClick={() => setSearchOpen(!searchOpen)}>🔍</span>

            {/* Icon yêu thích */}
            <span title="Yêu thích" className="cart-icon" onClick={() => navigate("/wishlist")}>
              ♡
              {wishCount > 0 && <span className="cart-badge">{wishCount}</span>}
            </span>

            {/* Icon giỏ hàng */}
            <span title="Giỏ hàng" className="cart-icon" onClick={() => navigate("/cart")}>
              🛍
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>

            <div className="topnav-auth">
              <span className="divider" />
              {user ? (
                <>
                  <span className="user-name">👤 {user.name}</span>
                  <button className="btn-logout" onClick={() => setUser(null)}>Đăng xuất</button>
                  <Link to="/bank" className="btn-bank">Nạp Tiền</Link>
                  "
                </>
              ) : (
                <>
                <Link to="/bank" className="btn-bank">Nạp Tiền</Link>
                  <Link to="/login" className="btn-login">Đăng nhập</Link>
                  <Link to="/register" className="btn-register">Đăng ký</Link>
                </>
              )}
            </div>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>

        {/* Thanh tìm kiếm mở rộng */}
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                autoFocus
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <button type="submit">Tìm →</button>
              <button type="button" className="close-search" onClick={() => setSearchOpen(false)}>✕</button>
            </form>
          </div>
        )}
      </nav>
    </>
  );
}
