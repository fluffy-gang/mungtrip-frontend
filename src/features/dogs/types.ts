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
  dogId: number;
  name: string;
  breed: DogBreed;
  size: DogListSize;
  weight: number;
  personalities: DogPersonalitySummary[];
  isNeutered: boolean;
  isDangerousDog: boolean;
  imageUrl?: string;
}

export interface GetMyDogsResponse {
  dogs: Dog[];
}

export interface DogMutationResponse {
  dogId: number;
}

export interface CreateDogRequest {
  size: DogSize;
  breed: string;
  name: string;
  weight: number;
  personalityIds: number[];
  isNeutered: boolean;
  isDangerousDog: boolean;
  profileImageUrl?: string;
}

export interface UpdateDogRequest {
  size: DogSize;
  breedId: number;
  name: string;
  weight: number;
  personalityIds: number[];
  isNeutered: boolean;
  isDangerousDog: boolean;
  profileImageKey?: string;
}
