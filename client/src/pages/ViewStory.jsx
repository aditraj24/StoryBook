import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const ViewStory = () => {
  const { id } = useParams();
  const { API, user } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await API.get(`/stories/${id}`);
        setStory(res.data.data);
      } catch (err) {
        console.error("Failed to fetch story");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-10">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-10 text-gray-500">Story not found</p>
      </div>
    );
  }

  /* ---------- OWNERSHIP CHECK ---------- */
  const isOwner =
    user && (story.owner === user._id || story.owner?._id === user._id);

  return (
    <div>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-semibold">{story.title}</h1>
            <p className="text-gray-600">{story.place}</p>
            <p className="text-sm text-gray-500">
              {new Date(story.date).toDateString()}
            </p>
          </div>

          {/* Edit button (ONLY for owner) */}
          {isOwner && (
            <button
              onClick={() => navigate(`/stories/${story._id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Story
            </button>
          )}
        </div>

        {/* Description */}
        <p className="mb-6 whitespace-pre-line">{story.description}</p>

        {/* Photos */}
        {story.photos?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {story.photos.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Story"
                  className="w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {story.videos?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Videos</h3>
            <div className="grid grid-cols-1 gap-4">
              {story.videos.map((url, index) => (
                <video
                  key={index}
                  src={url}
                  controls
                  className="w-full rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStory;
