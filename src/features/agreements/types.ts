export type AgreementType =
  | 'SERVICE'
  | 'ELECTRONIC_FINANCE'
  | 'PRIVACY'
  | 'LOCATION'
  | 'TELECOM'
  | 'MARKETING';

export interface Agreement {
  type: AgreementType;
  agreed: boolean;
}

export interface GetAgreementsResponse {
  agreements: Agreement[];
}

export interface SaveAgreementsRequest {
  agreements: Agreement[];
}

export type SaveAgreementsResponse = GetAgreementsResponse;
