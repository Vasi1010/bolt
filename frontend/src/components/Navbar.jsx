import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CartContext }  from "../context/CartContext";
import { AuthContext }  from "../context/AuthContext";
import { useTheme }     from "../context/ThemeContext";
import Logo from "./Logo";

/* ── Sun / Moon icons ── */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Navbar() {
  const { user, logout }  = useContext(AuthContext);
  const { cart }          = useContext(CartContext);
  const { dark, toggle }  = useTheme();
  const navigate          = useNavigate();

  const cartCount = cart?.items?.length || 0;
  const [animate,  setAnimate]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 350);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className={`sticky top-0 z-50 bg-cream dark:bg-dk-surface border-b border-beige dark:border-dk-border px-8 py-3 transition-all duration-300 ${scrolled ? "shadow-sm dark:shadow-black/30" : ""}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/"><Logo size="md" /></Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10 text-[11px] tracking-wide3 uppercase font-body font-medium">

          <Link to="/cart" className="nav-link text-charcoal dark:text-dk-text relative">
            Cart
            {cartCount > 0 && (
              <span className={`absolute -top-3 -right-4 text-[10px] text-gold font-semibold ${animate ? "cart-pop" : ""}`}>
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/orders" className="nav-link text-charcoal dark:text-dk-text">Orders</Link>

          {!user && (
            <>
              <Link to="/login"    className="nav-link text-charcoal dark:text-dk-text">Login</Link>
              <Link to="/register" className="nav-link text-charcoal dark:text-dk-text">Register</Link>
            </>
          )}

          {user && (
            <>
              <span className="text-muted dark:text-dk-muted text-[10px] lowercase tracking-wide">{user.email}</span>
              <button onClick={handleLogout} className="btn-ghost py-2 px-5 text-[10px]">Logout</button>
            </>
          )}

          {/* ── Theme Toggle ── */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="theme-toggle text-muted dark:text-dk-muted hover:text-gold dark:hover:text-gold transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Mobile: toggle + hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggle} className="theme-toggle text-muted dark:text-dk-muted">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`block w-5 h-px bg-charcoal dark:bg-dk-text transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-px bg-charcoal dark:bg-dk-text transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-charcoal dark:bg-dk-text transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-beige dark:border-dk-border pt-4 space-y-4 text-[11px] tracking-wide3 uppercase font-medium page-enter">
          <Link to="/cart" className="block text-charcoal dark:text-dk-text" onClick={() => setMenuOpen(false)}>
            Cart {cartCount > 0 && <span className="text-gold ml-1">{cartCount}</span>}
          </Link>
          <Link to="/orders" className="block text-charcoal dark:text-dk-text" onClick={() => setMenuOpen(false)}>Orders</Link>
          {!user && (
            <>
              <Link to="/login"    className="block text-charcoal dark:text-dk-text" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block text-charcoal dark:text-dk-text" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
          {user && (
            <>
              <p className="text-muted dark:text-dk-muted lowercase">{user.email}</p>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-charcoal dark:text-dk-text">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
