import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { IClaim } from '../../../../core/models/claim.model';
import { Policy } from '../../../../core/services/policy/policy';
import { IPolicy } from '../../../../core/models/policy.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-claim-history-table',
  standalone:true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './claim-history-table.html',
  styleUrl: './claim-history-table.css',
})
export class ClaimHistoryTable {
  private policyService = inject(Policy);
  
  claims = input.required<IClaim[]>();
  
  private policyMapSignal = signal<Map<number, IPolicy>>(new Map());
  
  private uniquePolicyIds = computed(() => {
    const claimsList = this.claims();
    if (!claimsList || claimsList.length === 0) {
      return [];
    }
    return [...new Set(claimsList.map(c => c.policyId))];
  });
  
  constructor() {
    effect(() => {
      const policyIds = this.uniquePolicyIds();
      const currentPolicyMap = this.policyMapSignal();
      
      if (policyIds.length === 0) {
        return;
      }
      
      const uncachedIds = policyIds.filter(id => !currentPolicyMap.has(id));
      
      if (uncachedIds.length > 0) {
        const requests = uncachedIds.map(id => 
          this.policyService.getPolicyById(id).pipe(
            catchError(err => {
              console.error(`Failed to load policy ${id}:`, err);
              return of(null);
            })
          )
        );
        
        forkJoin(requests).subscribe(policies => {
          const newMap = new Map(currentPolicyMap);
          
          policies.forEach((policy, index) => {
            if (policy) {
              newMap.set(uncachedIds[index], policy);
            }
          });
          
          this.policyMapSignal.set(newMap);
        });
      }
    });
  }
  
  getPolicyNumber(policyId: number): string {
    const policy = this.policyMapSignal().get(policyId);
    return policy?.policyNumber || `#${policyId}`;
  }
  
  getPlanName(policyId: number): string {
    const policy = this.policyMapSignal().get(policyId);
    return policy?.plan?.name || policy?.insurancePlan?.name || 'Loading...';
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUBMITTED': 
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}