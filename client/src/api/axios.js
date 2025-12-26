import axios from "axios";

const baseURL = "https://storybook-2.onrender.com";
const api = axios.create({
  baseURL,
  withCredentials: true, // required for cookies
});

/* ---------- RESPONSE INTERCEPTOR ---------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response, just reject (network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    // ❌ Do NOT refresh for auth routes
    const authRoutes = [
      "/users/login",
      "/users/register",
      "/users/refresh-token",
      "/users/logout",
    ];

    const isAuthRoute = authRoutes.some((route) =>
      originalRequest.url.includes(route)
    );

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh
        await api.post("/users/refresh-token");

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // 🔥 Refresh failed → user is logged out
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
