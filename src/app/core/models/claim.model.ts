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

export interface Claim {
  id: number;
  policyId: number;
  hospitalId?: number;
  diagnosis: string;
  claimAmount: number;
  status: ClaimStatus;
  submissionSource: SubmissionSource;
  rejectionReason?: string;
  date: string;
}

export interface ClaimRequest {
  policyId: number;
  hospitalId?: number; 
  diagnosis: string;
  claimAmount: number;
  submissionSource: SubmissionSource;
}

export interface ClaimStatusUpdate {
  status: ClaimStatus;
  rejectionReason?: string;
}