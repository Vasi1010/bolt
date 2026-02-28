import { useState, useEffect } from "react";
import API from "../api/axios";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  // ---------------- FETCH DATA ----------------

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await API.get("/orders");
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // ---------------- PRODUCT HANDLERS ----------------

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/products", {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        image:
          form.image ||
          "https://via.placeholder.com/400x300.png?text=Product+Image",
      });

      setForm({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });

      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- ORDER HANDLERS ----------------

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      // 🔥 Remove from UI immediately if delivered or cancelled
      if (newStatus === "delivered" || newStatus === "cancelled") {
        setOrders((prev) =>
          prev.filter((order) => order._id !== orderId)
        );
      } else {
        // Otherwise just update its status locally
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
      }

    } catch (error) {
      alert("Failed to update status");
    }
  };

  // Only show active orders
  const activeOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "confirmed"
  );

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* ---------------- PRODUCTS SECTION ---------------- */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Products</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-4 mb-8"
        >
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button className="bg-black text-white px-6 py-2 rounded">
            Add Product
          </button>
        </form>

        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white p-4 rounded shadow flex justify-between"
            >
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">
                  ₹{product.price} | Stock: {product.stock}
                </p>
              </div>
              <button
                onClick={() => handleDelete(product._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- ORDERS SECTION ---------------- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>

        {loadingOrders ? (
          <p>Loading orders...</p>
        ) : activeOrders.length === 0 ? (
          <p className="text-gray-500">No active orders</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((order) => (
                  <tr key={order._id} className="border-t">
                    <td className="p-3">{order._id.slice(-6)}</td>
                    <td className="p-3">
                      {order.user?.name}
                      <br />
                      <span className="text-sm text-gray-500">
                        {order.user?.email}
                      </span>
                    </td>
                    <td className="p-3">₹{order.totalAmount}</td>
                    <td className="p-3 capitalize">{order.status}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="border p-1 rounded"
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
    </div>
  );
}

export default AdminDashboard;