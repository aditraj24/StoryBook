import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EditProfilePage = () => {
  const { API, user, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
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

    if (!fullName || !email) {
      setError("Full name and email are required");
      return;
    }

    const formData = new FormData();

    if (fullName !== user.fullName) formData.append("fullName", fullName);
    if (email !== user.email) formData.append("email", email);

    if (oldPassword && newPassword) {
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
    }

    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);

    setLoading(true);

    try {
      const res = await API.patch("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.data); // update auth context
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 space-y-5"
      >
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Password Change */}
        <div className="border-t pt-4">
          <p className="font-medium mb-2">Change Password (optional)</p>

          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-sm mb-1">Avatar</label>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm mb-1">Cover Image</label>
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}
          <input type="file" accept="image/*" onChange={handleCoverChange} />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-5 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
