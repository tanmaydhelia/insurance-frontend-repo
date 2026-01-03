import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ClaimHistoryTable } from '../../container/claim-history-table/claim-history-table';
import { Auth } from '../../../../core/services/auth/auth';
import { Claim } from '../../../../core/services/claim/claim';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { IClaim } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-claim-history',
  standalone:true,
  imports: [CommonModule, ClaimHistoryTable],
  templateUrl: './claim-history.html',
  styleUrl: './claim-history.css',
})
export class ClaimHistory {
  private auth = inject(Auth);
  private claimService = inject(Claim);

  // Reactive Chain: User -> Claims
  claims = toSignal(
    this.auth.user$.pipe(
      switchMap(user => {
        if (!user?.id) return of([]);
        return this.claimService.getMemberClaims(user.id);
      }),
      catchError(err => {
        console.error('Error fetching claims', err);
        return of([] as IClaim[]);
      })
    )
  );

  isLoading = computed(() => this.claims() === undefined);
}
