import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FollowersPage = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await API.get("/follow/followers/me");
        setFollowers(res.data.data);
      } catch {
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  const handleRemoveFollower = async (id) => {
    try {
      await API.post(`/follow/remove-follower/${id}`);
      setFollowers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Failed to remove follower");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-2xl font-bold mb-6">Followers</h1>

      {followers.length === 0 && (
        <p className="text-gray-500">No followers yet</p>
      )}

      <div className="space-y-4">
        {followers.map((user) => (
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
              onClick={() => handleRemoveFollower(user._id)}
              className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersPage;
