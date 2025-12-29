import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- FILE HANDLERS ---------- */

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !userName) {
      setError("All fields including username are required");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("userName", userName.toLowerCase());
    formData.append("email", email);
    formData.append("password", password);

    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);

    setLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account ✨
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Start capturing your memories today
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="Your Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {/* Username */}
        <div>
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            placeholder="username"
            value={userName}
            onChange={(e) =>
              setUserName(e.target.value.toLowerCase().replace(/\s+/g, ""))
            }
            className="mt-1 w-full px-4 py-3 rounded-xl border
               focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Username must be lowercase, no spaces
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

        {/* Avatar Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Avatar (optional)
          </label>

          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                Avatar
              </div>
            )}

            <label className="cursor-pointer px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition">
              Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Cover Image (optional)
          </label>

          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-32 object-cover rounded-xl mb-3 shadow"
            />
          )}

          <label className="cursor-pointer flex items-center justify-center w-full border-2 border-dashed rounded-xl p-5 text-sm text-gray-500 hover:border-blue-500 transition">
            Click to upload cover image
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
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
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
