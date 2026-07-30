import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || '';

// Fallback to relative path if VITE_API_URL is missing or set to old non-existent backend URL
if (!rawUrl || rawUrl.includes('dingal-billmanagement-with-ai-1.vercel.app')) {
  rawUrl = '';
}

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
