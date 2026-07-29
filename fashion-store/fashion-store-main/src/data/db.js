import { products as defaultProducts } from "./products";
import { defaultUsers } from "./users";

const PRODUCT_KEY = "fashion-store-products";
const USER_KEY = "fashion-store-users";

const parseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const loadProducts = () => {
  if (typeof localStorage === "undefined") return defaultProducts;
  return parseJSON(localStorage.getItem(PRODUCT_KEY), defaultProducts);
};

export const saveProducts = (products) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
};

export const loadUsers = () => {
  if (typeof localStorage === "undefined") return defaultUsers;
  return parseJSON(localStorage.getItem(USER_KEY), defaultUsers);
};

export const saveUsers = (users) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(users));
};

export const getProductById = (id) =>
  loadProducts().find((product) => product.id === Number(id));

export const getProducts = () => loadProducts();
