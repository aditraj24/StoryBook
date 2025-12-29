import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------- Restore session on app load -------- */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // refresh access token
        await api.post("/users/refresh-token");

        // fetch current user
        try {
          const res = await api.get("/users/me");
          setUser(res.data.data);
        } catch {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* -------- Auth Actions -------- */

  const login = async (credentials) => {
    const res = await api.post("/users/login", credentials);
    setUser(res.data.data.user);
  };

  const register = async (data) => {
    const res = await api.post("/users/register", data);
    setUser(res.data.data.user);
  };

  const logout = async () => {
    await api.post("/users/logout");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">Loading…</div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, API: api }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* -------- Custom Hook -------- */
export const useAuth = () => {
  return useContext(AuthContext);
};
