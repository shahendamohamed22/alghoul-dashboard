import axios from 'axios';
import baseUrl from './api';

const apiClient = axios.create({ baseURL: baseUrl });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;