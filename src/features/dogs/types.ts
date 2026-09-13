export type DogSize = 'S' | 'M' | 'L';

export interface DogPersonalitySummary {
  id: number;
  name: string;
}

export interface Dog {
  breed: string;
  dogId: number;
  isDangerousDog?: boolean;
  isNeutered?: boolean;
  name: string;
  personalities: DogPersonalitySummary[];
  profileImageUrl: string;
  size: DogSize;
  weight?: number;
}

export interface GetMyDogsResponse {
  dogs: Dog[];
}

export interface DogMutationResponse {
  dogId: number;
}

export interface DogSaveRequest {
  breed: string;
  isDangerousDog?: boolean;
  isNeutered?: boolean;
  name: string;
  personalityIds: number[];
  profileImageUrl: string;
  size: DogSize;
  weight?: number;
}

export type CreateDogRequest = DogSaveRequest;
export type UpdateDogRequest = DogSaveRequest;
