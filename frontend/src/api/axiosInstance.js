// src/api/axiosInstance.js
// Central Axios instance — automatically attaches Bearer token to every request
// and handles 401 errors globally.

import axios from "axios";
import { getAccessToken, clearTokens } from "../auth/tokenUtils";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// REQUEST interceptor — attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor — handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens();
      // Redirect to login without using React Router (we're outside component tree)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Helper for image URLs — converts backend upload path to full URL
export const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;

  const base = "http://127.0.0.1:8000";

  let cleaned = path.trim().replace(/\\/g, "/");

  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  cleaned = cleaned.replace(/^\/+/, "");

  if (
    cleaned.startsWith("uploads/") ||
    cleaned.startsWith("thumbnails/") ||
    cleaned.startsWith("materials/") ||
    cleaned.startsWith("profiles/")
  ) {
    if (!cleaned.startsWith("uploads/")) {
      cleaned = `uploads/${cleaned}`;
    }
    return `${base}/${cleaned}`;
  }

  return `${base}/uploads/${cleaned}`;
};
