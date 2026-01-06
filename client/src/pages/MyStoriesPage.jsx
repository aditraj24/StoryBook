import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import { useAuth } from "../context/AuthContext";

const MyStoriesPage = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // NEW: Sort State
  const [sortBy, setSortBy] = useState("newest");

  const LIMIT = 9;

  // Wrapped in useCallback to prevent unnecessary re-renders
  const fetchMyStories = useCallback(
    async (pageNumber = 1, currentSort = sortBy) => {
      try {
        if (pageNumber === 1) setLoading(true);

        const res = await API.get(
          `/stories/me?page=${pageNumber}&limit=${LIMIT}&sortBy=${currentSort}`
        );

        const { stories, pagination } = res.data.data;

        setMyStories((prev) =>
          pageNumber === 1 ? stories : [...prev, ...stories]
        );

        setHasMore(pageNumber < pagination.totalPages);
      } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    },
    [API, sortBy]
  );

  // Re-fetch when sortBy changes
  useEffect(() => {
    setPage(1);
    fetchMyStories(1, sortBy);
  }, [sortBy, fetchMyStories]);

  const loadMoreStories = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMyStories(nextPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1
              className="
    text-4xl
    font-extrabold
    leading-tight
    pb-1
    bg-gradient-to-r from-blue-600 to-purple-600
    bg-clip-text text-transparent
    inline-block
  "
            >
              My Stories 📚
            </h1>

            <p className="mt-2 text-gray-500 font-medium">
              Manage and revisit your shared memories
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* SORT DROPDOWN */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-tight">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-gray-700 font-medium cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="random">Random</option>
              </select>
            </div>

            <button
              onClick={() => navigate("/create-stories")}
              className="px-6 py-3 rounded-xl text-white font-bold bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-1"
            >
              + Create Story
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : myStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
            <span className="text-5xl mb-4">📭</span>
            <h2 className="text-xl font-bold text-gray-800">
              No stories found
            </h2>
            <p className="text-gray-500">
              Try changing your sort filter or create a new one.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myStories.map((story) => (
                <div
                  key={story._id}
                  className="group transform transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl shadow-md group-hover:shadow-2xl border border-gray-100 overflow-hidden">
                    <StoryCard story={story} />
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={loadMoreStories}
                  className="px-10 py-3 rounded-full border-2 border-black-600 text-clack-600 font-bold hover:bg-slate-200 hover:text-slate-800 transition-all shadow-md"
                >
                  Load More ↓
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Back Button */}
      <div className="pb-16 flex justify-center">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-500 font-semibold hover:text-gray-900 transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default MyStoriesPage;
