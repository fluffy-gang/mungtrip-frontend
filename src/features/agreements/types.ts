export type AgreementType =
  | 'SERVICE'
  | 'ELECTRONIC_FINANCE'
  | 'PRIVACY'
  | 'LOCATION'
  | 'TELECOM'
  | 'MARKETING';

export type Agreement = {
  type: AgreementType;
  agreed: boolean;
};

export type GetAgreementsResponse = {
  agreements: Agreement[];
};

export type SaveAgreementsRequest = {
  agreements: {
    type: AgreementType;
    agreed: boolean;
  }[];
};

export type SaveAgreementsResponse = GetAgreementsResponse;
