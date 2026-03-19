import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", price: "", category: "", stock: "", image: "" };

function AdminDashboard() {
  const [products, setProducts]           = useState([]);
  const [orders, setOrders]               = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab]         = useState("products");

  // Add form
  const [form, setForm] = useState(EMPTY_FORM);

  // Edit state
  const [editingId,   setEditingId]   = useState(null);   // which product is open
  const [editForm,    setEditForm]    = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);

  /* ── Data fetching ─────────────────────────── */
  const fetchProducts = () =>
    API.get("/products").then(({ data }) => setProducts(data)).catch(console.error);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    await API.get("/orders").then(({ data }) => setOrders(data)).catch(console.error);
    setLoadingOrders(false);
  };

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  /* ── Add product ───────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/products", {
        name:     form.name,
        price:    Number(form.price),
        category: form.category,
        stock:    Number(form.stock),
        image:    form.image || "https://via.placeholder.com/400x300.png?text=Product+Image",
      });
      setForm(EMPTY_FORM);
      fetchProducts();
      toast.success("Product added.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  /* ── Edit handlers ─────────────────────────── */
  const openEdit = (product) => {
    // If clicking the same product, toggle closed
    if (editingId === product._id) {
      setEditingId(null);
      return;
    }
    setEditingId(product._id);
    setEditForm({
      name:     product.name     || "",
      price:    product.price    || "",
      category: product.category || "",
      stock:    product.stock    || "",
      image:    product.image    || "",
    });
  };

  const handleEditSave = async (productId) => {
    setEditLoading(true);
    try {
      await API.put(`/products/${productId}`, {
        name:     editForm.name,
        price:    Number(editForm.price),
        category: editForm.category,
        stock:    Number(editForm.stock),
        image:    editForm.image,
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

  /* ── Delete ────────────────────────────────── */
  const handleDelete = async (id) => {
    await API.delete(`/products/${id}`).catch(console.error);
    if (editingId === id) setEditingId(null);
    fetchProducts();
    toast.success("Product removed.");
  };

  /* ── Order status ──────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (newStatus === "delivered" || newStatus === "cancelled") {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      }
      toast.success("Status updated.");
    } catch { toast.error("Failed to update status"); }
  };

  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed");

  const statusStyle = (s) => ({
    pending:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    confirmed: "bg-blue-50  dark:bg-blue-900/20  text-blue-700  dark:text-blue-400  border-blue-200  dark:border-blue-800",
  }[s] || "bg-beige dark:bg-dk-elevated text-muted dark:text-dk-muted border-beige dark:border-dk-border");

  /* ── Edit inline panel ─────────────────────── */
  const EditPanel = ({ product }) => (
    <div className="border-t border-beige dark:border-dk-border bg-cream dark:bg-dk-bg px-4 pb-5 pt-4 page-enter">
      <p className="text-[10px] tracking-luxury text-gold uppercase mb-5">Edit Product</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {[
          { key: "name",     label: "Name",      type: "text"   },
          { key: "price",    label: "Price (₹)", type: "number" },
          { key: "category", label: "Category",  type: "text"   },
          { key: "stock",    label: "Stock",      type: "number" },
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

        {/* Image URL spans full width */}
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[9px] tracking-luxury text-muted dark:text-dk-muted uppercase">Image URL</label>
          <input
            type="text"
            value={editForm.image}
            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
            className="luxury-input text-sm"
          />
        </div>
      </div>

      {/* Stock indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${Number(editForm.stock) > 0 ? "bg-sage" : "bg-red-400"}`} />
        <span className="text-[10px] text-muted dark:text-dk-muted tracking-wide">
          {Number(editForm.stock) > 0
            ? `${editForm.stock} units in stock`
            : "Out of stock — update stock to make available"}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => handleEditSave(product._id)}
          disabled={editLoading}
          className="btn-gold py-2 px-6 text-[10px]"
        >
          {editLoading ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={() => setEditingId(null)}
          className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors"
        >
          Cancel
        </button>
        <div className="flex-1" />
        <button
          onClick={() => handleDelete(product._id)}
          className="text-[10px] tracking-wide uppercase text-muted dark:text-dk-muted hover:text-red-500 transition-colors"
        >
          Delete Product
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-16 px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-8 mb-14">
          <div>
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-1">Admin</p>
            <h1 className="font-display text-3xl font-light text-charcoal dark:text-dk-text">Dashboard</h1>
          </div>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          <div className="flex gap-4 text-[10px] tracking-luxury uppercase">
            <span className="text-muted dark:text-dk-muted">{products.length} Products</span>
            <span className="text-gold">·</span>
            <span className="text-muted dark:text-dk-muted">{activeOrders.length} Active Orders</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-10 border-b border-beige dark:border-dk-border">
          {["products", "orders"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-[10px] tracking-luxury uppercase transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-gold text-charcoal dark:text-dk-text"
                  : "border-transparent text-muted dark:text-dk-muted hover:text-charcoal dark:hover:text-dk-text"
              }`}
            >
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
              <form onSubmit={handleSubmit} className="space-y-7">
                {[
                  { name: "name",     placeholder: "Product Name",   type: "text",   required: true  },
                  { name: "price",    placeholder: "Price (₹)",      type: "number", required: true  },
                  { name: "category", placeholder: "Category",       type: "text",   required: true  },
                  { name: "stock",    placeholder: "Stock Quantity",  type: "number", required: false },
                  { name: "image",    placeholder: "Image URL",       type: "text",   required: false },
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
                <button type="submit" className="btn-gold w-full mt-4">Add Product</button>
              </form>
            </div>

            {/* Product List with inline edit */}
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
                      {/* Product row — clickable to expand edit */}
                      <div
                        onClick={() => openEdit(product)}
                        className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors duration-200 ${
                          editingId === product._id
                            ? "bg-parchment dark:bg-dk-surface"
                            : "hover:bg-parchment dark:hover:bg-dk-surface"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Thumbnail */}
                          <div className="w-9 h-11 bg-beige dark:bg-dk-elevated border border-beige dark:border-dk-border overflow-hidden flex-shrink-0">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-beige dark:bg-dk-border" />
                            }
                          </div>
                          <div>
                            <p className="font-body text-sm text-charcoal dark:text-dk-text font-medium leading-tight">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gold">₹{product.price}</p>
                              <span className="text-muted dark:text-dk-muted text-[10px]">·</span>
                              {/* Stock badge */}
                              <span className={`text-[9px] tracking-wide uppercase font-medium ${
                                product.stock > 10
                                  ? "text-sage"
                                  : product.stock > 0
                                  ? "text-amber-500"
                                  : "text-red-400"
                              }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expand indicator */}
                        <span className={`text-muted dark:text-dk-muted text-xs transition-transform duration-200 ${
                          editingId === product._id ? "rotate-180" : ""
                        }`}>
                          ↓
                        </span>
                      </div>

                      {/* Inline edit panel */}
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
            <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase mb-8">Active Orders</p>

            {loadingOrders ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-none" />)}
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display text-2xl font-light text-muted dark:text-dk-muted italic">No active orders</p>
              </div>
            ) : (
              <div className="bg-parchment dark:bg-dk-surface border border-beige dark:border-dk-border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-beige dark:border-dk-border">
                      {["Order", "Customer", "Amount", "Status", "Update"].map((h) => (
                        <th key={h} className="p-4 text-left text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige dark:divide-dk-border">
                    {activeOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-cream dark:hover:bg-dk-elevated transition-colors">
                        <td className="p-4 font-body text-sm text-charcoal dark:text-dk-text font-medium">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-charcoal dark:text-dk-text">{order.user?.name}</p>
                          <p className="text-xs text-muted dark:text-dk-muted">{order.user?.email}</p>
                        </td>
                        <td className="p-4 font-display text-lg font-light text-gold">₹{order.totalAmount}</td>
                        <td className="p-4">
                          <span className={`text-[10px] tracking-wide uppercase px-2.5 py-0.5 border font-medium ${statusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="bg-cream dark:bg-dk-elevated border border-beige dark:border-dk-border text-charcoal dark:text-dk-text text-xs py-1.5 px-3 font-body tracking-wide focus:outline-none focus:border-gold transition-colors cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;