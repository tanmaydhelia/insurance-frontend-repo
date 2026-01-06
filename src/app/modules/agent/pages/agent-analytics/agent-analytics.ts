import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { Auth } from '../../../../core/services/auth/auth';
import { IPolicy } from '../../../../core/models/policy.model';
import { IClaim, ClaimStatus } from '../../../../core/models/claim.model';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-agent-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './agent-analytics.html',
  styleUrl: './agent-analytics.css',
})
export class AgentAnalytics {
  private policyService = inject(Policy);
  private claimService = inject(Claim);
  private auth = inject(Auth);

  // Loading state
  isLoading = signal(true);

  // Raw data
  policies = signal<IPolicy[]>([]);
  claims = signal<IClaim[]>([]);

  // Policy Analytics
  totalPolicies = computed(() => this.policies().length);
  
  totalPremiumCollected = computed(() => 
    this.policies().reduce((sum, p) => sum + (p.premium || 0), 0)
  );
  
  totalCoverageProvided = computed(() => 
    this.policies().reduce((sum, p) => sum + (p.plan?.coverageAmount || p.insurancePlan?.coverageAmount || 0), 0)
  );

  activePolicies = computed(() => 
    this.policies().filter(p => p.status === 'ACTIVE').length
  );

  // Claims Analytics
  totalClaims = computed(() => this.claims().length);

  claimsByStatus = computed(() => {
    const claims = this.claims();
    return {
      submitted: claims.filter(c => c.status === ClaimStatus.SUBMITTED).length,
      inReview: claims.filter(c => c.status === ClaimStatus.IN_REVIEW).length,
      approved: claims.filter(c => c.status === ClaimStatus.APPROVED).length,
      rejected: claims.filter(c => c.status === ClaimStatus.REJECTED).length,
    };
  });

  totalClaimedAmount = computed(() => 
    this.claims().reduce((sum, c) => sum + (c.claimAmount || 0), 0)
  );

  totalApprovedAmount = computed(() => 
    this.claims()
      .filter(c => c.status === ClaimStatus.APPROVED)
      .reduce((sum, c) => sum + (c.approvedAmount || c.claimAmount || 0), 0)
  );

  claimApprovalRate = computed(() => {
    const total = this.totalClaims();
    if (total === 0) return 0;
    const approved = this.claimsByStatus().approved;
    return (approved / total) * 100;
  });

  avgClaimAmount = computed(() => {
    const total = this.totalClaims();
    if (total === 0) return 0;
    return this.totalClaimedAmount() / total;
  });

  // Recent activity
  recentPolicies = computed(() => 
    [...this.policies()]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5)
  );

  recentClaims = computed(() => 
    [...this.claims()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  );

  constructor() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    this.auth.user$.pipe(
      switchMap(user => {
        if (!user?.id) return of({ policies: [], claims: [] });
        return forkJoin({
          policies: this.policyService.getAgentPolicies(user.id),
          claims: this.claimService.getAgentClaims(user.id)
        });
      })
    ).subscribe({
      next: (data) => {
        this.policies.set(data.policies || []);
        this.claims.set(data.claims || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case ClaimStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ClaimStatus.IN_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
}
