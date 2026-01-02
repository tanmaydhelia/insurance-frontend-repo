import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable } from 'rxjs';
import { IInsurancePlan, IPlanRequest, IPolicy, IPolicyEnrollmentRequest } from '../../models/policy.model';

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

  getMemberPolicies(userId: number): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies/member/${userId}`);
  }

  getAgentPolicies(agentId: number): Observable<IPolicy[]> {
    return this.api.get<IPolicy[]>(`${this.BASE_PATH}/policies/agent/${agentId}`);
  }

  getPolicyById(id: number): Observable<IPolicy> {
    return this.api.get<IPolicy>(`${this.BASE_PATH}/policies/${id}`);
  }
}
