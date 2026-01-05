export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SubmissionSource {
  MEMBER = 'MEMBER',
  PROVIDER = 'PROVIDER'
}

export interface IClaim {
  id: number;
  policyId: number;
  hospitalId?: number; 
  diagnosis: string;
  claimAmount: number;
  status: ClaimStatus;
  submissionSource: SubmissionSource;
  rejectionReason?: string;
  documentUrl?: string;
  date: string;
}


export interface IClaimRequest {
  policyId: number;
  diagnosis: string;
  claimAmount: number;
  hospitalId?: number;
  documentUrl?: string;
  submissionSource: SubmissionSource;
}

export interface IClaimStatusUpdate {
  status: ClaimStatus;
  rejectionReason?: string;
}