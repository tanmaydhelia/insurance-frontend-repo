import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Claim } from '../../../../core/services/claim/claim';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { ClaimStatus, IClaim } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-claims-officer-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './claims-officer-analytics.html',
  styleUrl: './claims-officer-analytics.css',
})
export class ClaimsOfficerAnalytics {
  private claimService = inject(Claim);
  private authService = inject(Auth);

  private get officerId(): number {
    return this.authService.getUserId() || 0;
  }

  // Fetch officer's processed claims (APPROVED + REJECTED)
  processedClaims = toSignal(
    of(this.officerId).pipe(
      switchMap(id => this.claimService.getProcessedClaimsByOfficer(id)),
      catchError(() => of([]))
    )
  );

  // Fetch officer's in-review claims
  inReviewClaims = toSignal(
    of(this.officerId).pipe(
      switchMap(id => this.claimService.getMyInReviewClaims(id)),
      catchError(() => of([]))
    )
  );

  // Basic Stats
  totalProcessed = computed(() => this.processedClaims()?.length || 0);
  
  approvedClaims = computed(() => 
    this.processedClaims()?.filter(c => c.status === ClaimStatus.APPROVED) || []
  );
  
  rejectedClaims = computed(() => 
    this.processedClaims()?.filter(c => c.status === ClaimStatus.REJECTED) || []
  );
  
  approvedCount = computed(() => this.approvedClaims().length);
  rejectedCount = computed(() => this.rejectedClaims().length);
  inReviewCount = computed(() => this.inReviewClaims()?.length || 0);

  // Financial Stats
  totalApprovedAmount = computed(() => 
    this.approvedClaims().reduce((sum, c) => sum + (c.claimAmount || 0), 0)
  );
  
  totalRejectedAmount = computed(() => 
    this.rejectedClaims().reduce((sum, c) => sum + (c.claimAmount || 0), 0)
  );
  
  totalProcessedAmount = computed(() => 
    this.totalApprovedAmount() + this.totalRejectedAmount()
  );
  
  avgApprovedAmount = computed(() => {
    const count = this.approvedCount();
    return count > 0 ? Math.round(this.totalApprovedAmount() / count) : 0;
  });
  
  avgRejectedAmount = computed(() => {
    const count = this.rejectedCount();
    return count > 0 ? Math.round(this.totalRejectedAmount() / count) : 0;
  });

  // Rates
  approvalRate = computed(() => {
    const total = this.totalProcessed();
    return total > 0 ? Math.round((this.approvedCount() / total) * 100) : 0;
  });
  
  rejectionRate = computed(() => {
    const total = this.totalProcessed();
    return total > 0 ? Math.round((this.rejectedCount() / total) * 100) : 0;
  });

  // Donut Chart Data
  donutChartData = computed(() => {
    const total = this.totalProcessed();
    if (total === 0) return [];
    
    return [
      { 
        label: 'Approved', 
        value: this.approvedCount(), 
        percentage: (this.approvedCount() / total) * 100,
        color: '#22c55e',
        offset: 0
      },
      { 
        label: 'Rejected', 
        value: this.rejectedCount(), 
        percentage: (this.rejectedCount() / total) * 100,
        color: '#ef4444',
        offset: (this.approvedCount() / total) * 100
      }
    ];
  });

  // Bar Chart Data - Financial
  barChartData = computed(() => {
    const maxAmount = Math.max(
      this.totalApprovedAmount(),
      this.totalRejectedAmount(),
      1
    );
    
    return [
      {
        label: 'Approved',
        value: this.totalApprovedAmount(),
        percentage: (this.totalApprovedAmount() / maxAmount) * 100,
        color: 'bg-green-500',
        textColor: 'text-green-600'
      },
      {
        label: 'Rejected',
        value: this.totalRejectedAmount(),
        percentage: (this.totalRejectedAmount() / maxAmount) * 100,
        color: 'bg-red-500',
        textColor: 'text-red-600'
      }
    ];
  });

  // Monthly Trend Data (last 6 months)
  monthlyTrend = computed(() => {
    const claims = this.processedClaims() || [];
    const months: { [key: string]: { approved: number; rejected: number; amount: number } } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      months[key] = { approved: 0, rejected: 0, amount: 0 };
    }
    
    // Populate with claim data
    claims.forEach(claim => {
      if (claim.processedDate) {
        const date = new Date(claim.processedDate);
        const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (months[key]) {
          if (claim.status === ClaimStatus.APPROVED) {
            months[key].approved++;
            months[key].amount += claim.claimAmount || 0;
          } else if (claim.status === ClaimStatus.REJECTED) {
            months[key].rejected++;
          }
        }
      }
    });
    
    const entries = Object.entries(months);
    const maxCount = Math.max(...entries.map(([, v]) => v.approved + v.rejected), 1);
    
    return entries.map(([month, data]) => ({
      month,
      approved: data.approved,
      rejected: data.rejected,
      total: data.approved + data.rejected,
      amount: data.amount,
      approvedHeight: (data.approved / maxCount) * 100,
      rejectedHeight: (data.rejected / maxCount) * 100
    }));
  });

  // Recent Claims (last 5)
  recentClaims = computed(() => {
    const claims = [...(this.processedClaims() || [])];
    return claims
      .sort((a, b) => new Date(b.processedDate || b.date).getTime() - new Date(a.processedDate || a.date).getTime())
      .slice(0, 5);
  });

  // Helper functions for donut chart
  getStrokeDasharray(percentage: number): string {
    const circumference = 2 * Math.PI * 40;
    const filled = (percentage / 100) * circumference;
    return `${filled} ${circumference - filled}`;
  }

  getStrokeDashoffset(offset: number): number {
    const circumference = 2 * Math.PI * 40;
    return -(offset / 100) * circumference;
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Get status badge class
  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case ClaimStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
