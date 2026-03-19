import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => navigate("/"));
  }, [id, navigate]);

  const statusStyle = (s) => ({
    pending:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    confirmed: "bg-blue-50  dark:bg-blue-900/20  text-blue-700  dark:text-blue-400  border-blue-200  dark:border-blue-800",
    delivered: "bg-sage/10  dark:bg-sage/20       text-sage       dark:text-sage       border-sage/20   dark:border-sage/30",
    cancelled: "bg-red-50   dark:bg-red-900/20   text-red-700   dark:text-red-400   border-red-200   dark:border-red-800",
  }[s] || "bg-beige dark:bg-dk-elevated text-muted dark:text-dk-muted border-beige dark:border-dk-border");

  if (!order) return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded-none mb-10" />
        <div className="skeleton h-32 rounded-none" />
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

        <button onClick={() => navigate(-1)} className="mt-8 text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors">
          ← Go Back
        </button>
      </div>
    </div>
  );
}

export default OrderDetails;
