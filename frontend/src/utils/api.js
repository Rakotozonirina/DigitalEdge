import axios from 'axios';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const ensureApiSuffix = (value) => (value.endsWith('/api') ? value : `${value}/api`);

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      return 'http://localhost:5000/api';
    }
  }

  return '/api';
};

const rawApiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_URL || getDefaultApiBaseUrl()
);

const API_BASE_URL = rawApiBaseUrl.startsWith('http')
  ? ensureApiSuffix(rawApiBaseUrl)
  : rawApiBaseUrl;

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
