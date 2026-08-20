// src/api/authApi.js
import axiosInstance from "./axiosInstance";

export const apiLogin = async (email, password) => {
  const res = await axiosInstance.post("/auth/login", { email, password });
  return res.data; // { access_token, refresh_token, token_type }
};

export const apiRefreshToken = async (refreshToken) => {
  const res = await axiosInstance.post("/auth/refresh", { refresh_token: refreshToken });
  return res.data;
};
