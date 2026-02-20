import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  return (
    <div className="p-10 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        Payment Successful 🎉
      </h1>

      {orderId && <p className="mb-6">Order ID: {orderId}</p>}

      <button
        onClick={() => navigate("/")}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
      >
        Go to Home
      </button>
    </div>
  );
}

export default OrderSuccess;