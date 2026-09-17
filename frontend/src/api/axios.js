import axios from 'axios';

const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const { hostname, protocol } = window.location;

  if (hostname.includes('app.github.dev')) {
    const codespacePrefix = hostname.replace(/-\d+\.app\.github\.dev$/, '');
    return `${protocol}//${codespacePrefix}-5000.app.github.dev`;
  }

  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || getDefaultApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tiffintrack-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
