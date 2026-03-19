import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Particles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    setParticles(Array.from({ length: 18 }, (_, i) => ({
      id: i, left: `${20 + Math.random() * 60}%`, top: `${30 + Math.random() * 40}%`,
      delay: `${0.8 + Math.random() * 1.2}s`, size: `${4 + Math.random() * 5}px`,
      opacity: 0.4 + Math.random() * 0.6,
    })));
  }, []);
  return <>{particles.map((p) => <span key={p.id} className="particle" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, opacity: p.opacity }} />)}</>;
}

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId  = location.state?.orderId;

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-8 relative overflow-hidden">
      <Particles />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(184,147,74,0.07) 0%, transparent 70%)" }} />

      <div className="text-center max-w-md relative z-10">
        {/* Animated ring + check */}
        <div className="success-icon-wrap flex justify-center mb-10">
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
            <circle className="success-circle" cx="50" cy="50" r="47" stroke="#B8934A" strokeWidth="1" strokeLinecap="round" />
            <circle cx="50" cy="50" r="40" stroke="#B8934A" strokeWidth="0.4" opacity="0.3" />
            <polyline className="success-check" points="30,52 44,66 70,36" stroke="#B8934A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="success-line h-px bg-gold" style={{ width: "40px", animationDelay: "1.3s" }} />
          <span className="text-[10px] tracking-luxury text-gold uppercase" style={{ opacity: 0, animation: "fadeIn 0.5s ease 1.4s forwards" }}>Confirmed</span>
          <div className="success-line h-px bg-gold" style={{ width: "40px", animationDelay: "1.3s" }} />
        </div>

        <h1 className="success-title font-display text-5xl md:text-6xl font-light text-charcoal dark:text-dk-text leading-none mb-2">Order Placed</h1>
        <p className="success-subtitle font-display italic text-xl text-muted dark:text-dk-muted font-light mb-8">Thank you for your purchase.</p>

        {orderId && (
          <div className="success-ref inline-block bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border px-6 py-4 mb-8">
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">Order Reference</p>
            <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium tracking-widest">#{orderId.slice(-10).toUpperCase()}</p>
          </div>
        )}

        <p className="success-copy text-xs text-muted dark:text-dk-muted tracking-wide leading-relaxed mb-10">
          We've received your order and are preparing it with care.<br />You'll receive an update once it's on its way.
        </p>

        <div className="success-cta flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate("/orders")} className="btn-ghost">View Orders</button>
          <button onClick={() => navigate("/")}       className="btn-dark">Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
