import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  handleApprove() {
    const id = this.claim()?.id;
    if (!id) return;
    
    this.dialogService.confirm({
      title: 'Approve Claim',
      message: 'Are you sure you want to approve this claim?',
      type: 'success',
      confirmText: 'Approve',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      
      this.claimService.updateClaimStatus(id, { status: ClaimStatus.APPROVED })
        .subscribe(() => {
          this.dialogService.success('Claim Approved').subscribe(() => {
            this.goBack();
          });
        });
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
