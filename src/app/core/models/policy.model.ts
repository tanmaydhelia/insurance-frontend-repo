export interface InsurancePlan {
  planId: number;
  planName: string;
  planType: string;
  basePremium: number;
  totalCoverage: number;
  description: string;
}

export interface Policy {
  id: number;
  userId: number;
  agentId?: number;
  insurancePlan: InsurancePlan;
  startDate: string; 
  endDate: string;
  premium: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface PolicyEnrollmentRequest {
  userId: number;
  planId: number;
  agentId?: number;
}