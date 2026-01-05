import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ClaimsTable } from '../../container/claims-table/claims-table';
import { Claim } from '../../../../core/services/claim/claim';
import { catchError, of, startWith, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClaimStatus } from '../../../../core/models/claim.model';
import { Router } from '@angular/router';
import { Dialog } from '../../../../core/services/dialog/dialog';

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
  private dialogService = inject(Dialog);

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
    this.dialogService.confirm({
      title: 'Confirm Approval',
      message: 'Confirm APPROVAL for this claim? This will authorize the payout.',
      type: 'success',
      confirmText: 'Approve',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.updateStatus(id, ClaimStatus.APPROVED);
      }
    });
  }

  handleReject(id: number) {
    this.dialogService.prompt({
      title: 'Reject Claim',
      message: 'Please provide a reason for rejection (Required):',
      placeholder: 'Enter rejection reason...',
      type: 'warning',
      confirmText: 'Reject',
      cancelText: 'Cancel'
    }).subscribe(reason => {
      if (reason && reason.trim().length > 0) {
        this.updateStatus(id, ClaimStatus.REJECTED, reason);
      }
    });
  }

  handleView(id: number) {
    this.router.navigate(['/claims/details', id]);
  }

  private updateStatus(id: number, status: ClaimStatus, reason?: string) {
    this.claimService.updateClaimStatus(id, { status, rejectionReason: reason }).subscribe({
      next: () => {
        this.refresh();
        this.dialogService.success(
          status === ClaimStatus.APPROVED ? 'Claim Approved Successfully' : 'Claim Rejected'
        );
      },
      error: (err) => {
        this.dialogService.error('Action Failed: ' + (err.error?.message || 'Unknown Error'));
      },
    });
  }
}
