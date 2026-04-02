import { useEffect, useState, useMemo, useRef } from "react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

function Home() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory]   = useState("All");
  const [gridKey, setGridKey]             = useState(0);
  const searchRef = useRef(null);

  /* ── Fetch products ─────────────────────────── */
  useEffect(() => {
    if (!sessionStorage.getItem("boltWelcome")) {
      toast.success("Welcome to Bolt.");
      sessionStorage.setItem("boltWelcome", "shown");
    }
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* ── Debounce search input (300 ms) ─────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setGridKey((k) => k + 1); // remount grid → triggers fade-up animation
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── Bump gridKey when category changes too ─── */
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setGridKey((k) => k + 1);
  };

  /* ── Derived data ───────────────────────────── */
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return ["All", ...cats.sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !debouncedSearch.trim() ||
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, debouncedSearch, activeCategory]);

  return (
    <div>
      {/* Hero */}
      <section className="hero-fade border-b border-beige dark:border-dk-border py-24 px-8 text-center">
        <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase font-body mb-8">
          Premium Food &amp; Lifestyle
        </p>
        <h1 className="font-display font-light text-charcoal dark:text-dk-text leading-none">
          <span className="block text-[clamp(3rem,8vw,7rem)]">Curated</span>
          <em className="block italic text-[clamp(3rem,8vw,7rem)] text-gold">Flavours</em>
        </h1>
        <p className="font-display italic text-xl text-muted dark:text-dk-muted font-light mt-6 mb-10">
          Crafted with care. Delivered to your door.
        </p>
        <div className="flex items-center justify-center gap-5">
          <div className="h-px w-16 bg-gold opacity-60" />
          <a href="#collection" className="text-[10px] tracking-luxury text-gold uppercase font-body font-medium">Explore</a>
          <div className="h-px w-16 bg-gold opacity-60" />
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="px-8 py-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-8 mb-10">
          <h2 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">Our Collection</h2>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          {!loading && (
            <span
              key={filtered.length}
              className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase whitespace-nowrap"
              style={{ animation: "fadeIn 0.3s ease forwards" }}
            >
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Search + Category filters */}
        {!loading && products.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Search input */}
            <div className="relative flex-1 max-w-sm group">
              <svg
                onClick={() => searchRef.current?.focus()}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted dark:text-dk-muted cursor-pointer hover:text-gold transition-colors duration-200"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.804 7.5 7.5 0 0015.803 15.803z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="luxury-input pl-9 text-sm w-full focus:border-b-gold"
              />
              {/* Animated gold underline on focus */}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gold transition-all duration-300 group-focus-within:w-full" />
              {search && (
                <button
                  onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text transition-colors text-lg leading-none">
                  ×
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 text-[10px] tracking-luxury uppercase border transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-charcoal dark:bg-dk-text border-charcoal dark:border-dk-text text-parchment dark:text-dk-bg"
                      : "bg-transparent border-beige dark:border-dk-border text-muted dark:text-dk-muted hover:border-charcoal dark:hover:border-dk-text hover:text-charcoal dark:hover:text-dk-text"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] skeleton rounded-none mb-4" />
                <div className="h-3 skeleton rounded-none w-3/4 mb-2" />
                <div className="h-3 skeleton rounded-none w-1/3 mb-4" />
                <div className="h-10 skeleton rounded-none w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="py-28 text-center" style={{ animation: "fadeUp 0.4s ease forwards" }}>
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-px w-16 bg-beige dark:bg-dk-border" />
              <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">
                {products.length === 0 ? "No Items" : "No Results"}
              </span>
              <div className="h-px w-16 bg-beige dark:bg-dk-border" />
            </div>
            <p className="font-display text-2xl font-light text-muted dark:text-dk-muted italic">
              {products.length === 0
                ? "No products available at this time."
                : `No products match "${debouncedSearch || activeCategory}"`}
            </p>
            {(search || activeCategory !== "All") && (
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); setGridKey((k) => k + 1); }}
                className="mt-8 text-[10px] tracking-luxury text-gold uppercase hover:text-gold-light transition-colors">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Product grid — key prop forces remount → fade-up re-runs */}
        {!loading && filtered.length > 0 && (
          <div
            key={gridKey}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {filtered.map((product, index) => (
              <div
                key={product._id}
                className="product-fade"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-beige dark:border-dk-border py-10 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display text-xl tracking-luxury text-charcoal dark:text-dk-text font-light uppercase">Bolt</span>
          <p className="text-[10px] tracking-wide text-muted dark:text-dk-muted uppercase">
            © {new Date().getFullYear()} Bolt Store. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gold opacity-60" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold opacity-60" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;