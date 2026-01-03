import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PolicyFinder } from '../../container/policy-finder/policy-finder';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { IPolicy } from '../../../../core/models/policy.model';
import { IClaimRequest, SubmissionSource } from '../../../../core/models/claim.model';
import { ClaimForm } from '../../../../shared/components/claim-form/claim-form';

@Component({
  selector: 'app-provider-submit-claim',
  standalone:true,
  imports: [CommonModule, RouterModule, PolicyFinder, ClaimForm],
  templateUrl: './provider-submit-claim.html',
  styleUrl: './provider-submit-claim.css',
})
export class ProviderSubmitClaim {
private policyService = inject(Policy);
  private claimService = inject(Claim);
  private router = inject(Router);

  verifiedPolicy = signal<IPolicy | null>(null);
  error = signal<string | null>(null);
  isSubmitting = false;

  verifyPolicy(policyNum: string) {
    this.error.set(null);
    this.verifiedPolicy.set(null);

    // MVP Hack: Use numeric ID directly. In production, use search endpoint.
    const id = Number(policyNum);
    if (isNaN(id)) {
        this.error.set('Please enter a valid numeric Policy ID.');
        return;
    }

    this.policyService.getPolicyById(id).subscribe({
      next: (pol) => {
        if (pol.status === 'ACTIVE') {
          this.verifiedPolicy.set(pol);
        } else {
          this.error.set(`Policy is ${pol.status}, cannot claim.`);
        }
      },
      error: () => this.error.set('Policy not found. Please check the ID.')
    });
  }

  handleSubmit(formData: any) {
    const policy = this.verifiedPolicy();
    if (!policy) return;

    this.isSubmitting = true;
    const request: IClaimRequest = {
      policyId: policy.id,
      diagnosis: formData.diagnosis,
      claimAmount: formData.claimAmount,
      submissionSource: SubmissionSource.PROVIDER
    };

    this.claimService.submitClaim(request).subscribe({
      next: () => {
        alert('Claim Submitted Successfully!');
        // Refresh or redirect
        this.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Submission Error: ' + err.message);
      }
    });
  }

  reset() {
    this.verifiedPolicy.set(null);
    this.error.set(null);
  }
}
