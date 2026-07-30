import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || '';
const cleanUrl = rawUrl.replace(/\/$/, '');

const API = axios.create({
  baseURL: cleanUrl
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
