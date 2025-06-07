import axios from "axios";

// Use API URL from environment or fallback to relative path
const BASE_URL =
  process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || "/api";

console.log("Initializing API with base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    console.log("Sending request to:", config.url); // Debug-Log
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: error.config,
      });
    } else if (error.request) {
      console.error("API Error Request:", error.request);
    } else {
      console.error("API Error Setup:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
