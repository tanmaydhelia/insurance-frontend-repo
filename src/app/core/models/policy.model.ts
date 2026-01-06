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
  plan?: IInsurancePlan;
  insurancePlan?: IInsurancePlan;
  remainingSumInsured?: number;  // Remaining coverage after claims
  coverageAmount?: number;       // Total coverage amount from plan
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