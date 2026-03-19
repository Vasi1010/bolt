import { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

function ProductCard({ product }) {
  const { user }       = useContext(AuthContext);
  const { fetchCart }  = useContext(CartContext);
  const navigate       = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);

  const createRipple = (e) => {
    const btn  = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const id   = Date.now();
    setRipples((r) => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
  };

  const handleAddToCart = async (e) => {
    createRipple(e);
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await API.post("/cart/add", { productId: product._id, quantity: 1 });
      fetchCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-parchment dark:bg-dk-elevated border border-beige dark:border-dk-border overflow-hidden mb-4">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-px bg-beige dark:bg-dk-border" />
            <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">No Image</span>
            <div className="w-12 h-px bg-beige dark:bg-dk-border" />
          </div>
        )}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 dark:group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <h2 className="font-display text-xl font-light text-charcoal dark:text-dk-text leading-tight mb-1">
          {product.name}
        </h2>
        <p className="text-gold text-sm tracking-wide mb-4 font-body font-light">
          ₹{product.price}
        </p>

        {/* Button with ripple */}
        <button
          ref={btnRef}
          onClick={handleAddToCart}
          disabled={adding}
          className={`btn-ripple mt-auto w-full py-3 text-[10px] tracking-wide2 uppercase font-medium transition-all duration-300 border ${
            added
              ? "bg-sage border-sage text-parchment"
              : adding
              ? "bg-charcoal dark:bg-dk-elevated border-charcoal dark:border-dk-border text-parchment dark:text-dk-text opacity-70"
              : "bg-transparent border-charcoal dark:border-dk-text text-charcoal dark:text-dk-text hover:bg-charcoal dark:hover:bg-dk-text hover:text-parchment dark:hover:text-dk-bg"
          }`}
        >
          {ripples.map((rp) => (
            <span key={rp.id} className="ripple-circle" style={{ width: "80px", height: "80px", left: rp.x - 40, top: rp.y - 40 }} />
          ))}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {added ? (
              <>
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2"><polyline points="2,8 6,12 14,4" /></svg>
                Added
              </>
            ) : adding ? (
              <span className="flex gap-1 items-center">
                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            ) : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
