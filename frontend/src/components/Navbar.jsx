import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useTheme }    from "../context/ThemeContext";
import Logo            from "./Logo";

/* ── Icons ─────────────────────────────────────── */
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

/* ── Cart icon with badge ───────────────────────── */
function CartIcon({ count, animate }) {
  return (
    <span className="relative inline-flex items-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      {count > 0 && (
        <span className={`absolute -top-2.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-parchment text-[9px] font-semibold flex items-center justify-center leading-none ${animate ? "cart-pop" : ""}`}>
          {count}
        </span>
      )}
    </span>
  );
}

/* ── NavLink with active state ──────────────────── */
function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link text-[11px] tracking-widest uppercase font-medium transition-colors duration-200 ${
        isActive
          ? "text-gold after:w-full"
          : "text-charcoal dark:text-dk-text"
      }`}
    >
      {children}
    </Link>
  );
}

/* ── Main component ─────────────────────────────── */
function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart }         = useContext(CartContext);
  const { dark, toggle } = useTheme();
  const navigate         = useNavigate();

  const cartCount = cart?.items?.length || 0;
  const isAdmin   = user?.isAdmin || user?.role === "admin";

  const [animate,  setAnimate]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* scroll shadow */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* cart badge pop */
  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 350);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  /* close menu on resize to desktop */
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); setMenuOpen(false); };
  const closeMenu    = () => setMenuOpen(false);

  return (
    <nav className={`sticky top-0 z-50 bg-cream dark:bg-dk-surface border-b border-beige dark:border-dk-border px-8 transition-all duration-300 ${scrolled ? "shadow-sm dark:shadow-black/30" : ""}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center h-14">

        {/* Logo */}
        <Link to="/" onClick={closeMenu}><Logo size="md" /></Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">

          <NavLink to="/cart">
            <span className="flex items-center gap-2">
              <CartIcon count={cartCount} animate={animate} />
              <span>Cart</span>
            </span>
          </NavLink>

          <NavLink to="/orders">Orders</NavLink>

          {isAdmin && <NavLink to="/admin">Admin</NavLink>}

          {!user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          {user && (
            <>
              <span className="text-muted dark:text-dk-muted text-[10px] lowercase tracking-wide max-w-[140px] truncate">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost py-2 px-5 text-[10px]">
                Logout
              </button>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="theme-toggle text-muted dark:text-dk-muted hover:text-gold dark:hover:text-gold transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="md:hidden flex items-center gap-4">
          {/* Cart badge on mobile */}
          <Link to="/cart" onClick={closeMenu} className="relative text-charcoal dark:text-dk-text">
            <CartIcon count={cartCount} animate={animate} />
          </Link>

          <button onClick={toggle} className="theme-toggle text-muted dark:text-dk-muted hover:text-gold transition-colors">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Animated hamburger */}
          <button className="flex flex-col gap-1.5 p-1 group" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={`block w-5 h-px bg-charcoal dark:bg-dk-text transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-px bg-charcoal dark:bg-dk-text transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-px bg-charcoal dark:bg-dk-text transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu — smooth slide down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-beige dark:border-dk-border pt-4 pb-6 space-y-5 text-[11px] tracking-widest uppercase font-medium">

          <Link to="/orders" className="block text-charcoal dark:text-dk-text hover:text-gold transition-colors" onClick={closeMenu}>
            Orders
          </Link>

          {isAdmin && (
            <Link to="/admin" className="block text-charcoal dark:text-dk-text hover:text-gold transition-colors" onClick={closeMenu}>
              Admin
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login"    className="block text-charcoal dark:text-dk-text hover:text-gold transition-colors" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="block text-charcoal dark:text-dk-text hover:text-gold transition-colors" onClick={closeMenu}>Register</Link>
            </>
          )}

          {user && (
            <>
              <p className="text-muted dark:text-dk-muted lowercase tracking-wide normal-case">{user.email}</p>
              <button onClick={handleLogout} className="text-charcoal dark:text-dk-text hover:text-gold transition-colors uppercase tracking-widest text-[11px]">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;