import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

function ProductCard({ product }) {
  const { user } = useContext(AuthContext);
  const { fetchCart } = useContext(CartContext);   // 👈 IMPORTANT
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await API.post("/cart/add", {
        productId: product._id,
        quantity: 1,
      });

      fetchCart();   // 👈 now it exists
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition duration-300">
      <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>

      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600 mt-1">₹{product.price}</p>

      <button
        onClick={handleAddToCart}
        className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
