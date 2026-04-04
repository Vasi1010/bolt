import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import API from "../api/axios";

/* ─── Leaflet default icon fix ───────────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const STAGES = [
  { key: "placed",    label: "Order Placed",  icon: "✓",  triggerAt: 0   },
  { key: "packing",   label: "Packing Order", icon: "📦", triggerAt: 120 },
  { key: "shipped",   label: "On The Way",    icon: "🛵", triggerAt: 480 },
  { key: "delivered", label: "Delivered!",    icon: "🏠", triggerAt: 900 },
];
const TOTAL = 900;

// Hardcoded warehouse — no geocoding needed for a fixed location.
// To get exact coords: open Google Maps → right-click your store → "What's here?"
const WAREHOUSE_COORDS = [19.887541, 75.344254]; // [lat, lng] — Roshan Gate, Aurangabad

/* ─── Geocode customer address (Nominatim, 3-level fallback) ─────────────────── */
// Nominatim often can't resolve hyper-local Indian addresses like "plot no.4, lane X".
// Each attempt is less specific than the last — the city-only fallback always resolves.
async function geocodeCustomerAddress({ street, city, state }) {
  const attempts = [
    `${street}, ${city}, ${state}, India`,   // full address — best accuracy
    `${city}, ${state}, India`,               // city + state
    `${city}, India`,                         // city only — always resolves
  ];

  for (const query of attempts) {
    console.log("[Geocode] Trying:", query);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      console.log("[Geocode] Result:", data);
      if (data?.length) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.warn("[Geocode] Failed for:", query, err);
    }
  }
  throw new Error("Could not locate delivery address");
}

/* ─── Get driving route via our own backend proxy ────────────────────────────── */
// The browser calls our Express server at GET /api/map/route,
// which calls ORS server-side using the ORS_KEY from the backend .env.
// This means:
//   1. No CORS — browser never touches ORS directly
//   2. No exposed API key — the key never leaves the server
async function getDrivingRoute(from, to) {
  // from/to are [lat, lng] — ORS wants lng,lat so we swap
  const start = `${from[1]},${from[0]}`;
  const end   = `${to[1]},${to[0]}`;
  console.log("[Route] Calling proxy — start:", start, "end:", end);

  const { data } = await API.get(`/map/route?start=${start}&end=${end}`);
  console.log("[Route] Response:", data);

  // ORS returns GeoJSON coordinates as [lng, lat] — flip to Leaflet's [lat, lng]
  return data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

/* ─── Custom map icons ───────────────────────────────────────────────────────── */
const warehouseIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:#B8934A;border:3px solid #FEFCF8;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;box-shadow:0 2px 8px rgba(184,147,74,0.5);
  ">📦</div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
});

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:#6B8F71;border:3px solid #FEFCF8;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;box-shadow:0 2px 8px rgba(107,143,113,0.5);
  ">🏠</div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
});

const scooterIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:38px;height:38px;border-radius:50%;
    background:#FEFCF8;border:2.5px solid #B8934A;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 2px 10px rgba(184,147,74,0.6);
  ">🛵</div>`,
  iconSize:   [38, 38],
  iconAnchor: [19, 19],
});

/* ─── Fit map to show the full route ─────────────────────────────────────────── */
function MapFitter({ route }) {
  const map = useMap();
  useEffect(() => {
    if (route?.length) {
      map.fitBounds(L.latLngBounds(route), { padding: [48, 48] });
    }
  }, [route, map]);
  return null;
}

/* ─── Real map scene ─────────────────────────────────────────────────────────── */
function MapScene({ stage, riderPct, delivered, showConfetti, deliveryAddress }) {
  const [destCoords, setDestCoords] = useState(null);
  const [route,      setRoute]      = useState(null);
  const [mapStatus,  setMapStatus]  = useState("loading"); // loading | ready | error

  /* ── Geocode customer address then fetch route on mount ── */
  useEffect(() => {
    if (!deliveryAddress) return;

    (async () => {
      try {
        setMapStatus("loading");
        const dest = await geocodeCustomerAddress(deliveryAddress);
        setDestCoords(dest);
        const routeCoords = await getDrivingRoute(WAREHOUSE_COORDS, dest);
        setRoute(routeCoords);
        setMapStatus("ready");
      } catch (err) {
        console.error("[Map] Error:", err);
        setMapStatus("error");
      }
    })();
  }, [deliveryAddress]);

  /* ── Rider position interpolated along the route ── */
  const riderPosition = (() => {
    if (!route?.length || stage < 2) return WAREHOUSE_COORDS;
    const idx = Math.min(
      Math.floor((riderPct / 100) * (route.length - 1)),
      route.length - 1
    );
    return route[idx];
  })();

  /* ── Loading state ── */
  if (mapStatus === "loading") {
    return (
      <div style={{ height: "240px" }} className="bg-beige dark:bg-dk-elevated flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-1.5 justify-center mb-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">
            Mapping your route
          </p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (mapStatus === "error") {
    return (
      <div style={{ height: "240px" }} className="bg-beige dark:bg-dk-elevated flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">
            Route unavailable
          </p>
          <p className="text-[9px] text-muted/50 dark:text-dk-muted/50">
            Check console (F12) for details
          </p>
        </div>
      </div>
    );
  }

  /* ── Live map ── */
  return (
    <div style={{ height: "240px", position: "relative" }} className="overflow-hidden">
      {showConfetti && <Confetti />}

      <MapContainer
        center={WAREHOUSE_COORDS}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        {/* Warm parchment-toned tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        {/* Auto-fit bounds to show the whole route */}
        {route && <MapFitter route={route} />}

        {/* Full route — grey (untravel portion) */}
        {route && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#C8B99A", weight: 5, opacity: 0.6 }}
          />
        )}

        {/* Traveled portion — gold, grows as rider progresses */}
        {route && stage >= 2 && (
          <Polyline
            positions={route.slice(0, Math.max(1, Math.floor((riderPct / 100) * route.length)))}
            pathOptions={{ color: "#B8934A", weight: 5, opacity: 1 }}
          />
        )}

        {/* Warehouse pin */}
        <Marker position={WAREHOUSE_COORDS} icon={warehouseIcon} />

        {/* Customer home pin */}
        {destCoords && (
          <Marker position={destCoords} icon={homeIcon} />
        )}

        {/* Rider — moves during transit */}
        {stage >= 2 && !delivered && riderPosition && (
          <Marker position={riderPosition} icon={scooterIcon} />
        )}

        {/* Rider snaps to destination on delivery */}
        {delivered && destCoords && (
          <Marker position={destCoords} icon={scooterIcon} />
        )}
      </MapContainer>

      {/* Map legend overlay */}
      <div className="absolute bottom-2 left-2 z-[1000] flex gap-3">
        <div className="bg-white/90 dark:bg-dk-surface/90 px-2 py-1 flex items-center gap-1.5 rounded-sm">
          <span className="text-[10px]">📦</span>
          <span className="text-[9px] tracking-wide text-charcoal dark:text-dk-text uppercase font-medium">Store</span>
        </div>
        <div className="bg-white/90 dark:bg-dk-surface/90 px-2 py-1 flex items-center gap-1.5 rounded-sm">
          <span className="text-[10px]">🏠</span>
          <span className="text-[9px] tracking-wide text-charcoal dark:text-dk-text uppercase font-medium">Your Home</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Gold ambient particles ─────────────────────────────────────────────────── */
function Particles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id:      i,
        left:    `${10 + Math.random() * 80}%`,
        top:     `${20 + Math.random() * 60}%`,
        delay:   `${0.5 + Math.random() * 1.5}s`,
        size:    `${3 + Math.random() * 5}px`,
        opacity: 0.25 + Math.random() * 0.5,
      }))
    );
  }, []);

  return (
    <>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left:           p.left,
            top:            p.top,
            width:          p.size,
            height:         p.size,
            animationDelay: p.delay,
            opacity:        p.opacity,
          }}
        />
      ))}
    </>
  );
}

/* ─── Confetti burst on delivery ─────────────────────────────────────────────── */
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => {
    const angle  = (i / 32) * 360;
    const dist   = 60 + Math.random() * 100;
    const cx     = `${Math.cos((angle * Math.PI) / 180) * dist}px`;
    const cy     = `${Math.sin((angle * Math.PI) / 180) * dist - 40}px`;
    const cr     = `${-180 + Math.random() * 360}deg`;
    const colors = ["#B8934A", "#D4A85A", "#6B8F71", "#FEFCF8", "#E2DAD0", "#F0C060"];
    const shape  = i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%";
    return { i, cx, cy, cr, color: colors[i % colors.length], shape };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1001]">
      {pieces.map(({ i, cx, cy, cr, color, shape }) => (
        <div
          key={i}
          style={{
            position:        "absolute",
            width:           i % 2 === 0 ? "8px" : "5px",
            height:          i % 2 === 0 ? "8px" : "12px",
            backgroundColor: color,
            borderRadius:    shape,
            "--cx":          cx,
            "--cy":          cy,
            "--cr":          cr,
            animation:       `confettiBurst 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 0.03}s both`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
function OrderSuccess() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const orderId    = location.state?.orderId;
  const storageKey = orderId ? `bolt_order_start_${orderId}` : null;

  const [order,        setOrder]        = useState(null);
  const [delivered,    setDelivered]    = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  /* ── Restore elapsed time from localStorage so a reload doesn't reset the timer ── */
  const getElapsed = () => {
    if (!storageKey) return 0;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return 0;
    return Math.min(Math.floor((Date.now() - parseInt(saved, 10)) / 1000), TOTAL);
  };

  const [elapsed,  setElapsed]  = useState(() => getElapsed());
  const [riderPct, setRiderPct] = useState(() => {
    const e = getElapsed();
    return e >= 480 ? ((e - 480) / (TOTAL - 480)) * 100 : 0;
  });

  const stageIndex  = STAGES.reduce((acc, s, i) => (elapsed >= s.triggerAt ? i : acc), 0);
  const progressPct = (elapsed / TOTAL) * 100;
  const remaining   = Math.max(0, TOTAL - elapsed);
  const mins        = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs        = String(remaining % 60).padStart(2, "0");

  /* ── Fetch order — GET /orders/:id exists in your routes ── */
  useEffect(() => {
    if (orderId) {
      API.get(`/orders/${orderId}`)
        .then(({ data }) => setOrder(data))
        .catch(err => console.error("[OrderSuccess] Order fetch failed:", err));
    }
  }, [orderId]);

  /* ── Countdown timer ── */
  useEffect(() => {
    // Stamp the start time once, on first load
    if (storageKey && !localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, String(Date.now() - elapsed * 1000));
    }
    if (elapsed >= TOTAL) {
      setDelivered(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;

        // Start moving the rider once the "shipped" stage begins
        if (next >= 480 && next < TOTAL) {
          setRiderPct(((next - 480) / (TOTAL - 480)) * 100);
        }

        if (next >= TOTAL) {
          clearInterval(timerRef.current);
          setDelivered(true);
          setRiderPct(100);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2500);
          if (storageKey) localStorage.removeItem(storageKey);
          if (orderId) {
            API.put(`/orders/${orderId}/status`, { status: "delivered" }).catch(console.error);
          }
        }

        return Math.min(next, TOTAL);
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [orderId]);

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-[88vh] flex items-center justify-center px-8 relative overflow-hidden">
      <Particles />

      {/* Subtle gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(184,147,74,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="text-center max-w-lg relative z-10 w-full">

        {/* ── Animated checkmark ring ── */}
        <div className="success-icon-wrap flex justify-center mb-10">
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
            <circle
              className="success-circle"
              cx="50" cy="50" r="47"
              stroke="#B8934A" strokeWidth="1" strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="40" stroke="#B8934A" strokeWidth="0.4" opacity="0.3" />
            <polyline
              className="success-check"
              points="30,52 44,66 70,36"
              stroke="#B8934A" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" fill="none"
            />
          </svg>
        </div>

        {/* ── "Confirmed" label with flanking lines ── */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="success-line h-px bg-gold" style={{ width: "40px", animationDelay: "1.3s" }} />
          <span
            className="text-[10px] tracking-luxury text-gold uppercase"
            style={{ opacity: 0, animation: "fadeIn 0.5s ease 1.4s forwards" }}
          >
            Confirmed
          </span>
          <div className="success-line h-px bg-gold" style={{ width: "40px", animationDelay: "1.3s" }} />
        </div>

        {/* ── Headline ── */}
        <h1 className="success-title font-display text-5xl md:text-6xl font-light text-charcoal dark:text-dk-text leading-none mb-2">
          {delivered ? "Delivered!" : "Order Placed"}
        </h1>
        <p className="success-subtitle font-display italic text-xl text-muted dark:text-dk-muted font-light mb-8">
          {delivered ? "Enjoy your order!" : "Thank you for your purchase."}
        </p>

        {/* ── Tracker card ── */}
        <div className="success-ref bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border mb-6 overflow-hidden relative">

          {/* Real Leaflet map */}
          <MapScene
            stage={stageIndex}
            riderPct={riderPct}
            delivered={delivered}
            showConfetti={showConfetti}
            deliveryAddress={order?.deliveryAddress}
          />

          <div className="p-6">

            {/* Stage dots */}
            <div className="flex justify-between mb-5">
              {STAGES.map((stage, i) => (
                <div
                  key={stage.key}
                  className={`flex flex-col items-center gap-2 flex-1 transition-all duration-700 ${
                    i <= stageIndex ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] transition-all duration-500 ${
                      i < stageIndex
                        ? "bg-gold border-gold text-parchment"
                        : i === stageIndex
                        ? "bg-parchment dark:bg-dk-surface border-gold text-gold"
                        : "bg-transparent border-beige dark:border-dk-border text-muted dark:text-dk-muted"
                    }`}
                  >
                    {i < stageIndex ? (
                      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="2,8 6,12 14,4" />
                      </svg>
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-[8px] tracking-wide uppercase text-center leading-tight max-w-[54px] ${
                      i <= stageIndex
                        ? "text-charcoal dark:text-dk-text font-medium"
                        : "text-muted dark:text-dk-muted"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {i === stageIndex && !delivered && (
                    <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar with shimmer */}
            <div className="relative h-0.5 bg-beige dark:bg-dk-border mb-5 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gold transition-all duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
              {!delivered && (
                <div
                  className="absolute top-0 h-full w-16"
                  style={{
                    left:       `${Math.max(0, progressPct - 8)}%`,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                    animation:  "shimmer 1.8s ease-in-out infinite",
                  }}
                />
              )}
            </div>

            {/* Delivered message */}
            {delivered && (
              <p
                className="text-center font-display italic text-gold text-lg mb-4"
                style={{ animation: "deliveredPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
              >
                Your order has arrived! 🎉
              </p>
            )}

            {/* Countdown timer */}
            {!delivered && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">
                  Estimated delivery
                </span>
                <span className="font-display text-2xl font-light text-gold tabular-nums">
                  {mins}
                  <span className="text-muted dark:text-dk-muted text-lg mx-0.5">:</span>
                  {secs}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Order reference pill ── */}
        {orderId && (
          <div className="success-ref inline-block bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border px-6 py-4 mb-8">
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">
              Order Reference
            </p>
            <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium tracking-widest">
              #{orderId.slice(-10).toUpperCase()}
            </p>
          </div>
        )}

        {/* ── Supporting copy ── */}
        <p className="success-copy text-xs text-muted dark:text-dk-muted tracking-wide leading-relaxed mb-10">
          We've received your order and are preparing it with care.<br />
          You'll receive an update once it's on its way.
        </p>

        {/* ── CTA buttons ── */}
        <div className="success-cta flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate("/orders")} className="btn-ghost">View Orders</button>
          <button onClick={() => navigate("/")}       className="btn-dark">Continue Shopping</button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;