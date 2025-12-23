import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StoryCard from "../components/StoryCard";
import { useAuth } from "../context/AuthContext";

const MyStoriesPage = () => {
  const { API } = useAuth();
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchMyStories = async () => {
    try {
      const res = await API.get("/stories/me");
      console.log("MY STORIES:", res.data);
      setMyStories(res.data.data);
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchMyStories();
}, []);


  return (
    <div>
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">My Stories</h1>

        {loading ? (
          <p className="text-center">Loading your stories...</p>
        ) : myStories.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven’t created any stories yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {myStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStoriesPage;
