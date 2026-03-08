import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/my");
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <div className="p-10">Loading your orders...</div>;
  }

  // Empty orders UI
  if (orders.length === 0) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold mb-3">📦 No Orders Yet</h2>

        <p className="text-gray-500 mb-6">
          You haven't placed any orders yet.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            onClick={() => navigate(`/orders/${order._id}`)}
            className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  Order #{order._id.slice(-6)}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-4 text-right font-bold text-lg">
              ₹{order.totalAmount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;