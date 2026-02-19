import { useState, useEffect } from "react";
import API from "../api/axios";

function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",   // 🔥 added
    stock: "",
    image: "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/products", {
        name: form.name,
        price: Number(form.price),
        category: form.category,  // 🔥 added
        stock: Number(form.stock),
        image:
          form.image ||
          "https://via.placeholder.com/400x300.png?text=Product+Image",
      });

      alert("Product created successfully");

      setForm({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });

      fetchProducts();
    } catch (error) {
      console.error("Create product error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4 mb-10"
      >
        <h2 className="text-xl font-semibold">Add New Product</h2>

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
          placeholder="Category (e.g. Dairy, Snacks)"
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
          placeholder="Image URL (optional)"
          value={form.image}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Products</h2>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">
                  ₹{product.price} | Stock: {product.stock} | {product.category}
                </p>
              </div>

              <button
                onClick={() => handleDelete(product._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
