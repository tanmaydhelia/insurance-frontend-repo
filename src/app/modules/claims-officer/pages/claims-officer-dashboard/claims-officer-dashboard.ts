import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ClaimsTable } from '../../container/claims-table/claims-table';
import { Claim } from '../../../../core/services/claim/claim';
import { catchError, of, startWith, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClaimStatus } from '../../../../core/models/claim.model';
import { Router } from '@angular/router';
import { Dialog } from '../../../../core/services/dialog/dialog';
import { Auth } from '../../../../core/services/auth/auth';

@Component({
  selector: 'app-claims-officer-dashboard',
  standalone: true,
  imports: [CommonModule, ClaimsTable],
  templateUrl: './claims-officer-dashboard.html',
  styleUrl: './claims-officer-dashboard.css',
})
export class ClaimsOfficerDashboard {
  private claimService = inject(Claim);
  private authService = inject(Auth);
  private refresh$ = new Subject<void>();
  private router = inject(Router);
  private dialogService = inject(Dialog);

  // Get current officer's ID
  private get officerId(): number {
    return this.authService.getUserId() || 0;
  }

  // Reactive Data Stream - Available claims (SUBMITTED only)
  claims = toSignal(
    this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => this.claimService.getOpenClaims()),
      catchError((err) => {
        console.error('Error fetching claims:', err);
        return of([]);
      })
    )
  );

  // My picked up claims (IN_REVIEW by me)
  myInReviewClaims = toSignal(
    this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => this.claimService.getMyInReviewClaims(this.officerId)),
      catchError((err) => {
        console.error('Error fetching my in-review claims:', err);
        return of([]);
      })
    )
  );

  isLoading = computed(() => this.claims() === undefined);

  refresh() {
    this.refresh$.next();
  }

  handleView(id: number) {
    // Pickup the claim (set to IN_REVIEW) before navigating
    // This hides it from other officers
    this.claimService.pickupClaim(id).subscribe({
      next: () => {
        this.router.navigate(['/claims/details', id]);
      },
      error: (err) => {
        // If pickup fails (e.g., already picked up by another officer), show error
        this.dialogService.error(
          'This claim may have already been picked up by another officer. Please refresh the queue.'
        );
        this.refresh();
      }
    });
  }

  // For viewing already picked up claims - no need to pickup again
  handleViewMyInReview(id: number) {
    this.router.navigate(['/claims/details', id]);
  }
}
