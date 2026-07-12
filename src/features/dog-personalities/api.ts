import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { unwrapApiData } from '@/shared/api/types';

import type { DogPersonality } from './types';

export const getDogPersonalities = async (): Promise<DogPersonality[]> => {
  const { data } = await apiClient.get<
    DogPersonality[] | { data: DogPersonality[] }
  >(ENDPOINTS.dogPersonalities.list);

  return unwrapApiData(data);
};
