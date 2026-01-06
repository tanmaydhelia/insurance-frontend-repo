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
  approvedAmount?: number;  // Amount approved by claims officer (may be less than claimed)
  approvalComments?: string; // Optional comments from claims officer during approval
  status: ClaimStatus;
  submissionSource: SubmissionSource;
  rejectionReason?: string;
  documentUrl?: string;
  date: string;
  processedBy?: string;     
  processedById?: number;      
  processedDate?: string;      
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
  approvedAmount?: number;  // Required when status is APPROVED
  approvalComments?: string; // Optional comments during approval
}