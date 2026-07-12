import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type { DogPersonality } from './types';

export const getDogPersonalities = async (): Promise<DogPersonality[]> => {
  const { data } = await apiClient.get<DogPersonality[]>(
    ENDPOINTS.dogPersonalities.list,
  );

  return data;
};
