import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        navigate("/");
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (!order) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

        {order.user && (
          <>
            <p><strong>Customer:</strong> {order.user.name}</p>
            <p><strong>Email:</strong> {order.user.email}</p>
          </>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Items</h2>

        {order.items.map((item, index) => (
          <div key={index} className="border-b py-3 flex justify-between">
            <div>
              <p className="font-medium">
                {item.product?.name || "Product"}
              </p>
              <p className="text-sm text-gray-600">
                ₹{item.price} × {item.quantity}
              </p>
            </div>
            <div className="font-semibold">
              ₹{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-black text-white px-6 py-2 rounded"
      >
        Go Back
      </button>
    </div>
  );
}

export default OrderDetails;