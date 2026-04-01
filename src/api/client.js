import axios from 'axios';

/**
 * Dev: Vite proxies /api → backend (see vite.config.js).
 * Prod: set VITE_API_URL to full API URL if API is on another host.
 */
function resolveBaseURL() {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (env && !(import.meta.env.DEV && env.includes('localhost:5000'))) {
    return env;
  }
  if (import.meta.env.DEV) return '/api';
  if (env) return env;
  return 'https://drserver.vercel.app/api';
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;
