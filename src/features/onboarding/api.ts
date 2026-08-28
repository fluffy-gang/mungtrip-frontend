import {
  getAgreementDefinitions as getAgreementDefinitionsRequest,
  getMyAgreements,
  hasRequiredAgreements,
  saveMyAgreements,
} from '@/features/agreements/api';
import { getAccessToken } from '@/features/auth/storage';
import {
  createDog as createDogRequest,
  getMyDogs,
  updateDog as updateDogRequest,
} from '@/features/dogs/api';
import { getDogPersonalities } from '@/features/dog-personalities/api';
import { uploadFile } from '@/features/uploads/api';
import { isUnauthorizedApiError } from '@/shared/api/error';
import { AGREEMENT_URLS } from './constants';

import type { Agreement } from '@/features/agreements/types';
import type { DogSaveRequest } from '@/features/dogs/types';
import type {
  AgreementDefinition,
  AgreementState,
  DogSize,
  DogSizeWire,
  OnboardingStatus,
} from './types';

export async function getAgreementDefinitions(): Promise<AgreementDefinition[]> {
  const data = await getAgreementDefinitionsRequest();

  return data.types.map(item => ({
    ...item,
    url: AGREEMENT_URLS[item.type],
  }));
}

export function getUserAgreements() {
  return getMyAgreements();
}

export function saveAgreements(agreements: AgreementState[]) {
  return saveMyAgreements({ agreements: agreements as Agreement[] });
}

export async function getPersonalities() {
  const personalities = await getDogPersonalities();

  return personalities.map(personality => ({
    ...personality,
    name: personality.name.trim(),
  }));
}

export function getDogs() {
  return getMyDogs();
}

export function createDog(payload: DogSaveRequest) {
  return createDogRequest(payload);
}

export function updateDog(dogId: number, payload: DogSaveRequest) {
  return updateDogRequest(dogId, payload);
}

export function uploadDogProfile(uri: string, fileType = 'image/jpeg') {
  return uploadFile(uri, fileType, 'DOG_PROFILE_IMAGE');
}

export function toWireSize(size: DogSize): DogSizeWire {
  return { LARGE: 'L', MEDIUM: 'M', SMALL: 'S' }[size] as DogSizeWire;
}

export function fromWireSize(size: DogSizeWire): DogSize {
  return { L: 'LARGE', M: 'MEDIUM', S: 'SMALL' }[size] as DogSize;
}

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  const token = await getAccessToken();

  if (!token) return 'needs-login';

  try {
    const agreementsResponse = await getMyAgreements();

    if (!hasRequiredAgreements(agreementsResponse.agreements)) {
      return 'needs-agreements';
    }

    const dogs = await getMyDogs();

    return dogs.length === 0 ? 'needs-dog' : 'completed';
  } catch (error) {
    if (isUnauthorizedApiError(error)) return 'needs-login';

    throw error;
  }
};
