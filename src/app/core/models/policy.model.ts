export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum RenewalStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IInsurancePlan {
  id?: number;
  name: string;
  description: string;
  basePremium: number;
  coverageAmount: number;
}

export interface IPolicy {
  id: number;
  policyNumber: string;
  startDate: string; 
  endDate: string;
  premium: number;
  status: PolicyStatus;
  userId: number;
  agentId?: number; 
  plan?: IInsurancePlan;
  insurancePlan?: IInsurancePlan;
  remainingSumInsured?: number;  // Remaining coverage after claims
  coverageAmount?: number;       // Total coverage amount from plan
  // User info (populated by backend for agent views)
  userName?: string;
  userEmail?: string;
  // Renewal-related fields
  daysRemaining?: number;
  renewable?: boolean;
  renewalRequestedAt?: string;
  lastRenewalAttemptAt?: string;
  lastRenewalStatus?: RenewalStatus;
}

export interface IPlanRequest {
  name: string;
  description: string;
  basePremium: number;
  coverageAmount: number;
}

export interface IPolicyEnrollmentRequest {
  userId: number;
  planId: number;
  agentId?: number;
}

// Renewal-related interfaces
export interface IRenewalRequest {
  agentId?: number;
}

export interface IRenewalOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  policyId: number;
  status: string;
}

export interface IRenewalConfirmRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  success: boolean;
}