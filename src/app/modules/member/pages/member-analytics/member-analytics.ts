import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { ClaimStatus } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-member-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './member-analytics.html',
  styleUrl: './member-analytics.css',
})
export class MemberAnalytics {
  private policyService = inject(Policy);
  private claimService = inject(Claim);
  private authService = inject(Auth);

  userId = this.authService.getUserId();

  // Fetch user's policies
  myPolicies = toSignal(
    this.policyService.getMemberPolicies(this.userId!).pipe(catchError(() => of([])))
  );

  // Fetch user's claims
  myClaims = toSignal(
    this.claimService.getMemberClaims(this.userId!).pipe(catchError(() => of([])))
  );

  // Computed analytics
  totalPolicies = computed(() => this.myPolicies()?.length || 0);
  
  activePolicies = computed(() => 
    this.myPolicies()?.filter(p => new Date(p.endDate) > new Date()).length || 0
  );
  
  totalClaims = computed(() => this.myClaims()?.length || 0);
  
  pendingClaims = computed(() => 
    this.myClaims()?.filter(c => c.status === ClaimStatus.SUBMITTED || c.status === ClaimStatus.IN_REVIEW).length || 0
  );
  
  approvedClaims = computed(() => 
    this.myClaims()?.filter(c => c.status === ClaimStatus.APPROVED).length || 0
  );
  
  rejectedClaims = computed(() => 
    this.myClaims()?.filter(c => c.status === ClaimStatus.REJECTED).length || 0
  );
  
  totalClaimedAmount = computed(() => 
    this.myClaims()?.reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  approvedAmount = computed(() => 
    this.myClaims()
      ?.filter(c => c.status === ClaimStatus.APPROVED)
      .reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  totalPremiumPaid = computed(() => 
    this.myPolicies()?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0
  );

  savingsRatio = computed(() => {
    const paid = this.totalPremiumPaid();
    const received = this.approvedAmount();
    return paid > 0 ? Math.round((received / paid) * 100) : 0;
  });
}
