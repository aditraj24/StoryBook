import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!identifier || !password) {
      setError("Email/Username and password are required");
      setLoading(false);
      return;
    }

    try {
      await login({ identifier, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back 👋
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Login to continue your stories
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Email or Username */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Email or Username
          </label>
          <input
            type="text"
            placeholder="Email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border
               focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-medium
                     bg-gradient-to-r from-blue-600 to-purple-600
                     hover:from-blue-700 hover:to-purple-700
                     transition-all shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
