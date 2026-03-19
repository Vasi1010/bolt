/**
 * Bolt — SVG Logo Component
 * Mark: a refined, geometric lightning bolt in thin stroke
 * Wordmark: "BOLT" in tracked uppercase beside it
 */
function Logo({ size = "md", className = "" }) {
  const sizes = {
    sm: { mark: 18, text: "text-sm",   gap: "gap-2" },
    md: { mark: 24, text: "text-lg",   gap: "gap-2.5" },
    lg: { mark: 32, text: "text-2xl",  gap: "gap-3" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`logo-wrap flex items-center ${s.gap} ${className}`}>
      {/* ── Lightning Bolt Mark ── */}
      <svg
        width={s.mark}
        height={Math.round(s.mark * 1.35)}
        viewBox="0 0 20 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer decorative diamond frame */}
        <rect
          x="1"
          y="1"
          width="18"
          height="25"
          rx="0"
          stroke="#B8934A"
          strokeWidth="0.75"
          opacity="0.4"
        />

        {/* Lightning bolt path — thin, elegant, geometric */}
        <path
          className="logo-bolt-path"
          d="M13.5 2.5 L6 13 L10.5 13 L6.5 24.5 L14 14 L9.5 14 Z"
          fill="#B8934A"
          stroke="none"
          opacity="0.95"
        />
      </svg>

      {/* ── Wordmark ── */}
      <span
        className={`font-display font-light tracking-luxury text-charcoal uppercase leading-none ${s.text}`}
        style={{ letterSpacing: "0.28em" }}
      >
        Bolt
      </span>
    </div>
  );
}

export default Logo;
