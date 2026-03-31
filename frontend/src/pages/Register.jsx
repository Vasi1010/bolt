import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Logo from "../components/Logo";

function Register() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true);
    setApiError("");
    try {
      await API.post("/auth/register", form);
      navigate("/login", { state: { message: "Account created. Welcome to Bolt." } });
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ msg }) =>
    msg ? <p className="text-[10px] text-red-500 dark:text-red-400 tracking-wide mt-1.5">{msg}</p> : null;

  // Password strength
  const strength = !form.password ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Moderate", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-sage"];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-8 hero-fade">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4"><Link to="/"><Logo size="lg" /></Link></div>
        <div className="flex items-center justify-center gap-4 mb-12 mt-5">
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
          <p className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Create Account</p>
          <div className="h-px w-10 bg-beige dark:bg-dk-border" />
        </div>

        {apiError && (
          <div className="mb-6 px-4 py-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <p className="text-xs text-red-600 dark:text-red-400 tracking-wide">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={`luxury-input ${errors.name ? "border-red-400 dark:border-red-600" : ""}`}
            />
            <FieldError msg={errors.name} />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className={`luxury-input ${errors.email ? "border-red-400 dark:border-red-600" : ""}`}
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
              className={`luxury-input ${errors.password ? "border-red-400 dark:border-red-600" : ""}`}
            />
            <FieldError msg={errors.password} />
            {/* Password strength indicator */}
            {form.password && !errors.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-beige dark:bg-dk-border"}`} />
                  ))}
                </div>
                <span className="text-[9px] tracking-wide text-muted dark:text-dk-muted uppercase">{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

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
