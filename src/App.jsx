// ============================================
// IMPORT CÁC THƯ VIỆN VÀ MODULE CẦN THIẾT
// ============================================
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// - BrowserRouter: component gốc dùng để bật tính năng định tuyến (routing) cho toàn bộ ứng dụng,
//   dựa trên URL của trình duyệt (dùng History API)
// - Routes: nơi khai báo tất cả các <Route> con bên trong
// - Route: định nghĩa 1 tuyến đường cụ thể, gồm path (đường dẫn) và element (component hiển thị)
// - useLocation: hook (hàm đặc biệt của React) giúp lấy thông tin URL hiện tại, gồm pathname, hash, search...

import { useState, useEffect, useRef } from "react";
// - useState: hook tạo ra 1 biến trạng thái (state), khi state đổi thì component tự render lại
// - useEffect: hook chạy đoạn code phụ (side-effect) sau khi component render, có thể chạy lại khi dependency đổi
// - useRef: hook tạo ra 1 "hộp chứa" giá trị, giữ nguyên giữa các lần render, thay đổi giá trị KHÔNG làm re-render

import { getStoredUser, logout as authLogout, isLoggedIn } from "./api/auth";
// - getStoredUser: hàm đọc thông tin user đã đăng nhập (thường lưu trong localStorage) để khởi tạo state
// - logout: hàm xử lý đăng xuất phía client (xóa token...), được đổi tên thành authLogout khi import
//   (đổi tên để tránh trùng với tên biến/hàm khác trong file này)
// - isLoggedIn: hàm kiểm tra xem hiện tại có token hợp lệ / đang đăng nhập hay không

import { getCart, saveCart } from "./api/cart";
// - getCart: gọi API (GET) lấy giỏ hàng đã lưu trên server của user hiện tại
// - saveCart: gọi API (POST/PUT) lưu giỏ hàng hiện tại của client lên server

import { getProducts } from "./api/products";
// - getProducts: gọi API lấy toàn bộ danh sách sản phẩm, dùng để ghép nối thông tin đầy đủ cho giỏ hàng

import Navbar from "./assets/components/Navbar";
// Thanh điều hướng trên cùng của trang (logo, menu, icon giỏ hàng, đăng nhập...)

import PromoBar from "./assets/components/PromoBar";
// Thanh thông báo khuyến mãi/quảng cáo

import HomePage from "./assets/components/HomePage";
// Component trang chủ

import CategoryPage from "./assets/components/CategoryPage";
// Component trang danh mục sản phẩm (theo category)

import ProductPage from "./assets/components/ProductPage";
// Component trang chi tiết 1 sản phẩm

import CartPage from "./assets/components/CartPage";
// Component trang giỏ hàng

import CheckoutPage from "./assets/components/CheckoutPage";
// Component trang thanh toán / đặt hàng

import SearchPage from "./assets/components/SearchPage";
// Component trang tìm kiếm sản phẩm

import WishlistPage from "./assets/components/WishlistPage";
// Component trang danh sách sản phẩm yêu thích

import AdminPage from "./assets/components/AdminPage";
// Component trang quản trị (dành cho admin)

import Bank from "./assets/components/bank";
// Component trang hiển thị thông tin ngân hàng để chuyển khoản

import LoginPage from "./assets/components/LoginPage";
// Component trang đăng nhập

import RegisterPage from "./assets/components/RegisterPage";
// Component trang đăng ký tài khoản

import ShippingPage from "./assets/components/ShippingPage";
// Component trang thông tin vận chuyển

import ReturnsPage from "./assets/components/ReturnsPage";
// Component trang chính sách đổi trả

import SupportPage from "./assets/components/SupportPage";
// Component trang hỗ trợ khách hàng


// ============================================
// COMPONENT PHỤ: CUỘN TRANG THEO HASH TRÊN URL
// ============================================

// Cuộn trang lên phần có id trùng với hash trên URL (vd: /#shop-section)
// sau khi điều hướng, để các link như "Mua ngay" trên PromoBar hoạt động đúng.
function ScrollToHash() {
  // Component này không hiển thị giao diện gì cả (return null ở cuối),
  // nó chỉ tồn tại để "lắng nghe" sự thay đổi URL và thực hiện hành động cuộn trang

  const location = useLocation();
  // Lấy object location hiện tại từ react-router.
  // location.pathname = đường dẫn hiện tại (vd: "/category/ao-nam")
  // location.hash = phần sau dấu # trong URL (vd: "#shop-section")

  useEffect(() => {
    // Đoạn code bên trong sẽ tự động chạy lại mỗi khi location.pathname hoặc location.hash thay đổi
    // (nhờ mảng dependency [location.pathname, location.hash] ở cuối useEffect)

    if (location.hash) {
      // Kiểm tra: URL hiện tại CÓ chứa hash hay không (vd: có "#shop-section" hay không)

      const el = document.querySelector(location.hash);
      // Dùng document.querySelector để tìm phần tử HTML có id trùng với hash
      // (location.hash đã có sẵn dấu # nên querySelector dùng được luôn, vd querySelector("#shop-section"))

      if (el) {
        // Nếu tìm thấy phần tử đó trên trang

        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Cuộn trang một cách mượt mà (smooth) sao cho phần tử đó nằm ở đầu khung nhìn (block: "start")

        return;
        // Dừng hàm tại đây, KHÔNG chạy tiếp xuống dòng window.scrollTo bên dưới
      }
    }

    window.scrollTo({ top: 0 });
    // Trường hợp này chạy khi: URL không có hash, HOẶC có hash nhưng không tìm thấy phần tử tương ứng
    // => cuộn trang về đầu (top: 0) như mặc định khi chuyển trang

  }, [location.pathname, location.hash]);
  // Dependency array: effect chỉ chạy lại khi pathname hoặc hash thay đổi (không chạy lại linh tinh)

  return null;
  // Component không render bất kỳ HTML/JSX nào ra giao diện
}


// ============================================
// HẰNG SỐ VÀ HÀM PHỤ CHO WISHLIST
// ============================================

const WISHLIST_KEY = "fashion-store-wishlist";
// Chuỗi khóa (key) cố định, dùng làm tên để lưu/đọc dữ liệu wishlist trong localStorage của trình duyệt

// Đọc wishlist (wishlist khách vãng lai vẫn dùng localStorage — server yêu cầu
// đăng nhập cho /api/wishlist, nên giữ nguyên hành vi cũ để khách chưa đăng
// nhập cũng dùng được tính năng yêu thích).
const loadWishlist = () => {
  // Hàm này được gọi 1 lần duy nhất để khởi tạo giá trị ban đầu cho state wishlist

  try {
    // Bọc trong try/catch vì dữ liệu trong localStorage có thể bị lỗi định dạng (không phải JSON hợp lệ)

    const saved = localStorage.getItem(WISHLIST_KEY);
    // Đọc chuỗi dữ liệu đã lưu trước đó trong localStorage ứng với key WISHLIST_KEY
    // Nếu chưa từng lưu, saved sẽ là null

    return saved ? JSON.parse(saved) : [];
    // Nếu có dữ liệu (saved khác null/rỗng) -> parse chuỗi JSON đó thành mảng JavaScript
    // Nếu không có dữ liệu -> trả về mảng rỗng []

  } catch {
    // Nếu quá trình JSON.parse bị lỗi (dữ liệu hỏng)

    return [];
    // Trả về mảng rỗng để tránh làm crash toàn bộ ứng dụng
  }
};


// ============================================
// COMPONENT CHÍNH CỦA ỨNG DỤNG
// ============================================

function App() {

  const [cart, setCart] = useState([]);
  // Khai báo state "cart" (giỏ hàng), giá trị khởi tạo là mảng rỗng
  // cart: mảng chứa các sản phẩm đã thêm vào giỏ, mỗi phần tử gồm thông tin sản phẩm + size + color + qty
  // setCart: hàm dùng để cập nhật state cart

  const [user, setUser] = useState(getStoredUser);
  // Khai báo state "user" (thông tin người dùng đang đăng nhập)
  // Giá trị khởi tạo lấy từ hàm getStoredUser (React sẽ tự gọi hàm này 1 lần khi component mount)
  // setUser: hàm dùng để cập nhật state user (vd: sau khi login thành công, hoặc khi logout thì set về null)

  const [wishlist, setWishlist] = useState(loadWishlist);
  // Khai báo state "wishlist" (danh sách id sản phẩm yêu thích)
  // Giá trị khởi tạo lấy từ hàm loadWishlist (đọc từ localStorage)
  // setWishlist: hàm cập nhật state wishlist

  // Đánh dấu đã tải xong giỏ hàng từ server, tránh việc save đè lên
  // trước khi kịp load (vd: vừa refresh trang khi đang đăng nhập).
  const cartLoadedRef = useRef(false);
  // Tạo 1 ref (không gây re-render khi thay đổi), giá trị ban đầu là false
  // Dùng làm "cờ đánh dấu": true nghĩa là đã tải xong giỏ hàng từ server ít nhất 1 lần
  // Mục đích: tránh trường hợp effect "lưu cart lên server" chạy trước khi effect "tải cart từ server" load xong,
  // gây ghi đè mất dữ liệu giỏ hàng cũ trên server bằng giỏ hàng rỗng ban đầu

  useEffect(() => {
    // Effect thứ 1: TỰ ĐỘNG LƯU WISHLIST VÀO LOCALSTORAGE MỖI KHI WISHLIST THAY ĐỔI

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(wishlist)
    );
    // Chuyển mảng wishlist thành chuỗi JSON rồi lưu vào localStorage với key WISHLIST_KEY
    // Nhờ vậy, khi người dùng tải lại trang, loadWishlist() sẽ đọc lại được đúng danh sách yêu thích

  }, [wishlist]);
  // Dependency [wishlist]: effect này CHỈ chạy lại khi giá trị wishlist thay đổi

  // user chỉ còn được lưu bởi login()/logout() trong src/api/auth.js.
  // Ở đây chỉ cần dọn token khi setUser(null) được gọi (vd: bấm "Đăng xuất").
  useEffect(() => {
    // Effect thứ 2: XỬ LÝ KHI USER BỊ ĐĂNG XUẤT (user chuyển thành null/falsy)

    if (!user) {
      // Điều kiện: nếu user hiện tại là null, undefined, hoặc giá trị falsy khác
      // (nghĩa là không có ai đăng nhập, hoặc vừa mới đăng xuất)

      authLogout();
      // Gọi hàm logout của module auth để dọn dẹp token/thông tin đăng nhập phía client (vd: xóa khỏi localStorage)

      cartLoadedRef.current = false;
      // Reset lại cờ "đã load cart" về false
      // Để nếu sau này user đăng nhập lại, effect tải cart từ server sẽ chạy lại từ đầu

      setCart([]);
      // Xóa sạch dữ liệu giỏ hàng đang hiển thị trên giao diện (vì user đã đăng xuất, không còn thuộc về ai)
    }
    // Nếu user khác null (có user đăng nhập) thì không làm gì cả trong effect này

  }, [user]);
  // Dependency [user]: effect này chạy lại mỗi khi giá trị user thay đổi

  // Khi có user đăng nhập (kể cả lúc load lại trang), tải giỏ hàng đã lưu
  // trên server và ghép với thông tin sản phẩm để hiển thị đầy đủ (tên, ảnh, giá).
  useEffect(() => {
    // Effect thứ 3: TẢI GIỎ HÀNG TỪ SERVER KHI CÓ USER ĐĂNG NHẬP

    if (!user || !isLoggedIn()) return;
    // Điều kiện dừng sớm: nếu KHÔNG có user, HOẶC isLoggedIn() trả về false (token không hợp lệ)
    // thì return luôn, không thực hiện việc tải giỏ hàng

    let alive = true;
    // Biến cờ cục bộ, đánh dấu component (hoặc effect này) vẫn còn "sống"
    // Dùng để tránh gọi setCart sau khi component đã unmount hoặc effect đã bị hủy (tránh warning/lỗi)

    Promise.all([getCart(), getProducts()])
      // Gọi đồng thời 2 API bất đồng bộ:
      // - getCart(): lấy các dòng giỏ hàng đã lưu trên server (thường chỉ gồm product_id, size, color, qty)
      // - getProducts(): lấy toàn bộ danh sách sản phẩm (đầy đủ tên, ảnh, giá...)
      // Promise.all chờ CẢ HAI cùng hoàn thành rồi mới chạy .then()

      .then(([cartRows, products]) => {
        // Khi cả 2 API đều thành công, nhận về mảng kết quả: cartRows (từ getCart) và products (từ getProducts)

        if (!alive) return;
        // Nếu trong lúc chờ API mà component đã unmount (alive = false) thì dừng luôn, không set state nữa

        const restored = cartRows
          .map((row) => {
            // Duyệt qua từng dòng giỏ hàng đã lưu trên server (row: { product_id, size, color, qty })

            const product = products.find((p) => p.id === row.product_id);
            // Tìm trong danh sách sản phẩm đầy đủ (products) sản phẩm có id trùng với row.product_id

            if (!product) return null;
            // Nếu không tìm thấy sản phẩm tương ứng (có thể đã bị xóa khỏi hệ thống)
            // -> trả về null để sau đó loại bỏ dòng này

            return { ...product, size: row.size, color: row.color, qty: row.qty };
            // Nếu tìm thấy: tạo object mới gồm toàn bộ thông tin sản phẩm (...product)
            // kết hợp thêm size, color, qty lấy từ dữ liệu đã lưu trên server
          })
          .filter(Boolean);
          // Lọc bỏ toàn bộ các phần tử null (những dòng không tìm thấy sản phẩm tương ứng)
          // Boolean được dùng làm hàm lọc: giữ lại các giá trị "truthy", loại bỏ null/undefined/false

        setCart(restored);
        // Cập nhật state cart bằng mảng đã khôi phục đầy đủ thông tin từ server
      })
      .catch(() => {
        // Không tải được giỏ hàng đã lưu — giữ giỏ hàng hiện tại trên client
        // (Nếu API lỗi, không làm gì cả, giữ nguyên state cart hiện tại trên client)
      })
      .finally(() => {
        // Khối finally luôn chạy, bất kể .then() hay .catch() được gọi (thành công hay thất bại)

        if (alive) cartLoadedRef.current = true;
        // Nếu component vẫn còn "sống", đánh dấu cờ cartLoadedRef.current = true
        // Báo hiệu: đã hoàn tất việc tải cart từ server (dù có dữ liệu hay lỗi),
        // từ giờ effect lưu cart lên server (effect thứ 4 bên dưới) được phép hoạt động
      });

    return () => { alive = false; };
    // Đây là hàm "cleanup" của useEffect, được React tự động gọi khi:
    // - component unmount (bị gỡ khỏi giao diện), hoặc
    // - effect chuẩn bị chạy lại lần tiếp theo (do user thay đổi)
    // Việc set alive = false giúp các .then()/.catch()/.finally() ở trên biết rằng nên bỏ qua, không set state nữa

  }, [user]);
  // Dependency [user]: effect này chạy lại mỗi khi giá trị user thay đổi (vd: đăng nhập user mới)

  // Mỗi khi giỏ hàng thay đổi và đã đăng nhập, lưu lại lên server
  useEffect(() => {
    // Effect thứ 4: TỰ ĐỘNG LƯU GIỎ HÀNG LÊN SERVER MỖI KHI CART THAY ĐỔI

    if (!user || !isLoggedIn() || !cartLoadedRef.current) return;
    // Điều kiện dừng sớm, CHỈ tiếp tục lưu lên server khi ĐỒNG THỜI thỏa cả 3 điều kiện:
    // 1. Có user (đã đăng nhập)
    // 2. isLoggedIn() trả về true (token hợp lệ)
    // 3. cartLoadedRef.current là true (đã tải xong cart từ server ít nhất 1 lần)
    // Nếu thiếu 1 trong 3 điều kiện trên -> return, không lưu
    // (Mục đích: tránh lưu đè cart rỗng lên server ngay khi component vừa mount, trước khi kịp tải dữ liệu cũ về)

    const items = cart.map((item) => ({
      productId: item.id,
      qty: item.qty,
      size: item.size,
      color: item.color,
    }));
    // Chuyển đổi mảng cart (đang chứa đầy đủ thông tin sản phẩm: tên, ảnh, giá...)
    // thành mảng gọn nhẹ hơn, chỉ giữ lại các trường cần thiết để gửi lên server:
    // productId, qty, size, color

    saveCart(items).catch(() => {
      // Gọi API saveCart để lưu danh sách items lên server
      // Nếu lỗi (catch), không làm gì cả — bỏ qua lỗi

      // Lỗi lưu giỏ hàng lên server — bỏ qua, giỏ hàng vẫn dùng được ở client
    });

  }, [cart, user]);
  // Dependency [cart, user]: effect này chạy lại mỗi khi cart HOẶC user thay đổi

  const toggleWish = (id) => {
    // Hàm bật/tắt trạng thái yêu thích (wishlist) của 1 sản phẩm, nhận vào id sản phẩm

    setWishlist((prev) =>
      // Dùng dạng "functional update": prev là giá trị wishlist hiện tại (mảng các id)

      prev.includes(id)
        // Kiểm tra: id này đã có sẵn trong mảng wishlist hiện tại chưa?

        ? prev.filter((x) => x !== id)
        // NẾU ĐÃ CÓ: tạo mảng mới bằng cách lọc bỏ id này ra (nghĩa là bỏ yêu thích / unlike)

        : [...prev, id]
        // NẾU CHƯA CÓ: tạo mảng mới bằng cách copy toàn bộ phần tử cũ (...prev) rồi thêm id mới vào cuối (thêm yêu thích / like)
    );
  };

  const addToCart = (product, size, color) => {
    // Hàm thêm 1 sản phẩm (kèm size và color được chọn) vào giỏ hàng
    // product: object thông tin sản phẩm; size, color: lựa chọn của người dùng

    setCart((prev) => {
      // Dùng "functional update": prev là giá trị cart hiện tại

      const existed = prev.find(
        (item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
      );
      // Tìm trong giỏ hàng hiện tại xem đã có sản phẩm này với ĐÚNG size và color chưa
      // (cùng 1 sản phẩm nhưng khác size/color được coi là 2 dòng khác nhau trong giỏ)

      if (existed) {
        // NẾU ĐÃ TỒN TẠI (cùng id, size, color)

        return prev.map((item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
            ? {
                ...item,
                qty: item.qty + 1,
                // Nếu đúng là dòng cần cập nhật: giữ nguyên toàn bộ thông tin cũ (...item), chỉ tăng qty lên 1
              }
            : item
            // Các dòng khác trong giỏ giữ nguyên, không thay đổi
        );
      }

      return [
        ...prev,
        // NẾU CHƯA TỒN TẠI: giữ nguyên toàn bộ giỏ hàng cũ (...prev)

        {
          ...product,
          size,
          color,
          qty: 1,
          // rồi thêm vào cuối 1 object mới: gồm toàn bộ thông tin sản phẩm (...product),
          // kèm size, color vừa chọn, và số lượng khởi tạo qty = 1
        },
      ];
    });
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );
  // Tính tổng số lượng sản phẩm trong giỏ hàng bằng cách cộng dồn (reduce) trường qty của từng item
  // Giá trị khởi tạo của sum là 0
  // Kết quả cartCount dùng để hiển thị số (badge) trên icon giỏ hàng ở Navbar

  return (
    <BrowserRouter>
      {/* Bọc toàn bộ nội dung bên trong để bật tính năng định tuyến theo URL cho cả ứng dụng */}

      <Navbar
        cartCount={cartCount}
        // Truyền tổng số sản phẩm trong giỏ để Navbar hiển thị badge số lượng

        wishCount={wishlist.length}
        // Truyền số lượng sản phẩm trong wishlist để Navbar hiển thị badge yêu thích

        user={user}
        // Truyền thông tin user hiện tại để Navbar biết hiển thị "Đăng nhập" hay tên user/avatar

        setUser={setUser}
        // Truyền hàm setUser để Navbar có thể cập nhật state user (vd: khi bấm đăng xuất)
      />

      <PromoBar />
      {/* Thanh quảng cáo/khuyến mãi, không cần truyền props vì tự quản lý nội dung bên trong */}

      <ScrollToHash />
      {/* Component vô hình, tự động cuộn trang theo hash mỗi khi URL thay đổi */}

      <Routes>
        {/* Khai báo toàn bộ các tuyến đường (route) của ứng dụng, React Router sẽ chọn
            đúng <Route> khớp với URL hiện tại để render */}

        <Route
          path="/"
          // Route ứng với đường dẫn gốc (trang chủ)

          element={
            <HomePage
              wishlist={wishlist}
              // Truyền wishlist để HomePage biết sản phẩm nào đang được yêu thích (hiển thị icon trái tim)

              toggleWish={toggleWish}
              // Truyền hàm toggleWish để HomePage có thể gọi khi người dùng bấm icon yêu thích
            />
          }
        />

        <Route
          path="/category/:slug"
          // Route động: :slug là tham số lấy từ URL, vd truy cập /category/ao-nam thì slug = "ao-nam"

          element={
            <CategoryPage
              addToCart={addToCart}
              // Truyền hàm addToCart để CategoryPage gọi khi người dùng bấm "Thêm vào giỏ" ngay tại trang danh mục

              wishlist={wishlist}
              toggleWish={toggleWish}
              // Tương tự HomePage, để hỗ trợ tính năng yêu thích ngay tại trang danh mục
            />
          }
        />

        <Route
          path="/product/:id"
          // Route động: :id là id sản phẩm lấy từ URL, vd /product/12 thì id = "12"

          element={
            <ProductPage
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWish={toggleWish}
              // Trang chi tiết sản phẩm cũng cần đủ 3 props này để: thêm vào giỏ, và quản lý yêu thích
            />
          }
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              // Truyền toàn bộ giỏ hàng để CartPage hiển thị danh sách sản phẩm trong giỏ

              setCart={setCart}
              // Truyền hàm setCart để CartPage có thể chỉnh sửa giỏ hàng (xóa, tăng/giảm số lượng...)
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cart={cart}
              setCart={setCart}
              // Trang thanh toán cần đọc giỏ hàng để tính tổng tiền,
              // và có thể cần setCart để xóa giỏ hàng sau khi đặt hàng thành công
            />
          }
        />

        <Route
          path="/bank"
          element={<Bank />}
          // Trang hiển thị thông tin ngân hàng, không cần truyền props vì tự chứa dữ liệu tĩnh
        />

        <Route
          path="/login"
          element={
            <LoginPage
              setUser={setUser}
              // Truyền hàm setUser để LoginPage cập nhật state user ngay sau khi đăng nhập thành công
            />
          }
        />

        <Route
          path="/register"
          element={<RegisterPage />}
          // Trang đăng ký tài khoản, tự xử lý form và gọi API bên trong, không cần props từ App
        />

        <Route
          path="/admin"
          element={
            <AdminPage
              user={user}
              // Truyền user để AdminPage kiểm tra quyền truy cập (vd: chỉ cho vào nếu user là admin)
            />
          }
        />

        <Route
          path="/search"
          element={<SearchPage />}
          // Trang tìm kiếm, tự quản lý logic tìm kiếm bên trong component
        />

        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              // Truyền danh sách id yêu thích để WishlistPage hiển thị đúng các sản phẩm đã thích

              toggleWish={toggleWish}
              // Truyền hàm toggleWish để có thể bỏ yêu thích ngay tại trang này
            />
          }
        />

        <Route path="/van-chuyen" element={<ShippingPage />} />
        {/* Trang thông tin/chính sách vận chuyển, đường dẫn tiếng Việt không dấu */}

        <Route path="/doi-tra" element={<ReturnsPage />} />
        {/* Trang chính sách đổi trả hàng */}

        <Route path="/ho-tro" element={<SupportPage />} />
        {/* Trang hỗ trợ khách hàng (liên hệ, FAQ...) */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
