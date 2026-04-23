import React from 'react';

const getApiBaseUrl = () => {
  const value = import.meta.env.VITE_API_URL;

  if (value) {
    return value;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      return 'http://localhost:5000/api';
    }
  }

  return '/api';
};

const ApiDebugBadge = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isVercelPreview = hostname.endsWith('.vercel.app');

  if (!isLocalhost && !isVercelPreview) {
    return null;
  }

  const apiBaseUrl = getApiBaseUrl();

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[calc(100vw-2rem)] rounded-lg border border-amber-400/30 bg-black/80 px-3 py-2 text-xs text-amber-100 shadow-lg backdrop-blur">
      <span className="font-semibold text-amber-300">API</span>: {apiBaseUrl}
    </div>
  );
};

export default ApiDebugBadge;
