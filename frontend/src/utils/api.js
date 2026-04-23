import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getAuthConfig = (token, extraConfig = {}) => ({
  ...extraConfig,
  headers: {
    ...(extraConfig.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export const getUploadUrl = (filePath) => {
  if (!filePath) {
    return '';
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const origin = API_BASE_URL.replace(/\/api$/, '');
  return `${origin}${filePath}`;
};
