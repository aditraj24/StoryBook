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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await API.get(`/stories/${id}`);
        setStory(res.data.data);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <p className="text-gray-500">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Story not found
      </div>
    );
  }

  const isOwner =
    user && (story.owner === user._id || story.owner?._id === user._id);

  const author = story.owner;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this story? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await API.delete(`/stories/${story._id}`);
      navigate("/my-story");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete story");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* ---------- AUTHOR CARD ---------- */}
        {/* ---------- AUTHOR CARD ---------- */}
        {author && (
          <div className="flex items-center justify-between mb-10 p-5 bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-white/50">
            <div className="flex items-center gap-4">
              <img
                src={author.avatar || "/avatar-placeholder.png"}
                alt={author.fullName}
                className="w-14 h-14 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-800">{author.fullName}</p>
                <p className="text-sm text-gray-500">{author.email}</p>
              </div>
            </div>

            {/* New View Profile Button */}
            <button
              onClick={() => navigate(`/user/${author._id || author}`)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              View Profile
            </button>
          </div>
        )}

        {/* ---------- STORY CARD ---------- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
                {story.title}
              </h1>
              <p className="text-gray-600">{story.place}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(story.date).toDateString()}
              </p>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/stories/${story._id}/edit`)}
                  className="px-5 py-2 rounded-xl text-white font-medium
                             bg-gradient-to-r from-blue-600 to-purple-600
                             hover:from-blue-700 hover:to-purple-700
                             transition-all shadow"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl text-white font-medium
                             bg-gradient-to-r from-red-600 to-rose-600
                             hover:from-red-700 hover:to-rose-700
                             transition-all shadow
                             disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">
            {story.description}
          </p>

          {/* Media */}
          {story.media?.length > 0 && (
            <div className="space-y-8">
              {story.media.map((item, index) => (
                <div key={index}>
                  {item.type === "image" && (
                    <img
                      src={item.url}
                      alt="Story media"
                      className="w-full rounded-2xl shadow object-cover"
                    />
                  )}

                  {item.type === "text" && (
                    <p className="italic text-gray-600 mt-3 pl-4 border-l-4 border-blue-500">
                      {item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="pb-16 flex justify-center">
        <button
          onClick={() =>  { isOwner && navigate("/my-story"); !isOwner && navigate("/"); }}
          className="group flex items-center gap-2 text-gray-500 font-semibold hover:text-gray-900 transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Return
        </button>
      </div>
        <div className="h-10"></div>
    </div>
  );
};

export default ViewStory;
