import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable } from 'rxjs';
import { 
  IInsurancePlan, 
  IPlanRequest, 
  IPolicy, 
  IPolicyEnrollmentRequest,
  IRenewalOrderResponse,
  IRenewalConfirmRequest
} from '../../models/policy.model';

@Injectable({
  providedIn: 'root',
})
export class Policy {
  private BASE_PATH = '/policy';

  constructor(private api: Api) {}

  getAllPlans(): Observable<IInsurancePlan[]> {
    return this.api.get<IInsurancePlan[]>(`${this.BASE_PATH}/plans`);
  }

  createPlan(plan: IPlanRequest): Observable<IInsurancePlan> {
    return this.api.post<IInsurancePlan>(`${this.BASE_PATH}/plans`, plan);
  }

  // --- Policies ---
  enrollPolicy(request: IPolicyEnrollmentRequest): Observable<IPolicy> {
    return this.api.post<IPolicy>(`${this.BASE_PATH}/policies/enroll`, request);
  }

  getAllPolicies(): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies`);
  }

  getMemberPolicies(userId: number): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies/member/${userId}`);
  }

  getAgentPolicies(agentId: number): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies/agent/${agentId}`);
  }

  getPolicyById(id: number): Observable<IPolicy> {
    return this.api.get<IPolicy>(`${this.BASE_PATH}/policies/${id}`);
  }

  /**
   * Get policy by policy number (for providers)
   */
  getPolicyByNumber(policyNumber: string): Observable<IPolicy> {
    return this.api.get<IPolicy>(`${this.BASE_PATH}/policies/number/${policyNumber}`);
  }

  // --- Policy Renewal ---
  
  /**
   * Agent sends a renewal reminder to a member
   */
  sendRenewalReminder(policyId: number, agentId: number): Observable<IPolicy> {
    return this.api.post<IPolicy>(`${this.BASE_PATH}/policies/${policyId}/renewal-reminder`, { agentId });
  }

  /**
   * Member initiates policy renewal (creates Razorpay order)
   */
  initiateRenewal(policyId: number): Observable<IRenewalOrderResponse> {
    return this.api.post<IRenewalOrderResponse>(`${this.BASE_PATH}/policies/${policyId}/renew`, {});
  }

  /**
   * Confirm renewal after successful payment
   */
  confirmRenewal(policyId: number, request: IRenewalConfirmRequest): Observable<IPolicy> {
    return this.api.post<IPolicy>(`${this.BASE_PATH}/policies/${policyId}/renew/confirm`, request);
  }

  /**
   * Get all expiring policies (for admin view)
   */
  getExpiringPolicies(days: number = 30): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies/expiring?days=${days}`);
  }

  /**
   * Get expiring policies for a specific agent
   */
  getExpiringPoliciesByAgent(agentId: number, days: number = 30): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies/expiring/agent/${agentId}?days=${days}`);
  }
}
