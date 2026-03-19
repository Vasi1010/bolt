import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Cart           from "./pages/Cart";
import Orders         from "./pages/Orders";
import Checkout       from "./pages/Checkout";
import OrderSuccess   from "./pages/OrderSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound       from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderDetails   from "./pages/OrderDetails";

function App() {
  return (
    <div className="min-h-screen bg-cream dark:bg-dk-bg font-body transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/success"  element={<OrderSuccess />} />
        <Route path="/admin"    element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/orders/:id"       element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly={true}><OrderDetails /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
