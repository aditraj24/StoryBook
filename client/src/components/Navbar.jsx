import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-gray-900"
        >
          StoryBook
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          

          <NavLink
            to="/my-story"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            My Stories
          </NavLink>
          <NavLink
            to="/create-stories"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
           + Create New Story
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium ${
                isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            {/* Simple avatar placeholder */}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-semibold">
              {user?.fullName?.[0] || "U"}
            </span>
            My Profile
          </NavLink>

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
