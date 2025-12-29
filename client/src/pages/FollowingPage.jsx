import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FollowingPage = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await API.get("/follow/following/me");
        setFollowing(res.data.data);
      } catch {
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  const handleUnfollow = async (id) => {
    try {
      await API.post(`/follow/unfollow/${id}`);
      setFollowing((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Failed to unfollow");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-2xl font-bold mb-6">Following</h1>

      {following.length === 0 && (
        <p className="text-gray-500">You are not following anyone</p>
      )}

      <div className="space-y-4">
        {following.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow"
          >
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              <img
                src={user.avatar || "/default-avatar.png"}
                className="w-12 h-12 rounded-full"
              />
              <p className="font-medium">{user.fullName}</p>
            </div>

            <button
              onClick={() => handleUnfollow(user._id)}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Unfollow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingPage;
