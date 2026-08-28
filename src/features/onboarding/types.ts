import type { ImagePickerAsset } from 'expo-image-picker';

export type LoginProvider = 'GOOGLE' | 'KAKAO';
export type DogSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type DogSizeWire = 'S' | 'M' | 'L';
export type BreedInputMode = 'selected' | 'manual' | 'skipped';
export type AgreementType =
  | 'SERVICE'
  | 'ELECTRONIC_FINANCE'
  | 'PRIVACY'
  | 'LOCATION'
  | 'TELECOM'
  | 'MARKETING';

export interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

export interface AuthSession {
  accessToken: string;
  provider: LoginProvider;
  refreshToken: string;
  userId: number;
}

export interface LoginResponse extends AuthSession {
  isNewUser: boolean;
}

export interface AgreementDefinition {
  name: string;
  required: boolean;
  type: AgreementType;
  url: string;
}

export interface AgreementState {
  agreed: boolean;
  type: AgreementType;
}

export interface Personality {
  id: number;
  name: string;
}

export interface BreedDefinition {
  defaultSize: DogSize;
  id: string;
  isDangerousDog: boolean;
  name: string;
  sortOrder: number;
}

export interface Dog {
  breed: string;
  dogId: number;
  isDangerousDog?: boolean;
  isNeutered?: boolean;
  name: string;
  personalities: Personality[];
  profileImageUrl: string;
  size: DogSizeWire;
  weight?: number;
}

export interface DogSaveRequest {
  breed: string;
  isDangerousDog?: boolean;
  isNeutered?: boolean;
  name: string;
  personalityIds: number[];
  profileImageUrl: string;
  size: DogSizeWire;
  weight?: number;
}

export interface OnboardingDraft {
  breed: string;
  breedId?: string;
  breedInputMode: BreedInputMode;
  dogId?: number;
  isDangerousDog: boolean;
  isNeutered?: boolean;
  name: string;
  personalities: number[];
  profileImage?: ImagePickerAsset;
  profileImageUrl: string;
  size: DogSize;
  weight: string;
}

export type BootstrapStatus =
  | 'initializing'
  | 'bootstrapError'
  | 'anonymous'
  | 'agreements'
  | 'dogPrompt'
  | 'ready';

export type OnboardingStatus =
  | 'needs-login'
  | 'needs-agreements'
  | 'needs-dog'
  | 'completed';
