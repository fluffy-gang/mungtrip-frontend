export type DogSize = 'S' | 'M' | 'L';
export type DogListSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type DogBreed = {
  breedId: number;
  name: string;
};

export type DogPersonalitySummary = {
  id: number;
  name: string;
};

export type Dog = {
  dogId: number;
  name: string;
  breed: DogBreed;
  size: DogListSize;
  weight: number;
  personalities: DogPersonalitySummary[];
  isNeutered: boolean;
  isDangerousDog: boolean;
  imageUrl?: string;
};

export type GetMyDogsResponse = {
  dogs: Dog[];
};

export type DogMutationResponse = {
  dogId: number;
};

export type CreateDogRequest = {
  size: DogSize;
  breed: string;
  name: string;
  weight: number;
  personalityIds: number[];
  isNeutered: boolean;
  isDangerousDog: boolean;
  profileImageUrl?: string;
};

export type UpdateDogRequest = {
  size: DogSize;
  breedId: number;
  name: string;
  weight: number;
  personalityIds: number[];
  isNeutered: boolean;
  isDangerousDog: boolean;
  profileImageKey?: string;
};
