import axiosInstance from './axiosInstance';

export const apiGetTeachers = async () => {
  const res = await axiosInstance.get('/teachers/');
  return res.data;
};

export const apiGetTeacherByUserId = async (userId) => {
  const teachers = await apiGetTeachers();
  return (teachers || []).find((teacher) => String(teacher.user_id) === String(userId)) || null;
};

export const apiGetMyTeacherProfile = async () => {
  const res = await axiosInstance.get('/teachers/me');
  return res.data;
};

export const apiCreateMyTeacherProfile = async (payload) => {
  const res = await axiosInstance.post('/teachers/me', payload);
  return res.data;
};

export const apiUpdateMyTeacherProfile = async (payload) => {
  const res = await axiosInstance.put('/teachers/me', payload);
  return res.data;
};

export const apiCreateTeacher = async (payload) => {
  const res = await axiosInstance.post('/teachers/', payload);
  return res.data;
};

export const apiDeleteTeacher = async (teacherId) => {
  const res = await axiosInstance.delete(`/teachers/${teacherId}`);
  return res.data;
};