import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EditProfilePage = () => {
  const { API, user, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");

  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* -------- Populate existing data -------- */
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setUserName(user.userName || "");
      setAvatarPreview(user.avatar || null);
      setCoverPreview(user.coverImage || null);
    }
  }, [user]);

  /* -------- File Handlers -------- */
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

  /* -------- Submit -------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !userName) {
      setError("Full name, username and email are required");
      return;
    }

    const formData = new FormData();

    if (fullName !== user.fullName) formData.append("fullName", fullName);

    if (email !== user.email) formData.append("email", email);

    if (userName !== user.userName)
      formData.append("userName", userName.toLowerCase());

    if (oldPassword && newPassword) {
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
    }

    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);

    setLoading(true);

    try {
      const res = await API.patch("/users/me", formData);
      setUser(res.data.data);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Profile ✨
          </h1>
          <p className="mt-3 text-gray-500">
            Keep your profile fresh and up to date
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Cover Image */}
          <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <label className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg cursor-pointer hover:bg-black/80 transition">
              Change Cover
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Avatar */}
          <div className="relative flex justify-center -mt-14">
            <div className="relative group">
              <img
                src={avatarPreview || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label className="absolute inset-0 bg-black/50 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-8 space-y-6">
            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Name, Username & Email */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) =>
                    setUserName(
                      e.target.value.toLowerCase().replace(/\s+/g, "")
                    )
                  }
                  className="mt-1 w-full px-4 py-3 rounded-xl border
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase, no spaces
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Change Password (optional)
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-medium
                           bg-gradient-to-r from-blue-600 to-purple-600
                           hover:from-blue-700 hover:to-purple-700
                           transition-all shadow-lg hover:shadow-xl
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-3 rounded-xl border text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
