import axiosInstance from './axiosInstance';

export const apiCreateEnrollment = async (payload) => {
  const res = await axiosInstance.post('/enrollments/', payload);
  return res.data;
};

export const apiGetEnrollments = async () => {
  const res = await axiosInstance.get('/enrollments/');
  return res.data;
};

export const apiGetMyEnrollments = async () => {
  const res = await axiosInstance.get('/enrollments/me');
  return res.data;
};

export const apiGetEnrollment = async (enrollmentId) => {
  const res = await axiosInstance.get(`/enrollments/${enrollmentId}`);
  return res.data;
};

export const apiConfirmEnrollment = async (enrollmentId) => {
  const res = await axiosInstance.patch(`/enrollments/${enrollmentId}/confirm`);
  return res.data;
};

export const apiCancelEnrollment = async (enrollmentId) => {
  const res = await axiosInstance.patch(`/enrollments/${enrollmentId}/cancel`);
  return res.data;
};