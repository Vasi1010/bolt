import { createContext, useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      const { data } = await API.get("/cart");
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  // Fetch cart when user logs in
  useEffect(() => {
    fetchCart();
  }, [user]);

  // 🔥 IMPORTANT: expose setCart also
  return (
    <CartContext.Provider value={{ cart, fetchCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};
