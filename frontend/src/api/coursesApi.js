import axiosInstance from "./axiosInstance";

export const apiGetCourses = async () => {
  const res = await axiosInstance.get("/courses");
  return res.data;
};

export const apiGetCourse = async (id) => {
  const res = await axiosInstance.get(`/courses/${id}`);
  return res.data;
};

export const apiCreateCourse = async (data) => {
  const res = await axiosInstance.post("/courses", data);
  return res.data;
};

export const apiUpdateCourse = async (id, data) => {
  const res = await axiosInstance.put(`/courses/${id}`, data);
  return res.data;
};

export const apiDeleteCourse = async (id) => {
  const res = await axiosInstance.delete(`/courses/${id}`);
  return res.data;
};

export const apiUploadThumbnail = async (courseId, file) => {
  const form = new FormData();
  form.append("file", file);

  const res = await axiosInstance.post(`/courses/${courseId}/upload-thumbnail`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const apiCreateCourseMaterial = async (courseId, title, file) => {
  const form = new FormData();
  form.append("title", title);
  form.append("file", file);

  const res = await axiosInstance.post(`/courses/${courseId}/materials`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const apiUpdateCourseMaterial = async (courseId, materialId, title) => {
  const form = new FormData();
  form.append("title", title);

  const res = await axiosInstance.put(`/courses/${courseId}/materials/${materialId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const apiDeleteCourseMaterial = async (courseId, materialId) => {
  const res = await axiosInstance.delete(`/courses/${courseId}/materials/${materialId}`);
  return res.data;
};

export const apiGetProtectedMaterial = async (courseId, materialId) => {
  const res = await axiosInstance.get(`/courses/${courseId}/materials/${materialId}/access`);
  return res.data;
};