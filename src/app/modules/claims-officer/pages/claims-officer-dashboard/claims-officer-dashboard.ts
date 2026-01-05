import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ClaimsTable } from '../../container/claims-table/claims-table';
import { Claim } from '../../../../core/services/claim/claim';
import { catchError, of, startWith, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClaimStatus } from '../../../../core/models/claim.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-claims-officer-dashboard',
  standalone: true,
  imports: [CommonModule, ClaimsTable],
  templateUrl: './claims-officer-dashboard.html',
  styleUrl: './claims-officer-dashboard.css',
})
export class ClaimsOfficerDashboard {
  private claimService = inject(Claim); // Ensure Service Name matches your file
  private refresh$ = new Subject<void>();
  private router = inject(Router);

  // Reactive Data Stream
  claims = toSignal(
    this.refresh$.pipe(
      startWith(undefined), // Load immediately on init
      switchMap(() => this.claimService.getOpenClaims()),
      catchError((err) => {
        console.error('Error fetching claims:', err);
        return of([]);
      })
    )
  );

  isLoading = computed(() => this.claims() === undefined);

  refresh() {
    this.refresh$.next();
  }

  handleApprove(id: number) {
    if (confirm('Confirm APPROVAL for this claim? This will authorize the payout.')) {
      this.updateStatus(id, ClaimStatus.APPROVED);
    }
  }

  handleReject(id: number) {
    const reason = prompt('Please provide a reason for rejection (Required):');
    if (reason && reason.trim().length > 0) {
      this.updateStatus(id, ClaimStatus.REJECTED, reason);
    } else if (reason !== null) {
      alert('Rejection reason is required.');
    }
  }

  handleView(id: number) {
    this.router.navigate(['/claims/details', id]);
  }

  private updateStatus(id: number, status: ClaimStatus, reason?: string) {
    // Assuming updateClaimStatus exists in your Claim Service
    // If not, we'll need to add it to src/app/core/services/claim/claim.ts
    this.claimService.updateClaimStatus(id, { status, rejectionReason: reason }).subscribe({
      next: () => {
        this.refresh(); // Refresh list to reflect changes
        // Optional: Show toast notification
      },
      error: (err) => alert('Action Failed: ' + (err.error?.message || 'Unknown Error')),
    });
  }
}
