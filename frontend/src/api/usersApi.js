import axiosInstance from './axiosInstance';

export const apiGetMe = async () => (await axiosInstance.get('/users/me')).data;
export const apiGetUsers = async () => (await axiosInstance.get('/users')).data;
export const apiCreateUser = async (data) => (await axiosInstance.post('/users', data)).data;
export const apiUpdateUser = async (id, data) => (await axiosInstance.patch(`/users/${id}`, data)).data;
export const apiUploadProfileImage = async (userId, file) => {
  const form = new FormData();
  form.append('file', file);
  return (await axiosInstance.post(`/users/${userId}/upload-image`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
