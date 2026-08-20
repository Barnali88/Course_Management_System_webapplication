import axiosInstance from './axiosInstance';

export const apiGetStudents = async () => {
  const res = await axiosInstance.get('/students/');
  return res.data;
};

export const apiCreateStudent = async (payload) => {
  const res = await axiosInstance.post('/students/', payload);
  return res.data;
};

export const apiDeleteStudent = async (studentId) => {
  const res = await axiosInstance.delete(`/students/${studentId}`);
  return res.data;
};

export const apiGetMyStudentProfile = async () => {
  const res = await axiosInstance.get('/students/me');
  return res.data;
};

export const apiCreateMyStudentProfile = async (payload) => {
  const res = await axiosInstance.post('/students/me', payload);
  return res.data;
};

export const apiUpdateMyStudentProfile = async (payload) => {
  const res = await axiosInstance.put('/students/me', payload);
  return res.data;
};