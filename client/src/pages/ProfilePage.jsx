import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setCurrentUser(res.data.data);
      } catch (err) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  if (!currentUser) {
    return <div className="text-center mt-10">No user found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Cover Image */}
      <Navbar/>
      {currentUser.coverImage && (
        <div className="w-full h-48 overflow-hidden rounded-xl mb-6">
          <img
            src={currentUser.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white shadow rounded-xl p-6">
        {/* Avatar + Info */}
        <div className="flex items-center gap-6">
          <img
            src={currentUser.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div>
            <h2 className="text-2xl font-semibold">{currentUser.fullName}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/edit-profile")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
