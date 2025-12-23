import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [story, setStory] = useState(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");

  const [newPhotos, setNewPhotos] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  /* ---------- FETCH STORY ---------- */
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await API.get(`/stories/${id}`);
        const data = res.data.data;

        setStory(data);

        // Ownership check (UI only)
        if (data.owner !== user._id && data.owner?._id !== user._id) {
          navigate(`/stories/${id}`);
          return;
        }

        setTitle(data.title);
        setDate(data.date.split("T")[0]);
        setPlace(data.place);
        setDescription(data.description);
      } catch (err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  /* ---------- FILE HANDLERS ---------- */

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewVideos((prev) => [...prev, ...files]);
    setVideoPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewVideo = (index) => {
    setNewVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- SUBMIT ---------- */

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

    newPhotos.forEach((p) => formData.append("photos", p));
    newVideos.forEach((v) => formData.append("videos", v));

    setSaving(true);

    try {
      await API.patch(`/stories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/stories/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update story");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <p className="text-center mt-10">Loading story...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Story</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-5"
        >
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Title"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Place"
          />

          <textarea
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          {/* Existing Media */}
          {story.photos?.length > 0 && (
            <div>
              <p className="font-medium mb-2">Existing Photos</p>
              <div className="grid grid-cols-3 gap-3">
                {story.photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="h-24 w-full object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {story.videos?.length > 0 && (
            <div>
              <p className="font-medium mb-2">Existing Videos</p>
              {story.videos.map((url, i) => (
                <video key={i} src={url} controls className="rounded mb-2" />
              ))}
            </div>
          )}

          {/* Add New Media */}
          <div>
            <label className="block mb-1">Add Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="h-24 w-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block mb-1">Add Videos</label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoChange}
            />
          </div>

          {videoPreviews.map((src, i) => (
            <div key={i} className="relative">
              <video src={src} controls className="rounded" />
              <button
                type="button"
                onClick={() => removeNewVideo(i)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStory;
