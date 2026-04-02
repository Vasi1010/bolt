import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../api/axios";

const STAGES = [
  { key: "placed",    label: "Order Placed",   icon: "✓",  triggerAt: 0   },
  { key: "packing",   label: "Packing Order",  icon: "📦", triggerAt: 120 },
  { key: "shipped",   label: "On The Way",     icon: "🏍️", triggerAt: 480 },
  { key: "delivered", label: "Delivered!",     icon: "🏠", triggerAt: 900 },
];
const TOTAL = 900;

// ── Gold floating particles ───────────────────────────────────────────────────
function Particles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    setParticles(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top:  `${20 + Math.random() * 60}%`,
      delay: `${0.5 + Math.random() * 1.5}s`,
      size:  `${3 + Math.random() * 5}px`,
      opacity: 0.25 + Math.random() * 0.5,
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

// ── Confetti burst ────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => {
    const angle  = (i / 32) * 360;
    const dist   = 60 + Math.random() * 100;
    const cx     = `${Math.cos((angle * Math.PI) / 180) * dist}px`;
    const cy     = `${Math.sin((angle * Math.PI) / 180) * dist - 40}px`;
    const cr     = `${-180 + Math.random() * 360}deg`;
    const colors = ["#B8934A","#D4A85A","#6B8F71","#FEFCF8","#E2DAD0","#F0C060"];
    return { i, cx, cy, cr, color: colors[i % colors.length], shape: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%" };
  });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {pieces.map(({ i, cx, cy, cr, color, shape }) => (
        <div key={i} style={{
          position: "absolute", width: i % 2 === 0 ? "8px" : "5px", height: i % 2 === 0 ? "8px" : "12px",
          backgroundColor: color, borderRadius: shape,
          "--cx": cx, "--cy": cy, "--cr": cr,
          animation: `confettiBurst 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s both`,
        }} />
      ))}
    </div>
  );
}

// ── Store Pin SVG ─────────────────────────────────────────────────────────────
function StorePin({ active }) {
  return (
    <g>
      <circle cx="0" cy="0" r="16" fill={active ? "#B8934A" : "#C8B99A"} opacity="0.18" />
      <circle cx="0" cy="0" r="11" fill={active ? "#B8934A" : "#A09080"} />
      {/* Box icon */}
      <rect x="-5" y="-5" width="10" height="9" rx="1" fill="none" stroke="white" strokeWidth="1.3" />
      <line x1="-5" y1="-1.5" x2="5" y2="-1.5" stroke="white" strokeWidth="1" />
      <line x1="0" y1="-5" x2="0" y2="-1.5" stroke="white" strokeWidth="1" />
    </g>
  );
}

// ── House Pin SVG ─────────────────────────────────────────────────────────────
function HousePin({ delivered }) {
  const fill = delivered ? "#6B8F71" : "#A09080";
  return (
    <g>
      <circle cx="0" cy="0" r="16" fill={fill} opacity="0.18" />
      <circle cx="0" cy="0" r="11" fill={fill} />
      {/* House icon */}
      <polygon points="0,-6 -6,0 6,0" fill="white" opacity="0.9" />
      <rect x="-4.5" y="0" width="9" height="6" rx="0.5" fill="white" opacity="0.9" />
      <rect x="-1.5" y="2" width="3" height="4" fill={fill} />
    </g>
  );
}

// ── Scooter Icon ──────────────────────────────────────────────────────────────
function ScooterIcon({ angle }) {
  return (
    <g transform={`rotate(${angle})`}>
      {/* Body */}
      <ellipse cx="0" cy="0" rx="7" ry="4" fill="#B8934A" />
      {/* Front wheel */}
      <circle cx="5" cy="2" r="2.5" fill="none" stroke="#7A6030" strokeWidth="1.2" />
      {/* Rear wheel */}
      <circle cx="-5" cy="2" r="2.5" fill="none" stroke="#7A6030" strokeWidth="1.2" />
      {/* Handlebar */}
      <line x1="5" y1="-1" x2="7" y2="-3" stroke="#7A6030" strokeWidth="1.2" strokeLinecap="round" />
      {/* Rider head */}
      <circle cx="3" cy="-4" r="2.5" fill="#D4A85A" />
      {/* Package */}
      <rect x="-6" y="-5" width="6" height="5" rx="0.5" fill="#D4A85A" stroke="#B8934A" strokeWidth="0.8" />
    </g>
  );
}

// ── Map Scene ─────────────────────────────────────────────────────────────────
// The route path (follows the road grid):
const ROUTE = "M 44 130 L 44 70 L 120 70 L 120 115 L 200 115 L 200 55 L 280 55 L 280 100 L 356 100";

function MapScene({ stage, riderPct, delivered, showConfetti }) {
  const pathRef  = useRef(null);
  const [riderPos, setRiderPos] = useState({ x: 44, y: 130, angle: 0 });

  // Move rider along path
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const totalLen = el.getTotalLength();
    const pct = stage >= 2 ? riderPct / 100 : 0;
    const dist = pct * totalLen;
    const pt   = el.getPointAtLength(dist);
    const pt2  = el.getPointAtLength(Math.min(dist + 4, totalLen));
    const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
    setRiderPos({ x: pt.x, y: pt.y, angle });
  }, [riderPct, stage]);

  // Gold progress = how much of the route is filled
  const traveledPct = stage >= 2 ? riderPct : 0;

  return (
    <div style={{ position: "relative", height: "200px", background: "#EDE8DC", overflow: "hidden" }}>
      {showConfetti && <Confetti />}

      <svg width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">

        {/* ── Map grid background ── */}
        {/* Horizontal roads */}
        <rect x="0" y="64"  width="400" height="12" fill="#D8CFC0" rx="0" />
        <rect x="0" y="109" width="400" height="12" fill="#D8CFC0" />
        {/* Vertical roads */}
        <rect x="38"  y="0" width="12" height="200" fill="#D8CFC0" />
        <rect x="114" y="0" width="12" height="200" fill="#D8CFC0" />
        <rect x="194" y="0" width="12" height="200" fill="#D8CFC0" />
        <rect x="274" y="0" width="12" height="200" fill="#D8CFC0" />
        <rect x="350" y="0" width="12" height="200" fill="#D8CFC0" />

        {/* Road centre-line dashes */}
        {[70, 115, 200].map((y) =>
          Array.from({ length: 20 }, (_, i) => (
            <rect key={`h-${y}-${i}`} x={i * 22} y={y + 5} width="12" height="2" fill="#C4B89A" opacity="0.6" rx="1" />
          ))
        )}
        {[44, 120, 200, 280, 356].map((x) =>
          Array.from({ length: 10 }, (_, i) => (
            <rect key={`v-${x}-${i}`} x={x + 5} y={i * 22} width="2" height="12" fill="#C4B89A" opacity="0.6" rx="1" />
          ))
        )}

        {/* ── Hidden path for measurement ── */}
        <path ref={pathRef} d={ROUTE} fill="none" stroke="none" />

        {/* ── Route shadow ── */}
        <path d={ROUTE} stroke="#B8A888" strokeWidth="7" fill="none"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

        {/* ── Route untraveled (grey) ── */}
        <path d={ROUTE} stroke="#C8B99A" strokeWidth="5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* ── Route traveled (animated gold) ── */}
        <path
          d={ROUTE}
          stroke="#B8934A"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - traveledPct}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />

        {/* ── Dotted outline on route for style ── */}
        <path
          d={ROUTE}
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 8"
          opacity="0.5"
          pathLength="100"
          strokeDashoffset={100 - traveledPct}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />

        {/* ── Store label ── */}
        <text x="44" y="158" textAnchor="middle" fontSize="7" fill="#8B7355" fontFamily="Jost, sans-serif"
          letterSpacing="0.05em" fontWeight="500">STORE</text>

        {/* ── Destination label ── */}
        <text x="356" y="128" textAnchor="middle" fontSize="7" fill={delivered ? "#6B8F71" : "#8B7355"}
          fontFamily="Jost, sans-serif" letterSpacing="0.05em" fontWeight="500">YOUR HOME</text>

        {/* ── Store pin ── */}
        <g transform="translate(44, 130)">
          {stage >= 1 && (
            <circle cx="0" cy="0" r="18" fill="#B8934A" opacity="0.12">
              <animate attributeName="r" values="13;20;13" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <StorePin active={stage >= 1} />
        </g>

        {/* ── House pin ── */}
        <g transform="translate(356, 100)">
          {delivered && (
            <circle cx="0" cy="0" r="18" fill="#6B8F71" opacity="0.2">
              <animate attributeName="r" values="13;22;13" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.25;0;0.25" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
          <HousePin delivered={delivered} />
        </g>

        {/* ── Rider moving along path ── */}
        {stage >= 2 && !delivered && (
          <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
            {/* Pulsing gold ring */}
            <circle cx="0" cy="0" r="14" fill="#B8934A" opacity="0.0">
              <animate attributeName="r" values="10;20;10" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="1.2s" repeatCount="indefinite" />
            </circle>
            {/* White backing circle */}
            <circle cx="0" cy="0" r="11" fill="white" />
            {/* Gold border */}
            <circle cx="0" cy="0" r="11" fill="none" stroke="#B8934A" strokeWidth="2" />
            {/* Scooter icon rotated to match path direction */}
            <ScooterIcon angle={riderPos.angle} />
          </g>
        )}

        {/* ── Delivered: green pin at house, rider parked ── */}
        {delivered && (
          <g transform="translate(338, 100)" style={{ animation: "deliveredPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
            <circle cx="0" cy="0" r="11" fill="white" />
            <circle cx="0" cy="0" r="11" fill="none" stroke="#6B8F71" strokeWidth="2" />
            <ScooterIcon angle={0} />
          </g>
        )}

        {/* ── Waypoint dots along route ── */}
        {[
          { x: 44,  y: 70  },
          { x: 120, y: 70  },
          { x: 120, y: 115 },
          { x: 200, y: 115 },
          { x: 200, y: 55  },
          { x: 280, y: 55  },
          { x: 280, y: 100 },
        ].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3"
            fill={traveledPct > (i + 1) * 14 ? "#B8934A" : "#C8B99A"}
            style={{ transition: "fill 0.5s ease" }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function OrderSuccess() {
  const location = useLocation();
  const navigate  = useNavigate();
  const orderId   = location.state?.orderId;

  const [elapsed,      setElapsed]      = useState(0);
  const [riderPct,     setRiderPct]     = useState(0);
  const [delivered,    setDelivered]    = useState(false);
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
          setTimeout(() => setShowConfetti(false), 2500);
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
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(184,147,74,0.06) 0%, transparent 70%)" }} />

      <div className="text-center max-w-lg relative z-10 w-full">

        {/* ── Animated checkmark ring ── */}
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

        {/* ── Tracker card ── */}
        <div className="success-ref bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border mb-6 overflow-hidden relative">

          {/* Map delivery scene */}
          <MapScene stage={stageIndex} riderPct={riderPct} delivered={delivered} showConfetti={showConfetti} />

          <div className="p-6">

            {/* Stage dots */}
            <div className="flex justify-between mb-5">
              {STAGES.map((stage, i) => (
                <div key={stage.key} className={`flex flex-col items-center gap-2 flex-1 transition-all duration-700 ${i <= stageIndex ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] transition-all duration-500 ${
                    i < stageIndex   ? "bg-gold border-gold text-parchment" :
                    i === stageIndex ? "bg-parchment dark:bg-dk-surface border-gold text-gold" :
                    "bg-transparent border-beige dark:border-dk-border text-muted dark:text-dk-muted"
                  }`}>
                    {i < stageIndex ? (
                      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="2,8 6,12 14,4" />
                      </svg>
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

            {/* Progress bar */}
            <div className="relative h-0.5 bg-beige dark:bg-dk-border mb-5 overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gold transition-all duration-1000 ease-linear" style={{ width: `${progressPct}%` }} />
              {!delivered && (
                <div className="absolute top-0 h-full w-16" style={{
                  left: `${Math.max(0, progressPct - 8)}%`,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  animation: "shimmer 1.8s ease-in-out infinite",
                }} />
              )}
            </div>

            {/* Delivered celebration */}
            {delivered && (
              <p className="text-center font-display italic text-gold text-lg mb-4"
                style={{ animation: "deliveredPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
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

        {/* ── Order reference ── */}
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