import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Cart() {
  const { cart, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleRemove = async (productId) => {
    try {
      await API.delete("/cart/remove", { data: { productId } });
      fetchCart();
      toast.success("Item removed");
    } catch { toast.error("Failed to remove item"); }
  };

  const handleUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) { handleRemove(productId); return; }
    try {
      await API.put("/cart/update", { productId, quantity: newQuantity });
      fetchCart();
    } catch { toast.error("Failed to update quantity"); }
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

        {/* Column Labels */}
        <div className="hidden md:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-beige dark:border-dk-border">
          {["Product","Quantity","Unit","Total"].map((l,i) => (
            <span key={l} className={`text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase ${i===0?"col-span-5":i===1?"col-span-3 text-center":i===2?"col-span-2 text-right":"col-span-2 text-right"}`}>{l}</span>
          ))}
        </div>

        {/* Items */}
        <div className="divide-y divide-beige dark:divide-dk-border">
          {cart.items.map((item) => (
            <div key={item.product._id} className="grid grid-cols-12 gap-4 py-7 items-center">
              <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                <div className="w-16 h-20 bg-parchment dark:bg-dk-elevated border border-beige dark:border-dk-border flex-shrink-0 overflow-hidden">
                  {item.product.image
                    ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-[8px] text-muted dark:text-dk-muted">None</span></div>
                  }
                </div>
                <div>
                  <h3 className="font-display text-lg font-light text-charcoal dark:text-dk-text leading-tight">{item.product.name}</h3>
                  <p className="text-gold text-xs mt-1">₹{item.product.price}</p>
                  <button onClick={() => handleRemove(item.product._id)} className="md:hidden text-[10px] text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text tracking-wide uppercase mt-2 transition-colors">Remove</button>
                </div>
              </div>

              {/* Qty */}
              <div className="col-span-6 md:col-span-3 flex items-center justify-start md:justify-center">
                {[
                  { label: "−", fn: () => handleUpdate(item.product._id, item.quantity - 1) },
                  null,
                  { label: "+", fn: () => handleUpdate(item.product._id, item.quantity + 1) },
                ].map((btn, i) =>
                  btn === null
                    ? <span key="q" className="w-10 h-8 border-t border-b border-beige dark:border-dk-border flex items-center justify-center text-sm font-medium text-charcoal dark:text-dk-text">{item.quantity}</span>
                    : <button key={btn.label} onClick={btn.fn} className="w-8 h-8 border border-beige dark:border-dk-border text-charcoal dark:text-dk-text text-sm hover:border-gold hover:text-gold transition-colors duration-200 flex items-center justify-center">{btn.label}</button>
                )}
              </div>

              <div className="hidden md:flex col-span-2 justify-end">
                <span className="text-sm text-muted dark:text-dk-muted">₹{item.product.price}</span>
              </div>

              <div className="col-span-6 md:col-span-2 flex flex-col items-end gap-2">
                <span className="font-display text-lg font-light text-charcoal dark:text-dk-text">₹{item.product.price * item.quantity}</span>
                <button onClick={() => handleRemove(item.product._id)} className="hidden md:block text-[10px] text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text tracking-wide uppercase transition-colors">Remove</button>
              </div>
            </div>
          ))}
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
