import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { unwrapApiData } from '@/shared/api/types';

import type {
  CreateDogRequest,
  Dog,
  DogMutationResponse,
  GetMyDogsResponse,
  UpdateDogRequest,
} from './types';

export const getMyDogs = async (): Promise<Dog[]> => {
  const { data } = await apiClient.get<
    GetMyDogsResponse | { data: GetMyDogsResponse }
  >(ENDPOINTS.dogs.list);

  return unwrapApiData(data).dogs;
};

export const createDog = async (
  body: CreateDogRequest,
): Promise<DogMutationResponse> => {
  const { data } = await apiClient.post<
    DogMutationResponse | { data: DogMutationResponse }
  >(
    ENDPOINTS.dogs.list,
    body,
  );

  return unwrapApiData(data);
};

export const updateDog = async (
  dogId: number,
  body: UpdateDogRequest,
): Promise<DogMutationResponse> => {
  const { data } = await apiClient.put<
    DogMutationResponse | { data: DogMutationResponse }
  >(
    ENDPOINTS.dogs.detail(dogId),
    body,
  );

  return unwrapApiData(data);
};

export const deleteDog = async (dogId: number): Promise<void> => {
  await apiClient.delete(ENDPOINTS.dogs.detail(dogId));
};
