import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Cart() {
  const { cart, fetchCart, guestRemoveFromCart, guestUpdateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const handleRemove = async (productId) => {
    if (!user) { guestRemoveFromCart(productId); return; }
    try {
      await API.delete("/cart/remove", { data: { productId } });
      fetchCart();
      toast.success("Item removed");
    } catch { toast.error("Failed to remove item"); }
  };

  const handleUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) { handleRemove(productId); return; }
    if (!user) { guestUpdateQuantity(productId, newQuantity); return; }
    setUpdatingId(productId);
    try {
      await API.put("/cart/update", { productId, quantity: newQuantity });
      fetchCart();
    } catch { toast.error("Failed to update quantity"); }
    finally { setUpdatingId(null); }
  };

  const handleQtyInput = (productId, val, maxStock) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) return;
    const clamped = maxStock ? Math.min(n, maxStock) : n;
    handleUpdate(productId, clamped);
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center hero-fade">
        <div className="flex items-center gap-6 mb-10">
          <div className="h-px w-16 bg-beige dark:bg-dk-border" />
          <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Your Cart</span>
          <div className="h-px w-16 bg-beige dark:bg-dk-border" />
        </div>
        <h2 className="font-display text-4xl font-light text-charcoal dark:text-dk-text italic mb-3">Your cart is empty</h2>
        <p className="text-muted dark:text-dk-muted text-sm tracking-wide mb-10">Discover something extraordinary.</p>
        <Link to="/" className="btn-dark">Shop Collection</Link>
      </div>
    );
  }

  const total = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-8 mb-14">
          <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">Your Cart</h1>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase whitespace-nowrap">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Guest notice */}
        {!user && (
          <div className="mb-8 px-5 py-4 border border-gold/30 bg-gold/5 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
            <p className="text-xs text-muted dark:text-dk-muted tracking-wide">
              You're shopping as a guest. <Link to="/login" className="text-gold underline underline-offset-2">Sign in</Link> to keep your cart saved across devices.
            </p>
          </div>
        )}

        {/* Column Labels */}
        <div className="hidden md:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-beige dark:border-dk-border">
          {["Product","Quantity","Unit","Total"].map((l, i) => (
            <span key={l} className={`text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase ${
              i===0?"col-span-5":i===1?"col-span-3 text-center":i===2?"col-span-2 text-right":"col-span-2 text-right"
            }`}>{l}</span>
          ))}
        </div>

        {/* Items */}
        <div className="divide-y divide-beige dark:divide-dk-border">
          {cart.items.map((item) => {
            const isUpdating = updatingId === item.product._id;
            return (
              <div key={item.product._id} className="grid grid-cols-12 gap-4 py-7 items-center">
                <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                  <Link to={`/products/${item.product._id}`} className="w-16 h-20 bg-parchment dark:bg-dk-elevated border border-beige dark:border-dk-border flex-shrink-0 overflow-hidden block">
                    {item.product.image
                      ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="text-[8px] text-muted dark:text-dk-muted">None</span></div>
                    }
                  </Link>
                  <div>
                    <Link to={`/products/${item.product._id}`}>
                      <h3 className="font-display text-lg font-light text-charcoal dark:text-dk-text leading-tight hover:text-gold transition-colors">{item.product.name}</h3>
                    </Link>
                    <p className="text-gold text-xs mt-1">₹{item.product.price}</p>
                    <button onClick={() => handleRemove(item.product._id)}
                      className="md:hidden text-[10px] text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text tracking-wide uppercase mt-2 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Qty — with direct input */}
                <div className="col-span-6 md:col-span-3 flex items-center justify-start md:justify-center">
                  <button
                    onClick={() => handleUpdate(item.product._id, item.quantity - 1)}
                    disabled={isUpdating}
                    className="w-8 h-8 border border-beige dark:border-dk-border text-charcoal dark:text-dk-text text-sm hover:border-gold hover:text-gold transition-colors duration-200 flex items-center justify-center disabled:opacity-40"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={item.product.stock || 999}
                    value={item.quantity}
                    onChange={(e) => handleQtyInput(item.product._id, e.target.value, item.product.stock)}
                    onBlur={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (isNaN(n) || n < 1) handleUpdate(item.product._id, 1);
                    }}
                    disabled={isUpdating}
                    className="w-12 h-8 border-t border-b border-beige dark:border-dk-border bg-transparent text-center text-sm font-medium text-charcoal dark:text-dk-text focus:outline-none focus:border-gold transition-colors disabled:opacity-40"
                  />
                  <button
                    onClick={() => handleUpdate(item.product._id, item.quantity + 1)}
                    disabled={isUpdating || (item.product.stock && item.quantity >= item.product.stock)}
                    className="w-8 h-8 border border-beige dark:border-dk-border text-charcoal dark:text-dk-text text-sm hover:border-gold hover:text-gold transition-colors duration-200 flex items-center justify-center disabled:opacity-40"
                  >+</button>
                </div>

                <div className="hidden md:flex col-span-2 justify-end">
                  <span className="text-sm text-muted dark:text-dk-muted">₹{item.product.price}</span>
                </div>

                <div className="col-span-6 md:col-span-2 flex flex-col items-end gap-2">
                  <span className="font-display text-lg font-light text-charcoal dark:text-dk-text">₹{item.product.price * item.quantity}</span>
                  <button onClick={() => handleRemove(item.product._id)}
                    className="hidden md:block text-[10px] text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text tracking-wide uppercase transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-12 pt-8 border-t border-beige dark:border-dk-border">
          <div className="md:flex md:justify-end">
            <div className="md:w-80 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-beige dark:border-dk-border">
                <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Subtotal</span>
                <span className="font-display text-xl font-light text-charcoal dark:text-dk-text">₹{total}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-beige dark:border-dk-border">
                <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Delivery</span>
                <span className="text-xs text-muted dark:text-dk-muted italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] tracking-luxury text-charcoal dark:text-dk-text uppercase font-medium">Order Total</span>
                <span className="font-display text-2xl font-light text-gold">₹{total}</span>
              </div>
              <button onClick={() => navigate("/checkout")} className="btn-dark w-full mt-6 text-center">Proceed to Checkout</button>
              <Link to="/" className="block text-center text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mt-3 hover:text-charcoal dark:hover:text-dk-text transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
