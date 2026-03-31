import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Logo from "../components/Logo";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error on change
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true);
    setApiError("");
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      navigate("/");
    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ msg }) =>
    msg ? <p className="text-[10px] text-red-500 dark:text-red-400 tracking-wide mt-1.5">{msg}</p> : null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-8 hero-fade">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4"><Link to="/"><Logo size="lg" /></Link></div>
        <div className="flex items-center justify-center gap-4 mb-12 mt-5">
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Sign In</p>
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
        </div>

        {/* API-level error banner */}
        {apiError && (
          <div className="mb-6 px-4 py-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <p className="text-xs text-red-600 dark:text-red-400 tracking-wide">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className={`luxury-input ${errors.email ? "border-red-400 dark:border-red-600 focus:border-red-400" : ""}`}
            />
            <FieldError msg={errors.email} />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`luxury-input ${errors.password ? "border-red-400 dark:border-red-600 focus:border-red-400" : ""}`}
            />
            <FieldError msg={errors.password} />
          </div>

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
