import { useEffect, useState } from "react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem("boltWelcome")) {
      toast.success("Welcome to Bolt.");
      sessionStorage.setItem("boltWelcome", "shown");
    }
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
          <a href="#collection" className="text-[10px] tracking-luxury text-gold uppercase font-body font-medium">
            Explore
          </a>
          <div className="h-px w-16 bg-gold opacity-60" />
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="px-8 py-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-8 mb-14">
          <h2 className="font-display text-3xl font-light text-charcoal dark:text-dk-text whitespace-nowrap">
            Our Collection
          </h2>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          {!loading && (
            <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase whitespace-nowrap">
              {products.length} items
            </span>
          )}
        </div>

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

        {!loading && products.length === 0 && (
          <div className="py-28 text-center">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-px w-16 bg-beige dark:bg-dk-border" />
              <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">No Items</span>
              <div className="h-px w-16 bg-beige dark:bg-dk-border" />
            </div>
            <p className="font-display text-2xl font-light text-muted dark:text-dk-muted italic">
              No products available at this time.
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={product._id} className="product-fade" style={{ animationDelay: `${index * 0.07}s` }}>
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
