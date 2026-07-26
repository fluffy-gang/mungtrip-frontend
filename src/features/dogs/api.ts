import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type {
  CreateDogRequest,
  Dog,
  DogMutationResponse,
  GetMyDogsResponse,
  UpdateDogRequest,
} from './types';

export const getMyDogs = async (): Promise<Dog[]> => {
  const { data } = await apiClient.get<GetMyDogsResponse>(ENDPOINTS.dogs.list);

  return data.dogs;
};

export const createDog = async (
  body: CreateDogRequest,
): Promise<DogMutationResponse> => {
  const { data } = await apiClient.post<DogMutationResponse>(
    ENDPOINTS.dogs.list,
    body,
  );

  return data;
};

export const updateDog = async (
  dogId: number,
  body: UpdateDogRequest,
): Promise<DogMutationResponse> => {
  const { data } = await apiClient.put<DogMutationResponse>(
    ENDPOINTS.dogs.detail(dogId),
    body,
  );

  return data;
};

export const deleteDog = async (dogId: number): Promise<void> => {
  await apiClient.delete(ENDPOINTS.dogs.detail(dogId));
};
