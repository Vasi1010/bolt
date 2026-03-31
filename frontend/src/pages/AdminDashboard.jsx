import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", price: "", category: "", stock: "", image: "", description: "" };
const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || "";
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || "";

// ── Cloudinary upload helper ──────────────────────────────────────────────────
async function uploadToCloudinary(file) {
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
    throw new Error("Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD and VITE_CLOUDINARY_PRESET.");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
}

// ── ImageUploadField ──────────────────────────────────────────────────────────
function ImageUploadField({ value, onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUDINARY_CLOUD) {
      toast.error("Cloudinary not configured — paste a URL instead.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setPreview(url);
      onChange(url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <label className="text-[9px] tracking-luxury text-muted dark:text-dk-muted uppercase">{label}</label>
      <div className="flex gap-3 items-start">
        {/* Preview */}
        {preview && (
          <div className="w-16 h-20 border border-beige dark:border-dk-border overflow-hidden flex-shrink-0">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            placeholder="Paste URL or upload below"
            value={value}
            onChange={(e) => { onChange(e.target.value); setPreview(e.target.value); }}
            className="luxury-input text-sm w-full"
          />
          <label className={`flex items-center gap-2 cursor-pointer text-[9px] tracking-luxury uppercase text-muted dark:text-dk-muted hover:text-gold transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {uploading ? "Uploading..." : "Upload from device"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-charcoal dark:text-dk-text" }) {
  return (
    <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border p-6">
      <p className="text-[9px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-3">{label}</p>
      <p className={`font-display text-3xl font-light ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted dark:text-dk-muted mt-1.5 tracking-wide">{sub}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [products, setProducts]           = useState([]);
  const [orders, setOrders]               = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab]         = useState("products");
  const [orderSubTab, setOrderSubTab]     = useState("active"); // "active" | "history"

  const [form, setForm]         = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);

  /* ── Data fetching ──────────────────────────────── */
  const fetchProducts = useCallback(() =>
    API.get("/products").then(({ data }) => setProducts(data)).catch(console.error), []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    await API.get("/orders").then(({ data }) => setOrders(data)).catch(console.error);
    setLoadingOrders(false);
  }, []);

  useEffect(() => { fetchProducts(); fetchOrders(); }, [fetchProducts, fetchOrders]);

  /* ── Stats ──────────────────────────────────────── */
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const today = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;

  const topProduct = (() => {
    const counts = {};
    orders.forEach((o) =>
      (o.items || []).forEach((item) => {
        const name = item.product?.name || "Unknown";
        counts[name] = (counts[name] || 0) + item.quantity;
      })
    );
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "—";
  })();

  const activeOrders  = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped");
  const historyOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  /* ── Add product ────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/products", {
        name:        form.name,
        price:       Number(form.price),
        category:    form.category,
        stock:       Number(form.stock),
        image:       form.image || "https://placehold.co/400x500/f7f3ec/1c1c1c?text=Product",
        description: form.description,
      });
      setForm(EMPTY_FORM);
      fetchProducts();
      toast.success("Product added.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  /* ── Edit handlers ──────────────────────────────── */
  const openEdit = (product) => {
    if (editingId === product._id) { setEditingId(null); return; }
    setEditingId(product._id);
    setEditForm({
      name:        product.name        || "",
      price:       product.price       || "",
      category:    product.category    || "",
      stock:       product.stock       || "",
      image:       product.image       || "",
      description: product.description || "",
    });
  };

  const handleEditSave = async (productId) => {
    setEditLoading(true);
    try {
      await API.put(`/products/${productId}`, {
        name:        editForm.name,
        price:       Number(editForm.price),
        category:    editForm.category,
        stock:       Number(editForm.stock),
        image:       editForm.image,
        description: editForm.description,
      });
      fetchProducts();
      setEditingId(null);
      toast.success("Product updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`).catch(console.error);
    if (editingId === id) setEditingId(null);
    fetchProducts();
    toast.success("Product removed.");
  };

  /* ── Order status ───────────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success("Status updated.");
    } catch { toast.error("Failed to update status"); }
  };

  const statusStyle = (s) => ({
    pending:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    confirmed: "bg-blue-50  dark:bg-blue-900/20  text-blue-700  dark:text-blue-400  border-blue-200  dark:border-blue-800",
    shipped:   "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    delivered: "bg-sage/10  dark:bg-sage/20       text-sage       dark:text-sage       border-sage/20   dark:border-sage/30",
    cancelled: "bg-red-50   dark:bg-red-900/20   text-red-700   dark:text-red-400   border-red-200   dark:border-red-800",
  }[s] || "bg-beige dark:bg-dk-elevated text-muted dark:text-dk-muted border-beige dark:border-dk-border");

  /* ── Inline edit panel ──────────────────────────── */
  const EditPanel = ({ product }) => (
    <div className="border-t border-beige dark:border-dk-border bg-cream dark:bg-dk-bg px-4 pb-5 pt-4">
      <p className="text-[10px] tracking-luxury text-gold uppercase mb-5">Edit Product</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {[
          { key: "name",     label: "Name",        type: "text"   },
          { key: "price",    label: "Price (₹)",   type: "number" },
          { key: "category", label: "Category",    type: "text"   },
          { key: "stock",    label: "Stock",        type: "number" },
        ].map(({ key, label, type }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-[9px] tracking-luxury text-muted dark:text-dk-muted uppercase">{label}</label>
            <input
              type={type}
              value={editForm[key]}
              onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
              className="luxury-input text-sm"
            />
          </div>
        ))}

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[9px] tracking-luxury text-muted dark:text-dk-muted uppercase">Description</label>
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={2}
            placeholder="Product description (optional)"
            className="luxury-input text-sm resize-none"
          />
        </div>

        <ImageUploadField
          label="Image"
          value={editForm.image}
          onChange={(url) => setEditForm({ ...editForm, image: url })}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${Number(editForm.stock) > 0 ? "bg-sage" : "bg-red-400"}`} />
        <span className="text-[10px] text-muted dark:text-dk-muted tracking-wide">
          {Number(editForm.stock) > 0 ? `${editForm.stock} units in stock` : "Out of stock"}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={() => handleEditSave(product._id)} disabled={editLoading} className="btn-gold py-2 px-6 text-[10px]">
          {editLoading ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={() => setEditingId(null)}
          className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors">
          Cancel
        </button>
        <div className="flex-1" />
        <button onClick={() => handleDelete(product._id)}
          className="text-[10px] tracking-wide uppercase text-muted dark:text-dk-muted hover:text-red-500 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );

  /* ── Orders table ───────────────────────────────── */
  const OrdersTable = ({ list, showUpdate }) => (
    list.length === 0 ? (
      <div className="py-16 text-center">
        <p className="font-display text-2xl font-light text-muted dark:text-dk-muted italic">No orders here</p>
      </div>
    ) : (
      <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-beige dark:border-dk-border">
              {["Order", "Customer", "Amount", "Date", "Status", showUpdate && "Update"].filter(Boolean).map((h) => (
                <th key={h} className="p-4 text-left text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-beige dark:divide-dk-border">
            {list.map((order) => (
              <tr key={order._id} className="hover:bg-cream dark:hover:bg-dk-elevated transition-colors">
                <td className="p-4 font-body text-sm text-charcoal dark:text-dk-text font-medium">
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td className="p-4">
                  <p className="text-sm text-charcoal dark:text-dk-text">{order.user?.name}</p>
                  <p className="text-xs text-muted dark:text-dk-muted">{order.user?.email}</p>
                </td>
                <td className="p-4 font-display text-lg font-light text-gold">₹{order.totalAmount}</td>
                <td className="p-4 text-xs text-muted dark:text-dk-muted">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="p-4">
                  <span className={`text-[10px] tracking-wide uppercase px-2.5 py-0.5 border font-medium ${statusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                {showUpdate && (
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="bg-cream dark:bg-dk-elevated border border-beige dark:border-dk-border text-charcoal dark:text-dk-text text-xs py-1.5 px-3 font-body tracking-wide focus:outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-8 mb-10">
          <div>
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">Admin</p>
            <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text">Dashboard</h1>
          </div>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          <div className="flex gap-4 text-[10px] tracking-luxury uppercase">
            <span className="text-muted dark:text-dk-muted">{products.length} Products</span>
            <span className="text-gold">·</span>
            <span className="text-muted dark:text-dk-muted">{activeOrders.length} Active</span>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            sub="All completed orders"
            color="text-gold"
          />
          <StatCard
            label="Total Orders"
            value={orders.length}
            sub={`${activeOrders.length} active`}
          />
          <StatCard
            label="Orders Today"
            value={ordersToday}
            sub={new Date().toLocaleDateString("en-IN", { weekday: "long" })}
          />
          <StatCard
            label="Top Product"
            value=""
            sub={topProduct}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-10 border-b border-beige dark:border-dk-border">
          {["products", "orders"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-[10px] tracking-luxury uppercase transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-gold text-charcoal dark:text-dk-text"
                  : "border-transparent text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Products Tab ─────────────────────────── */}
        {activeTab === "products" && (
          <div className="grid md:grid-cols-2 gap-12">
            {/* Add Product Form */}
            <div>
              <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-8">Add New Product</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { name: "name",     placeholder: "Product Name",   type: "text",   required: true  },
                  { name: "price",    placeholder: "Price (₹)",      type: "number", required: true  },
                  { name: "category", placeholder: "Category",       type: "text",   required: true  },
                  { name: "stock",    placeholder: "Stock Quantity",  type: "number", required: false },
                ].map((f) => (
                  <input
                    key={f.name}
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                    required={f.required}
                    className="luxury-input"
                  />
                ))}

                <textarea
                  name="description"
                  placeholder="Product Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="luxury-input resize-none"
                />

                <div className="grid grid-cols-1 gap-2">
                  <ImageUploadField
                    label="Product Image"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                  />
                </div>

                <button type="submit" className="btn-gold w-full mt-2">Add Product</button>
              </form>
            </div>

            {/* Product List */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">All Products</p>
                <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
                <p className="text-[9px] tracking-wide text-muted dark:text-dk-muted uppercase">Click to edit</p>
              </div>

              {products.length === 0 ? (
                <p className="text-muted dark:text-dk-muted text-sm italic font-display">No products yet.</p>
              ) : (
                <div className="border border-beige dark:border-dk-border divide-y divide-beige dark:divide-dk-border">
                  {products.map((product) => (
                    <div key={product._id}>
                      <div
                        onClick={() => openEdit(product)}
                        className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors duration-200 ${
                          editingId === product._id ? "bg-parchment dark:bg-dk-surface" : "hover:bg-parchment dark:hover:bg-dk-surface"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-11 bg-beige dark:bg-dk-elevated border border-beige dark:border-dk-border overflow-hidden flex-shrink-0">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-beige dark:bg-dk-border" />
                            }
                          </div>
                          <div>
                            <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium leading-tight">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gold">₹{product.price}</p>
                              <span className="text-muted dark:text-dk-muted text-[10px]">·</span>
                              <span className={`text-[9px] tracking-wide uppercase font-medium ${
                                product.stock > 10 ? "text-sage" : product.stock > 0 ? "text-amber-500" : "text-red-400"
                              }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-muted dark:text-dk-muted text-xs transition-transform duration-200 ${editingId === product._id ? "rotate-180" : ""}`}>↓</span>
                      </div>
                      {editingId === product._id && <EditPanel product={product} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Orders Tab ───────────────────────────── */}
        {activeTab === "orders" && (
          <div>
            {/* Sub-tabs: Active / History */}
            <div className="flex gap-6 mb-8 border-b border-beige dark:border-dk-border">
              {[
                { key: "active",  label: `Active Orders (${activeOrders.length})` },
                { key: "history", label: `History (${historyOrders.length})` },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setOrderSubTab(key)}
                  className={`pb-3 text-[10px] tracking-luxury uppercase border-b-2 transition-all duration-200 -mb-px ${
                    orderSubTab === key
                      ? "border-gold text-charcoal dark:text-dk-text"
                      : "border-transparent text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {loadingOrders ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-none" />)}</div>
            ) : orderSubTab === "active" ? (
              <OrdersTable list={activeOrders} showUpdate={true} />
            ) : (
              <OrdersTable list={historyOrders} showUpdate={false} />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
