import axiosInstance from './axiosInstance';

export const apiCreatePayment = async (payload) => {
  const res = await axiosInstance.post('/payments/', payload);
  return res.data;
};

export const apiGetPayments = async () => {
  const res = await axiosInstance.get('/payments/');
  return res.data;
};

export const apiGetPayment = async (paymentId) => {
  const res = await axiosInstance.get(`/payments/${paymentId}`);
  return res.data;
};