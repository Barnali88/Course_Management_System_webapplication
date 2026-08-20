// src/api/categoriesApi.js
import axiosInstance from "./axiosInstance";

export const apiGetCategories = async () => {
  const res = await axiosInstance.get("/categories");
  return res.data;
};

export const apiCreateCategory = async (data) => {
  const res = await axiosInstance.post("/categories", data);
  return res.data;
};

export const apiUpdateCategory = async (id, data) => {
  const res = await axiosInstance.put(`/categories/${id}`, data);
  return res.data;
};

export const apiDeleteCategory = async (id) => {
  const res = await axiosInstance.delete(`/categories/${id}`);
  return res.data;
};

export const apiUploadCategoryImage = async (categoryId, file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await axiosInstance.post(`/categories/${categoryId}/upload-image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
