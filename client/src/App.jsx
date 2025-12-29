import { Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Home from "./pages/HomePage.jsx";
import Login from "./pages/LoginPage.jsx";
import Register from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MyStoriesPage from "./pages/MyStoriesPage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import ViewStory from "./pages/ViewStory.jsx";
import CreateStory from "./pages/CreateStory.jsx";
import EditStory from "./pages/EditStory.jsx";
import ViewUser from "./pages/ViewUser.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import FollowersPage from "./pages/FollowersPage.jsx";
import FollowingPage from "./pages/FollowingPage.jsx";
const App = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Show navbar only when logged in */}
      {user && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-story"
          element={
            <ProtectedRoute>
              <MyStoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-stories"
          element={
            <ProtectedRoute>
              <CreateStory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stories/:id"
          element={
            <ProtectedRoute>
              <ViewStory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stories/:id/edit"
          element={
            <ProtectedRoute>
              <EditStory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <ViewUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/followers"
          element={
            <ProtectedRoute>
              {" "}
              <FollowersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/following"
          element={
            <ProtectedRoute>
              {" "}
              <FollowingPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
