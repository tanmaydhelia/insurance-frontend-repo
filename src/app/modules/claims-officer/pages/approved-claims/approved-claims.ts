import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Claim } from '../../../../core/services/claim/claim';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { ClaimStatus, IClaim } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-approved-claims',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './approved-claims.html',
  styleUrl: './approved-claims.css',
})
export class ApprovedClaims {
  private claimService = inject(Claim);
  private authService = inject(Auth);

  private get officerId(): number {
    return this.authService.getUserId() || 0;
  }

  // Fetch officer's processed claims and filter for approved
  allProcessedClaims = toSignal(
    of(this.officerId).pipe(
      switchMap(id => this.claimService.getProcessedClaimsByOfficer(id)),
      catchError(() => of([]))
    )
  );

  approvedClaims = computed(() => 
    this.allProcessedClaims()?.filter(c => c.status === ClaimStatus.APPROVED) || []
  );

  isLoading = computed(() => this.allProcessedClaims() === undefined);

  // Stats
  totalApproved = computed(() => this.approvedClaims().length);
  
  totalAmount = computed(() => 
    this.approvedClaims().reduce((sum, c) => sum + (c.claimAmount || 0), 0)
  );
  
  avgAmount = computed(() => {
    const count = this.totalApproved();
    return count > 0 ? Math.round(this.totalAmount() / count) : 0;
  });

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
