import axiosClient from './axiosClient.js';

export const productsApi = {
  list: (params) => axiosClient.get('/products', { params }),
  get: (id) => axiosClient.get(`/products/${id}`),
  create: (payload) => axiosClient.post('/products', payload),
  update: (id, payload) => axiosClient.put(`/products/${id}`, payload),
  remove: (id) => axiosClient.delete(`/products/${id}`),
  listCategories: () => axiosClient.get('/products/categories'),
};
