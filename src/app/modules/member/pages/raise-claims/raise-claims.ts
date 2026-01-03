import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClaimForm } from '../../container/claim-form/claim-form';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IClaimRequest, SubmissionSource } from '../../../../core/models/claim.model';

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

  isSubmitting = false;

  // 1. Get ID from URL
  private policyId$ = this.route.paramMap.pipe(
    map(params => Number(params.get('id')))
  );

  // 2. Fetch Policy Context
  policy = toSignal(
    this.policyId$.pipe(
      switchMap(id => this.policyService.getPolicyById(id))
    )
  );

  handleSubmit(formData: any) {
    const currentPolicy = this.policy();
    if (!currentPolicy) return;

    this.isSubmitting = true;

    const request: IClaimRequest = {
      policyId: currentPolicy.id,
      diagnosis: formData.diagnosis,
      claimAmount: formData.claimAmount,
      submissionSource: SubmissionSource.MEMBER,
      // hospitalId: optional, skipped for direct member reimbursement
    };

    this.claimService.submitClaim(request).subscribe({
      next: () => {
        alert('Claim Submitted Successfully!');
        this.router.navigate(['/member/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Failed to submit claim: ' + err.message);
      }
    });
  }

  handleCancel() {
    this.router.navigate(['/member/dashboard']);
  }
}
