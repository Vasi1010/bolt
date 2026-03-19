import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Logo from "../components/Logo";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      toast.success("Account created. Welcome to Bolt.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Create Account</p>
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input type="text"     name="name"     placeholder="Full Name"      onChange={handleChange} required className="luxury-input" />
          <input type="email"    name="email"    placeholder="Email Address"  onChange={handleChange} required className="luxury-input" />
          <input type="password" name="password" placeholder="Password"       onChange={handleChange} required className="luxury-input" />
          <button type="submit" disabled={loading} className="btn-gold w-full mt-4">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
          <span className="text-[10px] text-muted dark:text-dk-muted uppercase tracking-luxury">or</span>
          <div className="flex-1 h-px bg-beige dark:bg-dk-border" />
        </div>

        <p className="text-center text-xs text-muted dark:text-dk-muted tracking-wide">
          Already have an account?{" "}
          <Link to="/login" className="text-gold hover:text-gold-light transition-colors underline underline-offset-2">Sign in</Link>
        </p>
        <p className="text-center text-[10px] text-muted dark:text-dk-muted mt-6 tracking-wide leading-relaxed">
          By creating an account, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

export default Register;
