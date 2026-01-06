import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Claim } from '../../../../core/services/claim/claim';
import { Policy } from '../../../../core/services/policy/policy';
import { Hospital } from '../../../../core/services/hospital/hospital';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ClaimStatus } from '../../../../core/models/claim.model';
import { Dialog } from '../../../../core/services/dialog/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-claim-details',
  standalone:true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './claim-details.html',
  styleUrl: './claim-details.css',
})
export class ClaimDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(Dialog);
  
  private claimService = inject(Claim);
  private policyService = inject(Policy);
  private hospitalService = inject(Hospital);

  // Approval modal state
  showApprovalModal = signal(false);
  approvedAmount = signal<number>(0);
  approvalComments = signal<string>('');
  approvalError = signal<string | null>(null);
  isProcessing = signal(false);

  // 1. Fetch Claim
  claim = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => this.claimService.getClaimById(id))
    )
  );

  // 2. Derive Policy from Claim (Reactive chain)
  policy = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => this.claimService.getClaimById(id)), // Re-fetch or shareReplay in service ideally
      switchMap(claim => {
        if (!claim?.policyId) return []; // safe fallback
        return this.policyService.getPolicyById(claim.policyId);
      })
    )
  );

  // 3. Derive Hospital from Claim (if exists)
  hospital = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => this.claimService.getClaimById(id)),
      switchMap(claim => {
        if (!claim?.hospitalId) return [null]; // Return null if no hospital linked
        return this.hospitalService.getHospitalById(claim.hospitalId);
      })
    )
  );

  goBack() {
    this.router.navigate(['/claims/dashboard']);
  }

  openApprovalModal() {
    const claim = this.claim();
    if (!claim) return;
    
    // Pre-fill with claim amount (full approval by default)
    this.approvedAmount.set(claim.claimAmount);
    this.approvalComments.set('');
    this.approvalError.set(null);
    this.showApprovalModal.set(true);
  }

  closeApprovalModal() {
    this.showApprovalModal.set(false);
    this.approvalComments.set('');
    this.approvalError.set(null);
  }

  validateApprovalAmount(): boolean {
    const claim = this.claim();
    const policy = this.policy();
    const amount = this.approvedAmount();

    if (!claim || !policy) {
      this.approvalError.set('Unable to validate. Please try again.');
      return false;
    }

    if (amount <= 0) {
      this.approvalError.set('Approved amount must be greater than 0');
      return false;
    }

    if (amount > claim.claimAmount) {
      this.approvalError.set(`Approved amount cannot exceed claim amount (₹${claim.claimAmount.toLocaleString()})`);
      return false;
    }

    const remainingSumInsured = policy.remainingSumInsured ?? policy.plan?.coverageAmount ?? 0;
    if (amount > remainingSumInsured) {
      this.approvalError.set(`Approved amount cannot exceed remaining sum insured (₹${remainingSumInsured.toLocaleString()})`);
      return false;
    }

    this.approvalError.set(null);
    return true;
  }

  handleApprove() {
    if (!this.validateApprovalAmount()) return;

    const id = this.claim()?.id;
    if (!id) return;

    this.isProcessing.set(true);
    
    const updatePayload: any = { 
      status: ClaimStatus.APPROVED,
      approvedAmount: this.approvedAmount()
    };
    
    // Include comments if provided
    if (this.approvalComments().trim()) {
      updatePayload.approvalComments = this.approvalComments().trim();
    }
    
    this.claimService.updateClaimStatus(id, updatePayload).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.closeApprovalModal();
        this.dialogService.success(`Claim approved for ₹${this.approvedAmount().toLocaleString()}`).subscribe(() => {
          this.goBack();
        });
      },
      error: (err) => {
        this.isProcessing.set(false);
        const message = err.error?.message || 'Failed to approve claim';
        this.approvalError.set(message);
      }
    });
  }

  handleReject() {
    const id = this.claim()?.id;
    if (!id) return;
    
    this.dialogService.prompt({
      title: 'Reject Claim',
      message: 'Please provide a reason for rejecting this claim:',
      placeholder: 'Enter rejection reason...',
      type: 'warning',
      confirmText: 'Reject',
      cancelText: 'Cancel'
    }).subscribe(reason => {
      if (!reason || !reason.trim()) return;
      
      this.claimService.updateClaimStatus(id, { status: ClaimStatus.REJECTED, rejectionReason: reason })
        .subscribe(() => {
          this.dialogService.success('Claim Rejected').subscribe(() => {
            this.goBack();
          });
        });
    });
  }
}
