import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import StoryCard from "../components/StoryCard";

const HomePage = () => {
  const { API } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await API.get("/stories");
        setStories(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stories");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <p className="text-center">Loading stories...</p>
        ) : stories.length === 0 ? (
          <p className="text-center text-gray-500">No stories found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
