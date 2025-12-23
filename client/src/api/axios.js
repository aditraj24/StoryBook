import axios from "axios";

// Vite exposes env vars on import.meta.env and requires VITE_ prefix for user vars
const baseURL = import.meta?.env?.VITE_BASE_URL || "http://localhost:8000/api/v1";


const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // 🔥 REQUIRED for cookies
});

/* ---------- RESPONSE INTERCEPTOR ---------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt refresh
        await api.post("/users/refresh-token");

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
