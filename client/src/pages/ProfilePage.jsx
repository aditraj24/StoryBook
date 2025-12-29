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
  }, [API]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No user found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Cover */}
        <div className="relative h-56 rounded-3xl overflow-hidden shadow-lg mb-16 bg-gradient-to-r from-blue-500 to-purple-600">
          {currentUser.coverImage && (
            <img
              src={currentUser.coverImage}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Card */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 px-8 pb-8">
          {/* Avatar */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            <img
              src={currentUser.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="pt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {currentUser.fullName}
            </h2>
            <p className="text-gray-500 mt-1">{currentUser.email}</p>
            {/* Stats */}
            <div className="flex justify-center gap-10 mt-6">
              <button
                onClick={() => navigate("/followers")}
                className="text-center hover:opacity-80 transition"
              >
                <p className="text-xl font-bold text-gray-800">
                  {currentUser.followersCount}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </button>

              <button
                onClick={() => navigate("/following")}
                className="text-center hover:opacity-80 transition"
              >
                <p className="text-xl font-bold text-gray-800">
                  {currentUser.followingCount}
                </p>
                <p className="text-sm text-gray-500">Following</p>
              </button>
            </div>

            {/* Actions */}
            <div className="mt-6">
              <button
                onClick={() => navigate("/edit-profile")}
                className="px-8 py-3 rounded-xl text-white font-medium
                           bg-gradient-to-r from-blue-600 to-purple-600
                           hover:from-blue-700 hover:to-purple-700
                           transition-all shadow-lg hover:shadow-xl"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
