import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://18.139.0.192/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token when user logs in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
