import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type {
  Agreement,
  GetAgreementDefinitionsResponse,
  GetAgreementsResponse,
  SaveAgreementsRequest,
  SaveAgreementsResponse,
} from './types';

const OPTIONAL_AGREEMENT_TYPES = ['MARKETING'] as const;

export const getAgreementDefinitions = async (): Promise<GetAgreementDefinitionsResponse> => {
  const { data } = await apiClient.get<GetAgreementDefinitionsResponse>(
    ENDPOINTS.agreements.list,
  );

  return data;
};

export const getMyAgreements = async (): Promise<GetAgreementsResponse> => {
  const { data } = await apiClient.get<GetAgreementsResponse>(
    ENDPOINTS.agreements.me,
  );

  return data;
};

export const saveMyAgreements = async (
  body: SaveAgreementsRequest,
): Promise<SaveAgreementsResponse> => {
  const { data } = await apiClient.post<SaveAgreementsResponse>(
    ENDPOINTS.agreements.me,
    body,
  );

  return data;
};

export const hasRequiredAgreements = (agreements: Agreement[]): boolean => {
  return agreements.every(
    agreement =>
      OPTIONAL_AGREEMENT_TYPES.includes(agreement.type as 'MARKETING') ||
      agreement.agreed,
  );
};
