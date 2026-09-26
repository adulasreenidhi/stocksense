import axios from 'axios';
import { store } from '../app/store.js';
import { logout, setAccessToken } from '../features/auth/authSlice.js';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // send refresh cookie
});

axiosClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthRoute =
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/signup');

    if (error.response?.status === 401 && !original?._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        store.dispatch(setAccessToken(data.data.accessToken));
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosClient(original);
      } catch {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
