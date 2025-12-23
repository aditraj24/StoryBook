import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 5;

const CreateStory = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");

  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Cleanup previews ---------- */
  useEffect(() => {
    return () => {
      photoPreviews.forEach(URL.revokeObjectURL);
      videoPreviews.forEach(URL.revokeObjectURL);
    };
  }, [photoPreviews, videoPreviews]);

  /* ---------- File Handlers ---------- */

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);

    setPhotos((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files);

    setVideos((prev) => [...prev, ...files]);
    setVideoPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- Submit ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !date || !place || !description) {
      setError("All required fields must be filled");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("place", place);
    formData.append("description", description);

    photos.forEach((photo) => formData.append("photos", photo));
    videos.forEach((video) => formData.append("videos", video));

    setLoading(true);

    try {
      await API.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Create New Story</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-5"
        >
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <input
            type="text"
            placeholder="Story Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Place *"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <textarea
            rows="5"
            placeholder="Write your story..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          {/* Photos */}
          <div>
            <label className="block text-sm mb-1">
              Photos (up to {MAX_PHOTOS})
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotosChange}
            />

            <div className="grid grid-cols-3 gap-3 mt-3">
              {photoPreviews.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} className="h-24 w-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm mb-1">
              Videos (up to {MAX_VIDEOS})
            </label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideosChange}
            />

            <div className="grid gap-3 mt-3">
              {videoPreviews.map((src, idx) => (
                <div key={idx} className="relative">
                  <video src={src} controls className="rounded" />
                  <button
                    type="button"
                    onClick={() => removeVideo(idx)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Story"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;
