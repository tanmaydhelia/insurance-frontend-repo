export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
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
  plan?: IInsurancePlan; // Backend returns 'plan', not 'insurancePlan'
  insurancePlan?: IInsurancePlan; // Keep for backward compatibility
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