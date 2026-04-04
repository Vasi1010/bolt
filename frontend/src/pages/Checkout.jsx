import { useState, useContext, useReducer, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const EMPTY_ADDRESS = {
  name: "", phone: "", street: "", city: "", state: "", pincode: "",
};

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

/* ─── Form reducer (single state update per keystroke = no focus loss) ───────── */

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        address: { ...state.address, [action.field]: action.value },
        errors:  { ...state.errors,  [action.field]: "" },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
}

/* ─── Sub-components (module scope + memo = never remount, skip re-render) ───── */

const Field = memo(function Field({ label, field, placeholder, type = "text", value, onChange, error }) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(field, e.target.value)}
        className="luxury-input pl-0"
      />
      {error && <p className="text-[10px] text-red-500 mt-1 tracking-wide">{error}</p>}
    </div>
  );
});

const StateSelect = memo(function StateSelect({ value, onChange, error }) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-2">
        State
      </label>
      <select
        value={value}
        onChange={(e) => onChange("state", e.target.value)}
        className="luxury-input pl-0 bg-transparent"
      >
        <option value="">Select state</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {error && <p className="text-[10px] text-red-500 mt-1 tracking-wide">{error}</p>}
    </div>
  );
});

const PayOption = memo(function PayOption({ value, title, desc, selected, onChange }) {
  return (
    <label className={`flex items-center gap-5 p-5 border cursor-pointer transition-all duration-200 ${
      selected
        ? "border-gold bg-cream dark:bg-dk-elevated"
        : "border-beige dark:border-dk-border hover:border-muted dark:hover:border-dk-muted"
    }`}>
      <input type="radio" value={value} checked={selected} onChange={() => onChange(value)} />
      <div className="flex-1">
        <p className="font-body font-medium text-sm text-charcoal dark:text-dk-text tracking-wide">{title}</p>
        <p className="text-xs text-muted dark:text-dk-muted mt-0.5 tracking-wide">{desc}</p>
      </div>
      {selected && <span className="text-[10px] tracking-luxury text-gold uppercase">Selected</span>}
    </label>
  );
});

function StepBar({ step }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {["Delivery Address", "Payment"].map((label, i) => {
        const num    = i + 1;
        const active = step === num;
        const done   = step > num;
        return (
          <div key={label} className="flex items-center gap-3 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border transition-all duration-300 ${
              done   ? "bg-gold border-gold text-parchment" :
              active ? "border-gold text-gold bg-transparent" :
                       "border-beige dark:border-dk-border text-muted dark:text-dk-muted"
            }`}>
              {done ? (
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="2,8 6,12 14,4" />
                </svg>
              ) : num}
            </div>
            <span className={`text-[10px] tracking-luxury uppercase whitespace-nowrap ${
              active ? "text-charcoal dark:text-dk-text" : "text-muted dark:text-dk-muted"
            }`}>{label}</span>
            {i === 0 && <div className="flex-1 h-px bg-beige dark:bg-dk-border" />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */

function Checkout() {
  const [step, setStep]     = useState(1);
  const [method, setMethod] = useState("RAZORPAY");
  const [loading, setLoading] = useState(false);
  const navigate            = useNavigate();
  const { fetchCart }       = useContext(CartContext);

  const [{ address, errors }, dispatch] = useReducer(formReducer, {
    address: EMPTY_ADDRESS,
    errors:  {},
  });

  /* ── Stable change handler — same reference on every render ── */
  const handleAddressChange = useCallback((field, value) => {
    dispatch({ type: "SET_FIELD", field, value });
  }, []);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!address.name.trim())                         e.name    = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(address.phone.trim()))  e.phone   = "Enter a valid 10-digit mobile number";
    if (!address.street.trim())                       e.street  = "Street address is required";
    if (!address.city.trim())                         e.city    = "City is required";
    if (!address.state)                               e.state   = "State is required";
    if (!/^\d{6}$/.test(address.pincode.trim()))      e.pincode = "Enter a valid 6-digit pincode";
    if (Object.keys(e).length > 0) {
      dispatch({ type: "SET_ERRORS", errors: e });
      return false;
    }
    return true;
  };

  const handleAddressContinue = () => {
    if (validate()) setStep(2);
  };

  /* ── Checkout submission ── */
  const handleCheckout = async () => {
    try {
      setLoading(true);
      const { data: orderData } = await API.post("/orders", {
        paymentMethod: method,
        deliveryAddress: address,
      });
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
        modal: { ondismiss: () => toast("Payment cancelled") },
        theme: { color: "#B8934A" },
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

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-8 mb-14">
          <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">Checkout</h1>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
        </div>

        <StepBar step={step} />

        {/* ── Step 1: Address ── */}
        {step === 1 && (
          <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-10 page-enter">
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-8">Delivery Address</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Full Name"      field="name"  placeholder="Your full name"           value={address.name}  onChange={handleAddressChange} error={errors.name}  />
                <Field label="Mobile Number"  field="phone" placeholder="10-digit mobile number"   value={address.phone} onChange={handleAddressChange} error={errors.phone} type="tel" />
              </div>

              <Field label="Street Address" field="street" placeholder="House no., building, street, area" value={address.street} onChange={handleAddressChange} error={errors.street} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="City" field="city" placeholder="City" value={address.city} onChange={handleAddressChange} error={errors.city} />
                <StateSelect value={address.state} onChange={handleAddressChange} error={errors.state} />
              </div>

              <Field label="Pincode" field="pincode" placeholder="6-digit pincode" value={address.pincode} onChange={handleAddressChange} error={errors.pincode} type="tel" />
            </div>

            <div className="h-px bg-beige dark:bg-dk-border my-8" />

            <button onClick={handleAddressContinue} className="btn-gold w-full text-center">
              Continue to Payment
            </button>
            <button onClick={() => navigate("/cart")}
              className="w-full text-center text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mt-4 hover:text-charcoal dark:hover:text-dk-text transition-colors">
              ← Return to Cart
            </button>
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 2 && (
          <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-10 page-enter">

            {/* Address summary */}
            <div className="flex items-start justify-between mb-8 pb-8 border-b border-beige dark:border-dk-border">
              <div>
                <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-2">Delivering to</p>
                <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium">{address.name}</p>
                <p className="text-xs text-muted dark:text-dk-muted mt-0.5">{address.street}, {address.city}</p>
                <p className="text-xs text-muted dark:text-dk-muted">{address.state} — {address.pincode}</p>
              </div>
              <button onClick={() => setStep(1)}
                className="text-[10px] tracking-luxury text-gold uppercase hover:text-gold-light transition-colors">
                Change
              </button>
            </div>

            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-8">Payment Method</p>
            <div className="space-y-5">
              <PayOption value="RAZORPAY" title="Pay Online"       desc="Secure payment via Razorpay" selected={method === "RAZORPAY"} onChange={setMethod} />
              <PayOption value="COD"      title="Cash on Delivery" desc="Pay when your order arrives" selected={method === "COD"}      onChange={setMethod} />
            </div>

            <div className="h-px bg-beige dark:bg-dk-border my-8" />
            <p className="text-xs text-muted dark:text-dk-muted italic font-display text-center mb-8">
              Your order will be confirmed upon successful payment.
            </p>

            <button onClick={handleCheckout} disabled={loading} className="btn-gold w-full text-center">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="ml-1">Processing</span>
                </span>
              ) : "Place Order"}
            </button>
            <button onClick={() => setStep(1)}
              className="w-full text-center text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mt-4 hover:text-charcoal dark:hover:text-dk-text transition-colors">
              ← Back to Address
            </button>
          </div>
        )}

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