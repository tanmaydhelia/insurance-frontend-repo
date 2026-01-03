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

  handleSubmit(formData: any) {
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
      diagnosis: formData.diagnosis,
      claimAmount: formData.claimAmount,
      submissionSource: SubmissionSource.PROVIDER,
    };

    this.claimService.submitClaim(request).subscribe({
      next: () => {
        alert('Claim Submitted Successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Error: ' + err.message);
      },
    });
  }
}
