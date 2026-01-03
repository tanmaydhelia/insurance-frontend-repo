import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { IClaim } from '../../../../core/models/claim.model';
import { Policy } from '../../../../core/services/policy/policy';
import { catchError, forkJoin, of } from 'rxjs';
import { IPolicy } from '../../../../core/models/policy.model';

@Component({
  selector: 'app-claims-table',
  standalone:true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './claims-table.html',
  styleUrl: './claims-table.css',
})
export class ClaimsTable {
  private policyService = inject(Policy);
  claims = input.required<IClaim[]>();
  onApprove = output<number>();
  onReject = output<number>();

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
      case 'APPROVED': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'REJECTED': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
      case 'IN_REVIEW': return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'; 
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  }
}
