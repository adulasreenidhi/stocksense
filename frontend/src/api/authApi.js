import axiosClient from './axiosClient.js';

export const authApi = {
  signup: (payload) => axiosClient.post('/auth/signup', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  refresh: () => axiosClient.post('/auth/refresh'),
  logout: () => axiosClient.post('/auth/logout'),
  requestOtp: (email) => axiosClient.post('/auth/otp/request', { email }),
  verifyOtp: (email, otp) => axiosClient.post('/auth/otp/verify', { email, otp }),
  resetPassword: (resetToken, newPassword) =>
    axiosClient.post('/auth/password/reset', { resetToken, newPassword }),
};
