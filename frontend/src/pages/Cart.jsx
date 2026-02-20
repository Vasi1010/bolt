import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
function Cart() {
  const { cart, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();
  const handleRemove = async (productId) => {
    try {
      await API.delete("/cart/remove", {
        data: { productId },
      });

      fetchCart(); // 🔥 updates global cart
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemove(productId);
      return;
    }

    try {
      await API.put("/cart/update", {
        productId,
        quantity: newQuantity,
      });

      fetchCart(); // 🔥 updates global cart
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Your cart is empty.
      </div>
    );
  }

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.product._id}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{item.product.name}</h2>
              <p className="text-gray-600">
                ₹{item.product.price} × {item.quantity}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    handleUpdate(item.product._id, item.quantity - 1)
                  }
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                >
                  −
                </button>

                <span className="px-4">{item.quantity}</span>

                <button
                  onClick={() =>
                    handleUpdate(item.product._id, item.quantity + 1)
                  }
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                >
                  +
                </button>
              </div>

              <div className="font-semibold">
                ₹{item.product.price * item.quantity}
              </div>

              <button
                onClick={() => handleRemove(item.product._id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right">
        <h2 className="text-xl font-bold">Total: ₹{total}</h2>

        <button
         onClick={() => navigate("/checkout")}
         className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
         Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
