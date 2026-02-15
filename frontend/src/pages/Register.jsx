import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
