import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";

function Checkout() {
  const [loading, setLoading] = useState(false);
  const [method, setMethod]   = useState("RAZORPAY");
  const navigate              = useNavigate();
  const { fetchCart }         = useContext(CartContext);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const { data: orderData } = await API.post("/orders", { paymentMethod: method });
      const orderId = orderData.order._id;

      if (method === "COD") {
        await fetchCart();
        navigate("/success", { state: { orderId } });
        return;
      }

      const { data } = await API.post(`/payments/razorpay?orderId=${orderId}`);
      if (!window.Razorpay) { alert("Razorpay SDK failed to load"); return; }

      const options = {
        key: data.key, amount: data.amount, currency: data.currency,
        name: "Bolt Store", description: "Order Payment", order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await API.post("/payments/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            await fetchCart();
            navigate("/success", { state: { orderId } });
          } catch { toast.error("Payment verification failed"); }
        },
        modal:  { ondismiss: () => toast("Payment cancelled") },
        theme:  { color: "#B8934A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const PayOption = ({ value, title, desc }) => (
    <label className={`flex items-center gap-5 p-5 border cursor-pointer transition-all duration-200 ${
      method === value
        ? "border-gold bg-cream dark:bg-dk-elevated"
        : "border-beige dark:border-dk-border hover:border-muted dark:hover:border-dk-muted"
    }`}>
      <input type="radio" value={value} checked={method === value} onChange={(e) => setMethod(e.target.value)} />
      <div className="flex-1">
        <p className="font-body font-medium text-sm text-charcoal dark:text-dk-text tracking-wide">{title}</p>
        <p className="text-xs text-muted dark:text-dk-muted mt-0.5 tracking-wide">{desc}</p>
      </div>
      {method === value && <span className="text-[10px] tracking-luxury text-gold uppercase">Selected</span>}
    </label>
  );

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-8 mb-14">
          <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">Checkout</h1>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
        </div>

        <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-10">
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-8">Payment Method</p>

          <div className="space-y-5">
            <PayOption value="RAZORPAY" title="Pay Online"        desc="Secure payment via Razorpay" />
            <PayOption value="COD"      title="Cash on Delivery"  desc="Pay when your order arrives" />
          </div>

          <div className="h-px bg-beige dark:bg-dk-border my-8" />
          <p className="text-xs text-muted dark:text-dk-muted italic font-display text-center mb-8">
            Your order will be confirmed upon successful payment.
          </p>

          <button onClick={handleCheckout} disabled={loading} className="btn-gold w-full text-center">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{animationDelay:"0ms"}} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{animationDelay:"150ms"}} />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{animationDelay:"300ms"}} />
                <span className="ml-1">Processing</span>
              </span>
            ) : "Place Order"}
          </button>

          <button onClick={() => navigate("/cart")} className="w-full text-center text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mt-4 hover:text-charcoal dark:hover:text-dk-text transition-colors">
            ← Return to Cart
          </button>
        </div>

        <div className="flex justify-center gap-12 mt-8 py-6 border-t border-beige dark:border-dk-border">
          {["Secure Payment", "Quality Assured", "Fast Delivery"].map((item) => (
            <p key={item} className="text-[10px] tracking-wide uppercase text-muted dark:text-dk-muted">{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
