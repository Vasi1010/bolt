import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white px-8 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        Bolt
      </Link>

      <div className="space-x-6 text-sm flex items-center">
        <Link to="/cart" className="relative hover:text-gray-300 transition">
         Cart
         {cart?.items?.length > 0 && (
           <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
             {cart.items.length}
           </span>
         )}

      </Link>


        <Link to="/orders" className="hover:text-gray-300 transition">
          Orders
        </Link>

        {!user && (
          <>
            <Link to="/login" className="hover:text-gray-300 transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-gray-300 transition">
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <span className="text-gray-300">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
