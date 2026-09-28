import { useState } from "react";
import { loginUser } from "../features/auth/auth.service.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);

      // localStorage.setItem("token", response.data.token);
      login(response.data.token, response.data.user);

      if (response.data.user.role === "PASSENGER") {
        navigate("/passenger");
      } else {
        navigate("/driver");
      }

      // console.log("Login successful");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-md"
      >
        <h1 className="mb-6 text-2xl font-bold text-center">Login</h1>

        {error && (
          <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium">Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black py-2.5 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
