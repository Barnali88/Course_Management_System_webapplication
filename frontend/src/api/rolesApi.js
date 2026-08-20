// src/api/rolesApi.js
import axiosInstance from "./axiosInstance";

export const apiGetRoles = async () => {
  const res = await axiosInstance.get("/roles");
  return res.data;
};

export const apiCreateRole = async (data) => {
  const res = await axiosInstance.post("/roles", data);
  return res.data;
};

export const apiDeleteRole = async (id) => {
  const res = await axiosInstance.delete(`/roles/${id}`);
  return res.data;
};
