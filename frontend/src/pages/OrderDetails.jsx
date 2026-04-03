import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

const STEPS = [
  { key: "placed",     label: "Placed",     icon: "📋" },
  { key: "confirmed",  label: "Confirmed",  icon: "✓"  },
  { key: "shipped",    label: "Shipped",    icon: "📦" },
  { key: "delivered",  label: "Delivered",  icon: "🏠" },
];

const statusToStep = {
  pending:   0,
  confirmed: 1,
  shipped:   2,
  delivered: 3,
  cancelled: -1,
};

function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 py-6 px-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
        <span className="text-xs tracking-wide text-red-600 dark:text-red-400 uppercase font-medium">
          Order Cancelled
        </span>
      </div>
    );
  }

  const currentStep = statusToStep[status] ?? 0;

  return (
    <div className="py-8 px-6">
      <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-8">Order Progress</p>
      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-0 right-0 h-px bg-beige dark:bg-dk-border" />
        <div
          className="absolute top-4 left-0 h-px bg-gold transition-all duration-700"
          style={{ width: currentStep === 0 ? "0%" : `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => {
          const done    = i < currentStep;
          const current = i === currentStep;
          return (
            <div key={step.key} className="flex flex-col items-center gap-3 relative z-10 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                done    ? "bg-gold border-gold text-parchment" :
                current ? "bg-parchment dark:bg-dk-surface border-gold text-gold" :
                "bg-parchment dark:bg-dk-surface border-beige dark:border-dk-border text-muted dark:text-dk-muted"
              }`}>
                {done ? (
                  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2,8 6,12 14,4" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-medium">{i + 1}</span>
                )}
              </div>
              <div className="text-center">
                <p className={`text-[9px] tracking-luxury uppercase font-medium ${
                  done || current ? "text-charcoal dark:text-dk-text" : "text-muted dark:text-dk-muted"
                }`}>{step.label}</p>
                {current && <div className="w-1 h-1 rounded-full bg-gold mx-auto mt-1.5 animate-pulse" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => navigate("/"));
  }, [id, navigate]);

  const statusStyle = (s) => ({
    pending:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    confirmed: "bg-blue-50  dark:bg-blue-900/20  text-blue-700  dark:text-blue-400  border-blue-200  dark:border-blue-800",
    shipped:   "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    delivered: "bg-sage/10  dark:bg-sage/20       text-sage       dark:text-sage       border-sage/20   dark:border-sage/30",
    cancelled: "bg-red-50   dark:bg-red-900/20   text-red-700   dark:text-red-400   border-red-200   dark:border-red-800",
  }[s] || "bg-beige dark:bg-dk-elevated text-muted dark:text-dk-muted border-beige dark:border-dk-border");

  if (!order) return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded-none mb-10" />
        <div className="skeleton h-32 rounded-none" />
        <div className="skeleton h-24 rounded-none" />
        <div className="skeleton h-48 rounded-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-16 px-8 hero-fade">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-8 mb-14">
          <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">Order Details</h1>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
        </div>

        {/* Meta Card */}
        <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-8 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Order ID", value: `#${order._id.slice(-8).toUpperCase()}` },
              { label: "Status",   value: null },
              { label: "Date",     value: new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) },
              { label: "Total",    value: null, gold: true },
            ].map(({ label, value, gold }) => (
              <div key={label}>
                <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1.5">{label}</p>
                {label === "Status" ? (
                  <span className={`text-[10px] tracking-wide uppercase px-2.5 py-0.5 border font-medium ${statusStyle(order.status)}`}>{order.status}</span>
                ) : gold ? (
                  <p className="font-display text-xl font-light text-gold">₹{order.totalAmount}</p>
                ) : (
                  <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium">{value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Customer info */}
          {order.user && (
            <div className="mt-6 pt-6 border-t border-beige dark:border-dk-border grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1.5">Customer</p>
                <p className="font-body text-sm text-charcoal dark:text-dk-text">{order.user.name}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1.5">Email</p>
                <p className="font-body text-sm text-charcoal dark:text-dk-text">{order.user.email}</p>
              </div>
            </div>
          )}

          {/* Delivery address */}
          {order.deliveryAddress && (
            <div className="mt-6 pt-6 border-t border-beige dark:border-dk-border">
              <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-3">Delivery Address</p>
              <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium">{order.deliveryAddress.name}</p>
              <p className="text-xs text-muted dark:text-dk-muted mt-0.5">{order.deliveryAddress.phone}</p>
              <p className="text-xs text-muted dark:text-dk-muted mt-0.5">{order.deliveryAddress.street}</p>
              <p className="text-xs text-muted dark:text-dk-muted">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
              </p>
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border mb-6">
          <OrderTimeline status={order.status} />
        </div>

        {/* Items Card */}
        <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-8">
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-6">Items Ordered</p>
          <div className="divide-y divide-beige dark:divide-dk-border">
            {order.items.map((item, i) => (
              <div key={i} className="py-5 flex justify-between items-center">
                <div>
                  <p className="font-display text-lg font-light text-charcoal dark:text-dk-text">{item.product?.name || "Product"}</p>
                  <p className="text-xs text-muted dark:text-dk-muted mt-1 tracking-wide">₹{item.price} × {item.quantity}</p>
                </div>
                <p className="font-display text-lg font-light text-gold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-5 border-t border-beige dark:border-dk-border flex justify-between items-center">
            <span className="text-[10px] tracking-luxury text-charcoal dark:text-dk-text uppercase font-medium">Order Total</span>
            <span className="font-display text-2xl font-light text-gold">₹{order.totalAmount}</span>
          </div>
        </div>

        <button onClick={() => navigate(-1)}
          className="mt-8 text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors">
          ← Go Back
        </button>
      </div>
    </div>
  );
}

export default OrderDetails;