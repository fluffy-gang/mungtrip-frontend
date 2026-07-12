import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { unwrapApiData } from '@/shared/api/types';

import type {
  Agreement,
  GetAgreementsResponse,
  SaveAgreementsRequest,
  SaveAgreementsResponse,
} from './types';

const OPTIONAL_AGREEMENT_TYPES = ['MARKETING'] as const;

export const getMyAgreements = async (): Promise<GetAgreementsResponse> => {
  const { data } = await apiClient.get<
    GetAgreementsResponse | { data: GetAgreementsResponse }
  >(ENDPOINTS.agreements.me);

  return unwrapApiData(data);
};

export const saveMyAgreements = async (
  body: SaveAgreementsRequest,
): Promise<SaveAgreementsResponse> => {
  const { data } = await apiClient.post<
    SaveAgreementsResponse | { data: SaveAgreementsResponse }
  >(ENDPOINTS.agreements.me, body);

  return unwrapApiData(data);
};

export const hasRequiredAgreements = (agreements: Agreement[]): boolean => {
  return agreements.every(
    agreement =>
      OPTIONAL_AGREEMENT_TYPES.includes(agreement.type as 'MARKETING') ||
      agreement.agreed,
  );
};
