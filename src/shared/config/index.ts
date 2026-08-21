export * from './access-rules';
export * from './pagination';
export * from './routes';

export const env = {
  apiBaseUrl: import.meta.env.VITE_APP_API_BASE ?? '',
} as const;
