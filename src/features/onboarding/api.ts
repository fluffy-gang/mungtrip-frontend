import { getAccessToken } from '@/features/auth/storage';
import {
  getMyAgreements,
  hasRequiredAgreements,
} from '@/features/agreements/api';
import { getMyDogs } from '@/features/dogs/api';
import { isUnauthorizedApiError } from '@/shared/api/error';

import type { OnboardingStatus } from './types';

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  const token = await getAccessToken();

  if (!token) {
    return 'needs-login';
  }

  try {
    const agreementsResponse = await getMyAgreements();

    if (!hasRequiredAgreements(agreementsResponse.agreements)) {
      return 'needs-agreements';
    }

    const dogs = await getMyDogs();

    if (dogs.length === 0) {
      return 'needs-dog';
    }

    return 'completed';
  } catch (error) {
    if (isUnauthorizedApiError(error)) {
      return 'needs-login';
    }

    throw error;
  }
};
