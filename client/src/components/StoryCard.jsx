import { useNavigate } from "react-router-dom";

const StoryCard = ({ story }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/stories/${story._id}`)}
      className="cursor-pointer bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold">{story.title}</h3>
      <p className="text-gray-600">{story.place}</p>
      <p className="text-sm text-gray-500 mt-2">
        {new Date(story.date).toDateString()}
      </p>
    </div>
  );
};

export default StoryCard;
