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

export interface AgreementDefinition {
  name: string;
  required: boolean;
  type: AgreementType;
}

export interface GetAgreementDefinitionsResponse {
  types: AgreementDefinition[];
}

export interface GetAgreementsResponse {
  agreements: Agreement[];
  allRequiredAgreed: boolean;
}

export interface SaveAgreementsRequest {
  agreements: Agreement[];
}

export type SaveAgreementsResponse = void;
