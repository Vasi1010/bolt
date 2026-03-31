import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { fetchCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (val) => {
    const max = product?.stock ?? 99;
    const clamped = Math.max(1, Math.min(Number(val), max));
    setQuantity(clamped);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await API.post("/cart/add", { productId: product._id, quantity });
      fetchCart();
      setAdded(true);
      toast.success(`${quantity} × ${product.name} added to cart`);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
        <div className="aspect-[3/4] skeleton rounded-none" />
        <div className="space-y-6 pt-4">
          <div className="h-3 skeleton rounded-none w-24" />
          <div className="h-10 skeleton rounded-none w-3/4" />
          <div className="h-6 skeleton rounded-none w-24" />
          <div className="h-px skeleton rounded-none" />
          <div className="h-3 skeleton rounded-none w-full" />
          <div className="h-3 skeleton rounded-none w-5/6" />
          <div className="h-3 skeleton rounded-none w-4/6" />
          <div className="h-12 skeleton rounded-none w-full mt-8" />
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center hero-fade">
      <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-6">Not Found</p>
      <h2 className="font-display text-4xl font-light text-charcoal dark:text-dk-text italic mb-4">
        Product not found
      </h2>
      <p className="text-muted dark:text-dk-muted text-sm tracking-wide mb-10">
        This product may have been removed or the link is invalid.
      </p>
      <Link to="/" className="btn-dark">Back to Collection</Link>
    </div>
  );

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen py-16 px-8 hero-fade">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-12 text-[10px] tracking-luxury uppercase text-muted dark:text-dk-muted">
          <Link to="/" className="hover:text-gold transition-colors">Collection</Link>
          <span className="opacity-40">·</span>
          {product.category && (
            <>
              <span className="opacity-70">{product.category}</span>
              <span className="opacity-40">·</span>
            </>
          )}
          <span className="text-charcoal dark:text-dk-text">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Image */}
          <div className="relative">
            <div className="aspect-[3/4] bg-parchment dark:bg-dk-elevated border border-beige dark:border-dk-border overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-px bg-beige dark:bg-dk-border" />
                  <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">No Image</span>
                  <div className="w-16 h-px bg-beige dark:bg-dk-border" />
                </div>
              )}
            </div>

            {/* Stock badge overlay */}
            {!inStock && (
              <div className="absolute top-4 left-4 bg-charcoal dark:bg-dk-elevated text-parchment dark:text-dk-text text-[9px] tracking-luxury uppercase px-3 py-1.5">
                Out of Stock
              </div>
            )}
            {lowStock && inStock && (
              <div className="absolute top-4 left-4 bg-amber-600 text-white text-[9px] tracking-luxury uppercase px-3 py-1.5">
                Only {product.stock} left
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 md:pt-4 sticky top-8">
            {/* Category */}
            {product.category && (
              <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">
                {product.category}
              </p>
            )}

            {/* Name */}
            <h1 className="font-display text-4xl md:text-5xl font-light text-charcoal dark:text-dk-text leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-display text-3xl font-light text-gold">
              ₹{product.price}
            </p>

            {/* Divider */}
            <div className="h-px bg-beige dark:bg-dk-border" />

            {/* Description */}
            {product.description ? (
              <p className="font-body text-sm text-muted dark:text-dk-muted leading-relaxed tracking-wide">
                {product.description}
              </p>
            ) : (
              <p className="font-body text-sm text-muted dark:text-dk-muted italic">
                Premium quality. Crafted with care.
              </p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                inStock ? (lowStock ? "bg-amber-400" : "bg-sage") : "bg-red-400"
              }`} />
              <span className="text-[10px] tracking-luxury uppercase text-muted dark:text-dk-muted">
                {!inStock
                  ? "Out of stock"
                  : lowStock
                  ? `Only ${product.stock} in stock`
                  : `In stock — ${product.stock} available`}
              </span>
            </div>

            {/* Quantity selector */}
            {inStock && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">
                  Quantity
                </label>
                <div className="flex items-center w-fit">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 border border-beige dark:border-dk-border text-charcoal dark:text-dk-text hover:border-gold hover:text-gold transition-colors duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-14 h-10 border-t border-b border-beige dark:border-dk-border bg-transparent text-center text-sm text-charcoal dark:text-dk-text font-medium focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 border border-beige dark:border-dk-border text-charcoal dark:text-dk-text hover:border-gold hover:text-gold transition-colors duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className={`w-full py-4 text-[10px] tracking-wide2 uppercase font-medium transition-all duration-300 border ${
                !inStock
                  ? "bg-beige dark:bg-dk-elevated border-beige dark:border-dk-border text-muted dark:text-dk-muted cursor-not-allowed"
                  : added
                  ? "bg-sage border-sage text-parchment"
                  : adding
                  ? "bg-charcoal dark:bg-dk-elevated border-charcoal dark:border-dk-border text-parchment dark:text-dk-text opacity-70"
                  : "btn-dark"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {!inStock ? "Out of Stock" : added ? (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
                      <polyline points="2,8 6,12 14,4" />
                    </svg>
                    Added to Cart
                  </>
                ) : adding ? (
                  <span className="flex gap-1 items-center">
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                ) : "Add to Cart"}
              </span>
            </button>

            <Link to="/cart" className="text-center text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors">
              View Cart →
            </Link>

            {/* Divider + meta */}
            <div className="h-px bg-beige dark:bg-dk-border mt-2" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "SKU", value: `#${product._id?.slice(-6).toUpperCase()}` },
                { label: "Category", value: product.category || "General" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">{label}</p>
                  <p className="text-xs text-charcoal dark:text-dk-text font-body">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="mt-16 text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors">
          ← Back to Collection
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
