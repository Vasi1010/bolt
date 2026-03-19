import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusStyle = (s) => ({
    pending:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    confirmed: "bg-blue-50  dark:bg-blue-900/20  text-blue-700  dark:text-blue-400  border-blue-200  dark:border-blue-800",
    delivered: "bg-sage/10  dark:bg-sage/20       text-sage       dark:text-sage       border-sage/20   dark:border-sage/30",
    cancelled: "bg-red-50   dark:bg-red-900/20   text-red-700   dark:text-red-400   border-red-200   dark:border-red-800",
  }[s] || "bg-beige dark:bg-dk-elevated text-muted dark:text-dk-muted border-beige dark:border-dk-border");

  if (loading) return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-none" />)}
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center hero-fade">
      <div className="flex items-center gap-6 mb-10">
        <div className="h-px w-16 bg-beige dark:bg-dk-border" />
        <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Orders</span>
        <div className="h-px w-16 bg-beige dark:bg-dk-border" />
      </div>
      <h2 className="font-display text-4xl font-light text-charcoal dark:text-dk-text italic mb-3">No orders yet</h2>
      <p className="text-muted dark:text-dk-muted text-sm tracking-wide mb-10">Your order history will appear here.</p>
      <button onClick={() => navigate("/")} className="btn-dark">Start Shopping</button>
    </div>
  );

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-8 mb-14">
          <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">My Orders</h1>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase whitespace-nowrap">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        <div className="space-y-3">
          {orders.map((order, index) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="product-fade bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-6 cursor-pointer hover:border-gold dark:hover:border-gold transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-display text-lg font-light text-charcoal dark:text-dk-text">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <span className={`text-[10px] tracking-wide uppercase px-2.5 py-0.5 border font-medium ${statusStyle(order.status)}`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-muted dark:text-dk-muted tracking-wide">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-muted dark:text-dk-muted uppercase tracking-wide mb-0.5">Total</p>
                    <p className="font-display text-xl font-light text-gold">₹{order.totalAmount}</p>
                  </div>
                  <span className="text-muted dark:text-dk-muted group-hover:text-gold transition-colors text-lg">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;
