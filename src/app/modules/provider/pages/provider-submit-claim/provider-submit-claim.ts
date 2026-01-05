import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PolicyFinder } from '../../container/policy-finder/policy-finder';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { IPolicy } from '../../../../core/models/policy.model';
import { IClaimRequest, SubmissionSource } from '../../../../core/models/claim.model';
import { ClaimForm } from '../../../../shared/components/claim-form/claim-form';
import { HospitalSelector } from '../../container/hospital-selector/hospital-selector';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-provider-submit-claim',
  standalone: true,
  imports: [CommonModule, RouterModule, PolicyFinder, ClaimForm, HospitalSelector],
  templateUrl: './provider-submit-claim.html',
  styleUrl: './provider-submit-claim.css',
})
export class ProviderSubmitClaim {
  private policyService = inject(Policy);
  private claimService = inject(Claim);
  private router = inject(Router);

  hospitalId = signal<number | null>(null);
  verifiedPolicy = signal<IPolicy | null>(null);
  isSubmitting = false;

  verifyPolicy(policyNum: string) {
    const id = Number(policyNum);
    if (!isNaN(id)) {
      this.policyService.getPolicyById(id).subscribe((p) => this.verifiedPolicy.set(p));
    }
  }

  setHospital(id: any) {
    this.hospitalId.set(id as number);
  }

  handleSubmit(event: { formValues: any, file: File | null }) {
    const policy = this.verifiedPolicy();
    const hospId = this.hospitalId();

    if (!policy || !hospId) {
      alert('Missing Policy or Hospital information');
      return;
    }

    this.isSubmitting = true;
    const request: IClaimRequest = {
      policyId: policy.id,
      hospitalId: hospId,
      diagnosis: event.formValues.diagnosis,
      claimAmount: event.formValues.claimAmount,
      submissionSource: SubmissionSource.PROVIDER,
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
        alert('Claim Submitted Successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Failed to submit claim: ' + (err.error?.message || err.message));
      },
    });
  }
}
