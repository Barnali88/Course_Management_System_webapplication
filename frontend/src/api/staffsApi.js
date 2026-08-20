import axiosInstance from './axiosInstance';

export const apiGetStaffs = async () => {
  const res = await axiosInstance.get('/staffs/');
  return res.data;
};

export const apiCreateStaff = async (payload) => {
  const res = await axiosInstance.post('/staffs/', payload);
  return res.data;
};

export const apiDeleteStaff = async (staffId) => {
  const res = await axiosInstance.delete(`/staffs/${staffId}`);
  return res.data;
};