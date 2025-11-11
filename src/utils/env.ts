export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000',
  streamPath: import.meta.env.VITE_STREAM_PATH || '/stream.mjpeg',
} as const;

export const getApiBaseUrl = (): string => {
  const stored = localStorage.getItem('apiBaseUrl');
  return stored || env.apiBaseUrl;
};

export const getStreamPath = (): string => {
  const stored = localStorage.getItem('streamPath');
  return stored || env.streamPath;
};

export const setApiConfig = (baseUrl: string, streamPath: string) => {
  localStorage.setItem('apiBaseUrl', baseUrl);
  localStorage.setItem('streamPath', streamPath);
};
