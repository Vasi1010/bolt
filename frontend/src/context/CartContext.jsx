import { createContext, useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

const GUEST_CART_KEY = "bolt_guest_cart";

const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
};

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // storage unavailable
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      // Guest: load from localStorage
      setCart(loadGuestCart());
      return;
    }
    try {
      const { data } = await API.get("/cart");
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  // Guest cart helpers — used when user is not logged in
  const guestAddToCart = (product, quantity = 1) => {
    const current = loadGuestCart();
    const existing = current.items.find((i) => i.product._id === product._id);
    let updated;
    if (existing) {
      updated = {
        ...current,
        items: current.items.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      };
    } else {
      updated = {
        ...current,
        items: [...current.items, { product, quantity }],
      };
    }
    saveGuestCart(updated);
    setCart(updated);
  };

  const guestRemoveFromCart = (productId) => {
    const current = loadGuestCart();
    const updated = { ...current, items: current.items.filter((i) => i.product._id !== productId) };
    saveGuestCart(updated);
    setCart(updated);
  };

  const guestUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) { guestRemoveFromCart(productId); return; }
    const current = loadGuestCart();
    const updated = {
      ...current,
      items: current.items.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      ),
    };
    saveGuestCart(updated);
    setCart(updated);
  };

  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setCart(null);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  return (
    <CartContext.Provider value={{
      cart, fetchCart, setCart,
      guestAddToCart, guestRemoveFromCart, guestUpdateQuantity, clearGuestCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
