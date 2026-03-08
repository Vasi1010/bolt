import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";
function Checkout() {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("RAZORPAY");

  const navigate = useNavigate();
  const { fetchCart } = useContext(CartContext);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Create order
      const { data: orderData } = await API.post("/orders", {
        paymentMethod: method,
      });

      const orderId = orderData.order._id;

      // COD FLOW
      if (method === "COD") {
        await fetchCart();

        navigate("/success", {
          state: { orderId },
        });

        return;
      }

      // RAZORPAY FLOW
      const { data } = await API.post(`/payments/razorpay?orderId=${orderId}`);

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Bolt Store",
        description: "Order Payment",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          try {
            await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await fetchCart();

            navigate("/success", {
              state: { orderId },
            });

          } catch (error) {
            toast.error("Payment verification failed");
          }
        },

        modal: {
          ondismiss: function () {
            toast("Payment cancelled");
          },
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });

      razorpay.open();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">

        <div>
          <p className="font-semibold mb-3">Choose Payment Method</p>

          <label className="flex items-center space-x-2 mb-2">
            <input
              type="radio"
              value="RAZORPAY"
              checked={method === "RAZORPAY"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>Pay Online (Razorpay)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="COD"
              checked={method === "COD"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>Cash on Delivery</span>
          </label>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>

      </div>
    </div>
  );
}

export default Checkout;