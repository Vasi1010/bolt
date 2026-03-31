import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../api/axios";

const STAGES = [
  { key: "placed",    label: "Order Placed",     icon: "📋", triggerAt: 0   },
  { key: "confirmed", label: "Being Prepared",   icon: "👨‍🍳", triggerAt: 120 },
  { key: "shipped",   label: "Rider On The Way", icon: "🏍️", triggerAt: 480 },
  { key: "delivered", label: "Delivered!",        icon: "🏠", triggerAt: 900 },
];
const TOTAL = 900;

// ── Gold floating particles ───────────────────────────────────────────────────
function Particles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    setParticles(Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top:  `${20 + Math.random() * 60}%`,
      delay: `${0.5 + Math.random() * 1.5}s`,
      size:  `${3 + Math.random() * 6}px`,
      opacity: 0.3 + Math.random() * 0.7,
    })));
  }, []);
  return (
    <>
      {particles.map((p) => (
        <span key={p.id} className="particle" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, opacity: p.opacity }} />
      ))}
    </>
  );
}

// ── Confetti burst on delivery ────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => {
    const angle = (i / 32) * 360;
    const dist  = 60 + Math.random() * 100;
    const cx    = `${Math.cos((angle * Math.PI) / 180) * dist}px`;
    const cy    = `${Math.sin((angle * Math.PI) / 180) * dist - 40}px`;
    const cr    = `${-180 + Math.random() * 360}deg`;
    const colors = ["#B8934A","#D4A85A","#6B8F71","#FEFCF8","#E2DAD0","#F0C060"];
    const color  = colors[i % colors.length];
    const shape  = i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%";
    return { i, cx, cy, cr, color, shape };
  });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {pieces.map(({ i, cx, cy, cr, color, shape }) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: i % 2 === 0 ? "8px" : "5px",
            height: i % 2 === 0 ? "8px" : "12px",
            backgroundColor: color,
            borderRadius: shape,
            "--cx": cx, "--cy": cy, "--cr": cr,
            animation: `confettiBurst 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ── Animated sky + city delivery scene ───────────────────────────────────────
function DeliveryScene({ stage, riderPct, delivered }) {
  const isRiding   = stage >= 2;
  const isDark     = false; // could wire to ThemeContext if desired
  const skyFrom    = delivered ? "#FFF9E6" : stage >= 2 ? "#FEF3C7" : "#EFF6FF";
  const skyTo      = delivered ? "#FDE68A" : stage >= 2 ? "#FCD34D40" : "#BFDBFE40";

  return (
    <div
      className="relative w-full overflow-hidden rounded-none"
      style={{ height: "200px", background: `linear-gradient(to bottom, ${skyFrom}, ${skyTo})` }}
    >
      {/* ── Stars (pre-shipping) */}
      {stage < 2 && (
        <div className="absolute inset-0">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="star-twinkle absolute w-1 h-1 rounded-full bg-gold"
              style={{ left: `${5 + i * 6.8}%`, top: `${8 + (i % 4) * 12}%`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      )}

      {/* ── Sun (rises when shipped) */}
      {stage >= 2 && (
        <div className="absolute" style={{ top: "18px", right: "60px", animation: "sunRise 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="9" fill="#F59E0B" opacity="0.9" />
            {[...Array(8)].map((_, i) => (
              <line key={i}
                x1="19" y1="4" x2="19" y2="8"
                stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"
                transform={`rotate(${i * 45} 19 19)`} opacity="0.7"
              />
            ))}
          </svg>
        </div>
      )}

      {/* ── Clouds */}
      {[
        { cls: "cloud-drift-1", top: "14px",  opacity: 0.6, scale: 1    },
        { cls: "cloud-drift-2", top: "28px",  opacity: 0.4, scale: 0.7  },
        { cls: "cloud-drift-3", top: "8px",   opacity: 0.5, scale: 0.85 },
      ].map(({ cls, top, opacity, scale }, ci) => (
        <div key={ci} className={`${cls} absolute pointer-events-none`}
          style={{ top, opacity, transform: `scale(${scale})`, transformOrigin: "left center" }}>
          <svg width="80" height="30" viewBox="0 0 80 30" fill="none">
            <ellipse cx="40" cy="22" rx="34" ry="12" fill="white" opacity="0.85" />
            <ellipse cx="28" cy="18" rx="18" ry="14" fill="white" opacity="0.85" />
            <ellipse cx="54" cy="16" rx="16" ry="13" fill="white" opacity="0.85" />
          </svg>
        </div>
      ))}

      {/* ── Scrolling city skyline */}
      <div className="city-scroll absolute bottom-14 left-0" style={{ width: "200%", display: "flex" }}>
        {[0, 1].map((rep) => (
          <svg key={rep} width="640" height="80" viewBox="0 0 640 80" fill="none" style={{ flexShrink: 0 }}>
            {/* Buildings — varied heights */}
            {[
              [0,  40, 30, 40], [32, 20, 28, 60], [62, 10, 22, 70], [86, 30, 35, 50],
              [123,15, 25, 65], [150,35, 20, 45], [172,5,  30, 75], [204,25, 28, 55],
              [234,40, 22, 40], [258,10, 30, 70], [290,30, 25, 50], [317,20, 35, 60],
              [354,8,  22, 72], [378,35, 28, 45], [408,15, 30, 65], [440,28, 20, 52],
              [462,5,  35, 75], [499,32, 25, 48], [526,18, 28, 62], [556,38, 22, 42],
              [580,12, 30, 68], [612,25, 28, 55],
            ].map(([x, y, w, h], bi) => (
              <g key={bi}>
                <rect x={x} y={y} width={w} height={h} fill={bi % 3 === 0 ? "#D4C5B0" : bi % 3 === 1 ? "#C8B99A" : "#BFB090"} />
                {/* Windows */}
                {Array.from({ length: Math.floor(h / 16) }).map((_, row) =>
                  Array.from({ length: Math.floor(w / 10) }).map((_, col) => (
                    <rect key={`${row}-${col}`}
                      x={x + 4 + col * 10} y={y + 6 + row * 14}
                      width="5" height="7"
                      fill="#B8934A"
                      style={{ animation: `windowPulse ${1.5 + (bi + row + col) * 0.3}s ease-in-out infinite`, animationDelay: `${(bi * 0.2 + col * 0.1)}s`, fillOpacity: 0.4 }}
                    />
                  ))
                )}
              </g>
            ))}
          </svg>
        ))}
      </div>

      {/* ── Ground + scrolling road */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "56px", background: "#C8B99A" }}>
        {/* Road surface */}
        <div className="absolute top-0 left-0 right-0" style={{ height: "38px", background: "#6B6357" }}>
          {/* Road scroll wrapper */}
          <div className="road-scroll absolute top-0 left-0" style={{ width: "200%", height: "100%" }}>
            {[0, 1].map((rep) => (
              <div key={rep} style={{ position: "absolute", left: `${rep * 50}%`, top: 0, width: "50%", height: "100%" }}>
                {/* Dashed centre line */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} style={{ position: "absolute", left: `${i * 5.5}%`, top: "17px", width: "32px", height: "3px", background: "#B8934A", opacity: 0.45 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Kerb */}
        <div className="absolute left-0 right-0" style={{ top: "38px", height: "6px", background: "#A09080" }} />
        {/* Pavement */}
        <div className="absolute left-0 right-0" style={{ top: "44px", height: "12px", background: "#C8B99A" }} />
      </div>

      {/* ── Destination house — visible from shipment stage */}
      {stage >= 2 && (
        <div className={`absolute bottom-9 right-8 ${delivered ? "house-glow" : ""}`} style={{ animation: "sunRise 0.8s ease forwards" }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            {/* House body */}
            <rect x="10" y="26" width="32" height="26" fill="#D4C5B0" />
            {/* Roof */}
            <polygon points="6,28 26,10 46,28" fill="#8B7355" />
            {/* Door */}
            <rect x="20" y="38" width="12" height="14" rx="1" fill="#6B5B3E" />
            <circle cx="30" cy="45" r="1.5" fill="#B8934A" />
            {/* Windows */}
            <rect x="12" y="30" width="8" height="8" rx="1" fill="#B8934A"
              style={{ fillOpacity: delivered ? 0.9 : 0.3, animation: delivered ? "windowPulse 1s ease-in-out infinite" : "none" }} />
            <rect x="32" y="30" width="8" height="8" rx="1" fill="#B8934A"
              style={{ fillOpacity: delivered ? 0.9 : 0.3, animation: delivered ? "windowPulse 1.3s ease-in-out infinite" : "none" }} />
            {/* Chimney */}
            <rect x="34" y="14" width="6" height="12" fill="#8B7355" />
          </svg>
          {delivered && (
            <div style={{ position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)", animation: "deliveredPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards", fontSize: "22px" }}>
              🎉
            </div>
          )}
        </div>
      )}

      {/* ── Rider */}
      {isRiding && !delivered && (
        <div
          className="rider-bounce absolute bottom-10"
          style={{
            left: `calc(${riderPct * 0.72}% + 4px)`,
            transition: "left 1s linear",
            maxWidth: "calc(100% - 80px)",
          }}
        >
          {/* Exhaust puffs */}
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: "absolute", left: "-4px", top: "14px",
              width: "7px", height: "7px", borderRadius: "50%",
              background: "rgba(100,90,80,0.35)",
              animation: `exhaustPuff 0.7s ease-out ${i * 0.22}s infinite`,
            }} />
          ))}
          {/* Speed lines */}
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: "absolute", left: "-16px", top: `${8 + i * 7}px`,
              width: `${14 - i * 3}px`, height: "1.5px",
              background: "#B8934A", borderRadius: "2px",
              animation: `speedLine 0.4s ease-out ${i * 0.13}s infinite`,
            }} />
          ))}
          {/* Bike SVG */}
          <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
            {/* Wheels */}
            <circle cx="10" cy="30" r="8" stroke="#B8934A" strokeWidth="1.8" fill="none" className="wheel-spin" style={{ transformOrigin: "10px 30px" }} />
            <circle cx="42" cy="30" r="8" stroke="#B8934A" strokeWidth="1.8" fill="none" className="wheel-spin" style={{ transformOrigin: "42px 30px" }} />
            {/* Spokes */}
            <circle cx="10" cy="30" r="2.5" fill="#B8934A" opacity="0.6" />
            <circle cx="42" cy="30" r="2.5" fill="#B8934A" opacity="0.6" />
            {/* Frame */}
            <path d="M10 30 L22 16 L36 16 L42 30" stroke="#B8934A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M22 16 L26 30" stroke="#B8934A" strokeWidth="1.4" strokeLinecap="round" />
            {/* Handlebar */}
            <path d="M36 16 L40 12 M40 12 L44 14" stroke="#B8934A" strokeWidth="1.4" strokeLinecap="round" />
            {/* Seat */}
            <path d="M22 16 L30 13" stroke="#B8934A" strokeWidth="1.4" strokeLinecap="round" />
            {/* Rider body */}
            <path d="M30 13 L34 6" stroke="#B8934A" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="34" cy="4" r="3.5" stroke="#B8934A" strokeWidth="1.4" fill="none" />
            {/* Helmet */}
            <path d="M31.5 3 Q34 0 36.5 3" stroke="#B8934A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            {/* Package on back — wobbles separately */}
            <rect x="14" y="12" width="10" height="8" rx="1" stroke="#B8934A" strokeWidth="1.2" fill="none" className="package-wobble" style={{ transformOrigin: "19px 16px" }} />
            <line x1="14" y1="16" x2="24" y2="16" stroke="#B8934A" strokeWidth="0.7" />
            <line x1="19" y1="12" x2="19" y2="20" stroke="#B8934A" strokeWidth="0.7" />
          </svg>
        </div>
      )}

      {/* ── Delivered: rider at house, celebration */}
      {delivered && (
        <div className="absolute bottom-10 right-14" style={{ animation: "deliveredPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>
          <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
            <circle cx="10" cy="30" r="8" stroke="#6B8F71" strokeWidth="1.8" fill="none" />
            <circle cx="42" cy="30" r="8" stroke="#6B8F71" strokeWidth="1.8" fill="none" />
            <circle cx="10" cy="30" r="2.5" fill="#6B8F71" opacity="0.6" />
            <circle cx="42" cy="30" r="2.5" fill="#6B8F71" opacity="0.6" />
            <path d="M10 30 L22 16 L36 16 L42 30" stroke="#6B8F71" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M22 16 L26 30" stroke="#6B8F71" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M36 16 L40 12 M40 12 L44 14" stroke="#6B8F71" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M22 16 L30 13" stroke="#6B8F71" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M30 13 L34 6" stroke="#6B8F71" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="34" cy="4" r="3.5" stroke="#6B8F71" strokeWidth="1.4" fill="none" />
            <path d="M31.5 3 Q34 0 36.5 3" stroke="#6B8F71" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId  = location.state?.orderId;

  const [elapsed,   setElapsed]   = useState(0);
  const [riderPct,  setRiderPct]  = useState(0);
  const [delivered, setDelivered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  const stageIndex = STAGES.reduce((acc, s, i) => (elapsed >= s.triggerAt ? i : acc), 0);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= 480 && next < TOTAL) {
          setRiderPct(((next - 480) / (TOTAL - 480)) * 100);
        }
        if (next >= TOTAL) {
          clearInterval(timerRef.current);
          setDelivered(true);
          setRiderPct(100);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2200);
          if (orderId) {
            API.put(`/orders/${orderId}/status`, { status: "delivered" }).catch(console.error);
          }
        }
        return Math.min(next, TOTAL);
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [orderId]);

  const remaining   = Math.max(0, TOTAL - elapsed);
  const mins        = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs        = String(remaining % 60).padStart(2, "0");
  const progressPct = (elapsed / TOTAL) * 100;

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-8 relative overflow-hidden">
      <Particles />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(184,147,74,0.07) 0%, transparent 70%)" }} />

      <div className="text-center max-w-lg relative z-10 w-full">

        {/* ── Animated checkmark ring */}
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

        <h1 className="success-title font-display text-5xl md:text-6xl font-light text-charcoal dark:text-dk-text leading-none mb-2">
          {delivered ? "Delivered!" : "Order Placed"}
        </h1>
        <p className="success-subtitle font-display italic text-xl text-muted dark:text-dk-muted font-light mb-8">
          {delivered ? "Enjoy your order!" : "Thank you for your purchase."}
        </p>

        {/* ── Delivery tracker card */}
        <div className="success-ref bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border mb-6 overflow-hidden relative">

          {showConfetti && <Confetti />}

          {/* Animated delivery scene */}
          <DeliveryScene stage={stageIndex} riderPct={riderPct} delivered={delivered} />

          <div className="p-6">
            {/* Stage dots */}
            <div className="flex justify-between mb-5">
              {STAGES.map((stage, i) => (
                <div key={stage.key} className={`flex flex-col items-center gap-2 flex-1 transition-all duration-700 ${i <= stageIndex ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] transition-all duration-500 ${
                    i < stageIndex  ? "bg-gold border-gold text-parchment" :
                    i === stageIndex ? "bg-parchment dark:bg-dk-surface border-gold text-gold" :
                    "bg-transparent border-beige dark:border-dk-border text-muted dark:text-dk-muted"
                  }`}>
                    {i < stageIndex ? (
                      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><polyline points="2,8 6,12 14,4" /></svg>
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>
                  <span className={`text-[8px] tracking-wide uppercase text-center leading-tight max-w-[54px] ${
                    i <= stageIndex ? "text-charcoal dark:text-dk-text font-medium" : "text-muted dark:text-dk-muted"
                  }`}>{stage.label}</span>
                  {i === stageIndex && !delivered && (
                    <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            {/* Overall progress bar */}
            <div className="relative h-0.5 bg-beige dark:bg-dk-border mb-5 overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gold transition-all duration-1000 ease-linear" style={{ width: `${progressPct}%` }} />
              {/* Shimmer on bar */}
              {!delivered && (
                <div className="absolute top-0 h-full w-16" style={{
                  left: `${Math.max(0, progressPct - 8)}%`,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  animation: "shimmer 1.8s ease-in-out infinite",
                }} />
              )}
            </div>

            {/* Delivered celebration text */}
            {delivered && (
              <p className="text-center font-display italic text-gold text-lg mb-4" style={{ animation: "deliveredPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
                Your order has arrived! 🎉
              </p>
            )}

            {/* Countdown */}
            {!delivered && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Estimated delivery</span>
                <span className="font-display text-2xl font-light text-gold tabular-nums">
                  {mins}<span className="text-muted dark:text-dk-muted text-lg mx-0.5">:</span>{secs}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Order reference */}
        {orderId && (
          <div className="success-ref inline-block bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border px-6 py-4 mb-8">
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">Order Reference</p>
            <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium tracking-widest">#{orderId.slice(-10).toUpperCase()}</p>
          </div>
        )}

        <p className="success-copy text-xs text-muted dark:text-dk-muted tracking-wide leading-relaxed mb-10">
          We've received your order and are preparing it with care.<br />
          You'll receive an update once it's on its way.
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