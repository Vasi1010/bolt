import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { CartContext } from "../context/CartContext";

function Checkout() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchCart } = useContext(CartContext);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create order in DB
      const { data: orderData } = await API.post("/orders");
      const orderId = orderData.order._id;

      // 2️⃣ Create Razorpay order
      const { data } = await API.post(
        `/payments/razorpay?orderId=${orderId}`
      );

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Bolt Store",
        description: "Order Payment",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          try {
            // 3️⃣ Verify payment
            await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await fetchCart(); // refresh cart

            navigate("/success", {
              state: { orderId },
            });

          } catch (error) {
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="mb-4">
          Payment Method: <strong>Online (Razorpay)</strong>
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;