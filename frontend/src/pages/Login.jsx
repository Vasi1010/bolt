import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Logo from "../components/Logo";
import toast from "react-hot-toast";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      navigate("/");
    } catch {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-8 hero-fade">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4"><Link to="/"><Logo size="lg" /></Link></div>
        <div className="flex items-center justify-center gap-4 mb-12 mt-5">
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Sign In</p>
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input type="email"    name="email"    placeholder="Email Address" onChange={handleChange} required className="luxury-input" />
          <input type="password" name="password" placeholder="Password"      onChange={handleChange} required className="luxury-input" />
          <button type="submit" disabled={loading} className="btn-dark w-full mt-4">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          <span className="text-[10px] text-muted dark:text-dk-muted uppercase tracking-luxury">or</span>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
        </div>

        <p className="text-center text-xs text-muted dark:text-dk-muted tracking-wide">
          New to Bolt?{" "}
          <Link to="/register" className="text-gold hover:text-gold-light transition-colors underline underline-offset-2">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
