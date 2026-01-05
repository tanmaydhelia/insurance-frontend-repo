import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IClaimRequest, SubmissionSource } from '../../../../core/models/claim.model';
import { ClaimForm } from '../../../../shared/components/claim-form/claim-form';
import { Dialog } from '../../../../core/services/dialog/dialog';

@Component({
  selector: 'app-raise-claims',
  standalone: true,
  imports: [CommonModule, RouterModule, ClaimForm],
  templateUrl: './raise-claims.html',
  styleUrl: './raise-claims.css',
})
export class RaiseClaims {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private policyService = inject(Policy);
  private claimService = inject(Claim);
  private dialogService = inject(Dialog);

  isSubmitting = false;

  // 1. Get ID from URL
  private policyId$ = this.route.paramMap.pipe(map((params) => Number(params.get('id'))));

  // 2. Fetch Policy Context
  policy = toSignal(this.policyId$.pipe(switchMap((id) => this.policyService.getPolicyById(id))));

  handleSubmit(event: { formValues: any; file: File | null }) {
    const currentPolicy = this.policy();
    if (!currentPolicy) return;

    this.isSubmitting = true;

    const request: IClaimRequest = {
      policyId: currentPolicy.id,
      diagnosis: event.formValues.diagnosis,
      claimAmount: event.formValues.claimAmount,
      submissionSource: SubmissionSource.MEMBER,
      // hospitalId: optional, skipped for direct member reimbursement
    };

    const process$ = event.file
      ? this.claimService.uploadDocument(event.file).pipe(
          switchMap((response) => {
            request.documentUrl = response.url;
            return this.claimService.submitClaim(request);
          })
        )
      : this.claimService.submitClaim(request);

    process$.subscribe({
      next: () => {
        this.dialogService.success('Claim Submitted Successfully!').subscribe(() => {
          this.router.navigate(['/member/dashboard']);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.dialogService.error('Failed to submit claim: ' + (err.error?.message || err.message));
      },
    });
  }

  handleCancel() {
    this.router.navigate(['/member/dashboard']);
  }
}
