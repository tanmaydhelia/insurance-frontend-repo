import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Claim } from '../../../../core/services/claim/claim';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { ClaimStatus, IClaim } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-rejected-claims',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rejected-claims.html',
  styleUrl: './rejected-claims.css',
})
export class RejectedClaims {
  private claimService = inject(Claim);
  private authService = inject(Auth);

  private get officerId(): number {
    return this.authService.getUserId() || 0;
  }

  // Fetch officer's processed claims and filter for rejected
  allProcessedClaims = toSignal(
    of(this.officerId).pipe(
      switchMap(id => this.claimService.getProcessedClaimsByOfficer(id)),
      catchError(() => of([]))
    )
  );

  rejectedClaims = computed(() => 
    this.allProcessedClaims()?.filter(c => c.status === ClaimStatus.REJECTED) || []
  );

  isLoading = computed(() => this.allProcessedClaims() === undefined);

  // Stats
  totalRejected = computed(() => this.rejectedClaims().length);
  
  totalAmount = computed(() => 
    this.rejectedClaims().reduce((sum, c) => sum + (c.claimAmount || 0), 0)
  );
  
  avgAmount = computed(() => {
    const count = this.totalRejected();
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
