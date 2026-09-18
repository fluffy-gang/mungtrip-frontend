export type DogSize = 'S' | 'M' | 'L';
export type DogListSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface DogBreed {
  breedId: number;
  name: string;
}

export interface DogPersonalitySummary {
  id: number;
  name: string;
}

export interface Dog {
  breed: string;
  dogId: number;
  profileImageUrl: string;
  isDangerousDog: boolean;
  isNeutered?: boolean;
  name: string;
  personalities: DogPersonalitySummary[];
  size: DogSize;
  weight?: number;
}

export interface ProfileDog {
  breed: DogBreed;
  dogId: number;
  imageUrl: string;
  isDangerousDog: boolean;
  isNeutered?: boolean;
  name: string;
  personalities: DogPersonalitySummary[];
  size: DogListSize;
  weight?: number;
}

export interface GetMyDogsResponse {
  dogs: Dog[];
}

export interface DogMutationResponse {
  dogId: number;
}

export interface CreateDogRequest {
  breed: string;
  isDangerousDog: boolean;
  isNeutered?: boolean;
  name: string;
  personalityIds: number[];
  profileImageUrl?: string;
  size: DogSize;
  weight?: number;
}

export type UpdateDogRequest = CreateDogRequest;
