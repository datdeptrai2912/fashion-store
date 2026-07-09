import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./assets/components/Navbar";
import PromoBar from "./assets/components/PromoBar";
import HomePage from "./assets/components/HomePage";
import CategoryPage from "./assets/components/CategoryPage";
import ProductPage from "./assets/components/ProductPage";
import CartPage from "./assets/components/CartPage";
import CheckoutPage from "./assets/components/CheckoutPage";
import SearchPage from "./assets/components/SearchPage";
import WishlistPage from "./assets/components/WishlistPage";
import AdminPage from "./assets/components/AdminPage";
import Bank from "./assets/components/bank";
import LoginPage from "./assets/components/LoginPage";
import RegisterPage from "./assets/components/RegisterPage";
import ShippingPage from "./assets/components/ShippingPage";
import ReturnsPage from "./assets/components/ReturnsPage";
import SupportPage from "./assets/components/SupportPage";

// Cuộn trang lên phần có id trùng với hash trên URL (vd: /#shop-section)
// sau khi điều hướng, để các link như "Mua ngay" trên PromoBar hoạt động đúng.
function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return null;
}

const WISHLIST_KEY = "fashion-store-wishlist";
const USER_KEY = "fashion-store-user";

// Đọc wishlist
const loadWishlist = () => {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Đọc user
const loadUser = () => {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(loadUser);
  const [wishlist, setWishlist] = useState(loadWishlist);

  useEffect(() => {
    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const toggleWish = (id) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const addToCart = (product, size, color) => {
    setCart((prev) => {
      const existed = prev.find(
        (item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
      );

      if (existed) {
        return prev.map((item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          size,
          color,
          qty: 1,
        },
      ];
    });
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  return (
    <BrowserRouter>
      <Navbar
        cartCount={cartCount}
        wishCount={wishlist.length}
        user={user}
        setUser={setUser}
      />

      <PromoBar />
      <ScrollToHash />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              wishlist={wishlist}
              toggleWish={toggleWish}
            />
          }
        />

        <Route
          path="/category/:slug"
          element={
            <CategoryPage
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWish={toggleWish}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductPage
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWish={toggleWish}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route
          path="/bank"
          element={<Bank />}
        />

        <Route
          path="/login"
          element={
            <LoginPage
              setUser={setUser}
            />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage
              setUser={setUser}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <AdminPage
              user={user}
            />
          }
        />

        <Route
          path="/search"
          element={<SearchPage />}
        />

        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              toggleWish={toggleWish}
            />
          }
        />

        <Route path="/van-chuyen" element={<ShippingPage />} />
        <Route path="/doi-tra" element={<ReturnsPage />} />
        <Route path="/ho-tro" element={<SupportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;