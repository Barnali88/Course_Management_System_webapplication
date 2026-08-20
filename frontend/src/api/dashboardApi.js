// src/api/dashboardApi.js
import axiosInstance from "./axiosInstance";

export const apiGetDashboardStats = async () => {
  const res = await axiosInstance.get("/dashboard/stats");
  return res.data;
};
