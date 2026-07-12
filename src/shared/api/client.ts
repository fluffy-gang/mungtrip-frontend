import { create } from 'axios';

import { toApiError } from '@/shared/api/error';
import { ENV } from '@/shared/config/env';

export const apiClient = create({
  baseURL: ENV.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => Promise.reject(toApiError(error)),
);
