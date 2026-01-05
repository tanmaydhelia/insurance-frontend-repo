import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ClaimStatus } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.css',
})
export class AdminAnalytics {
  private policyService = inject(Policy);
  private claimService = inject(Claim);

  // Fetch all data
  plans = toSignal(this.policyService.getAllPlans().pipe(catchError(() => of([]))));
  allClaims = toSignal(this.claimService.getAllClaims().pipe(catchError(() => of([]))));

  // Computed analytics
  totalPlans = computed(() => this.plans()?.length || 0);
  
  totalClaims = computed(() => this.allClaims()?.length || 0);
  
  pendingClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.SUBMITTED || c.status === ClaimStatus.IN_REVIEW).length || 0
  );
  
  approvedClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.APPROVED).length || 0
  );
  
  rejectedClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.REJECTED).length || 0
  );
  
  inReviewClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.IN_REVIEW).length || 0
  );
  
  submittedClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.SUBMITTED).length || 0
  );
  
  totalClaimAmount = computed(() => 
    this.allClaims()?.reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  approvedClaimAmount = computed(() => 
    this.allClaims()
      ?.filter(c => c.status === ClaimStatus.APPROVED)
      .reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  pendingClaimAmount = computed(() => 
    this.allClaims()
      ?.filter(c => c.status === ClaimStatus.SUBMITTED || c.status === ClaimStatus.IN_REVIEW)
      .reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  rejectedClaimAmount = computed(() => 
    this.allClaims()
      ?.filter(c => c.status === ClaimStatus.REJECTED)
      .reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  approvalRate = computed(() => {
    const total = this.totalClaims();
    const approved = this.approvedClaims();
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  });
  
  rejectionRate = computed(() => {
    const total = this.totalClaims();
    const rejected = this.rejectedClaims();
    return total > 0 ? Math.round((rejected / total) * 100) : 0;
  });
  
  avgClaimAmount = computed(() => {
    const total = this.totalClaims();
    const amount = this.totalClaimAmount();
    return total > 0 ? Math.round(amount / total) : 0;
  });

  // Pie Chart Data - Claims by Status
  pieChartData = computed(() => {
    const total = this.totalClaims();
    if (total === 0) return [];
    
    return [
      { 
        label: 'Approved', 
        value: this.approvedClaims(), 
        percentage: (this.approvedClaims() / total) * 100,
        color: '#22c55e',
        offset: 0
      },
      { 
        label: 'Pending', 
        value: this.pendingClaims(), 
        percentage: (this.pendingClaims() / total) * 100,
        color: '#eab308',
        offset: (this.approvedClaims() / total) * 100
      },
      { 
        label: 'Rejected', 
        value: this.rejectedClaims(), 
        percentage: (this.rejectedClaims() / total) * 100,
        color: '#ef4444',
        offset: ((this.approvedClaims() + this.pendingClaims()) / total) * 100
      }
    ];
  });

  // Calculate stroke-dasharray for pie chart segments
  getStrokeDasharray(percentage: number): string {
    const circumference = 2 * Math.PI * 40; // radius = 40
    const filled = (percentage / 100) * circumference;
    return `${filled} ${circumference - filled}`;
  }

  getStrokeDashoffset(offset: number): number {
    const circumference = 2 * Math.PI * 40;
    return -(offset / 100) * circumference;
  }

  // Bar Chart Data - Financial Summary
  barChartData = computed(() => {
    const maxAmount = Math.max(
      this.approvedClaimAmount(),
      this.pendingClaimAmount(),
      this.rejectedClaimAmount(),
      1
    );
    
    return [
      {
        label: 'Approved',
        value: this.approvedClaimAmount(),
        percentage: (this.approvedClaimAmount() / maxAmount) * 100,
        color: 'bg-green-500',
        textColor: 'text-green-600'
      },
      {
        label: 'Pending',
        value: this.pendingClaimAmount(),
        percentage: (this.pendingClaimAmount() / maxAmount) * 100,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      },
      {
        label: 'Rejected',
        value: this.rejectedClaimAmount(),
        percentage: (this.rejectedClaimAmount() / maxAmount) * 100,
        color: 'bg-red-500',
        textColor: 'text-red-600'
      }
    ];
  });

  // Donut Chart center text
  centerValue = computed(() => this.totalClaims());
  centerLabel = 'Total Claims';

  // Progress ring calculations
  getProgressRingStyle(percentage: number): string {
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentage / 100) * circumference;
    return `${circumference} ${offset}`;
  }

  // Claims by Officer Analytics
  claimsByOfficer = computed(() => {
    const claims = this.allClaims() || [];
    const processedClaims = claims.filter(c => 
      (c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.REJECTED) && c.processedBy
    );
    
    // Group by officer
    const officerMap = new Map<string, { 
      name: string; 
      approved: number; 
      rejected: number; 
      total: number;
      approvedAmount: number;
      rejectedAmount: number;
    }>();
    
    processedClaims.forEach(claim => {
      const officerName = claim.processedBy || 'Unknown';
      const existing = officerMap.get(officerName) || { 
        name: officerName, 
        approved: 0, 
        rejected: 0, 
        total: 0,
        approvedAmount: 0,
        rejectedAmount: 0
      };
      
      if (claim.status === ClaimStatus.APPROVED) {
        existing.approved++;
        existing.approvedAmount += claim.claimAmount || 0;
      } else if (claim.status === ClaimStatus.REJECTED) {
        existing.rejected++;
        existing.rejectedAmount += claim.claimAmount || 0;
      }
      existing.total++;
      
      officerMap.set(officerName, existing);
    });
    
    // Convert to array and sort by total processed
    return Array.from(officerMap.values())
      .sort((a, b) => b.total - a.total);
  });

  // Top performing officer (highest approval rate with minimum 5 claims)
  topOfficer = computed(() => {
    const officers = this.claimsByOfficer();
    if (officers.length === 0) return null;
    
    const qualifiedOfficers = officers.filter(o => o.total >= 1);
    if (qualifiedOfficers.length === 0) return officers[0];
    
    return qualifiedOfficers.reduce((best, current) => {
      const bestRate = best.total > 0 ? (best.approved / best.total) * 100 : 0;
      const currentRate = current.total > 0 ? (current.approved / current.total) * 100 : 0;
      return currentRate > bestRate ? current : best;
    });
  });

  // Total officers who processed claims
  totalOfficers = computed(() => this.claimsByOfficer().length);

  // Calculate officer approval rate
  getOfficerApprovalRate(officer: { approved: number; total: number }): number {
    return officer.total > 0 ? Math.round((officer.approved / officer.total) * 100) : 0;
  }
}
