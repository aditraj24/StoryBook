import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ViewUser = () => {
  const { id } = useParams();
  const { API, user: authUser, setUser: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const [viewedUser, setViewedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------
     FETCH VIEWED USER
  ------------------------------------ */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setViewedUser(res.data.data);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  /* ------------------------------------
     FOLLOW / UNFOLLOW
  ------------------------------------ */
  const handleFollowToggle = async () => {
    if (!viewedUser || !authUser) return;

    try {
      if (viewedUser.isFollowing) {
        // UNFOLLOW
        await API.post(`/follow/unfollow/${viewedUser._id}`);

        // update viewed user
        setViewedUser((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: prev.followersCount - 1,
        }));

        // update logged-in user
        setAuthUser((prev) => ({
          ...prev,
          followingCount: prev.followingCount - 1,
        }));
      } else {
        // FOLLOW
        await API.post(`/follow/${viewedUser._id}`);

        // update viewed user
        setViewedUser((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));

        // update logged-in user
        setAuthUser((prev) => ({
          ...prev,
          followingCount: prev.followingCount + 1,
        }));
      }
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  /* ------------------------------------
     LOADING / ERROR
  ------------------------------------ */
  if (loading) {
    return <p className="text-center mt-20">Loading user...</p>;
  }

  if (!viewedUser) {
    return <p className="text-center mt-20">User not found</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Cover */}
          {viewedUser.coverImage && (
            <img
              src={viewedUser.coverImage}
              alt="Cover"
              className="w-full h-48 object-cover rounded-2xl mb-6"
            />
          )}

          {/* Avatar + Info */}
          <div className="flex items-center gap-6">
            <img
              src={viewedUser.avatar || "/avatar-placeholder.png"}
              alt={viewedUser.fullName}
              className="w-24 h-24 rounded-full object-cover border"
            />

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {viewedUser.fullName}
              </h1>
              <p className="text-gray-500">@{viewedUser.userName}</p>

              {/* Stats */}
              <div className="flex gap-6 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">
                    {viewedUser.followersCount}
                  </p>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">
                    {viewedUser.followingCount}
                  </p>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
              </div>
            </div>
          </div>

          {/* Follow / Unfollow Button */}
          {authUser?._id && authUser._id !== viewedUser._id && (
            <div className="mt-6">
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2 rounded-xl font-medium transition-all
                    ${
                      viewedUser.isFollowing
                        ? "border text-gray-700 hover:bg-gray-50"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                    }`}
              >
                {viewedUser.isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
