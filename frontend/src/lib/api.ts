import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
});

// Inject auth token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cp_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session?.accessToken) {
          config.headers['Authorization'] = `Bearer ${session.accessToken}`;
        }
      } catch {}
    }
  }
  return config;
});

export default api;
