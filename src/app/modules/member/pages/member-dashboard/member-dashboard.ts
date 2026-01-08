import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PolicyCard } from '../../container/policy-card/policy-card';
import { Router, RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { Billing } from '../../../../core/services/billing/billing';
import { of, switchMap } from 'rxjs';
import { IPolicy, IRenewalConfirmRequest } from '../../../../core/models/policy.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environment/environment';
import { PolicyPrintCard } from '../../../../shared/components/policy-print-card/policy-print-card';

declare var Razorpay: any;

@Component({
  selector: 'app-member-dashboard',
  standalone:true,
  imports: [CommonModule, PolicyCard, RouterModule, PolicyPrintCard],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.css',
})
export class MemberDashboard{
  private policyService = inject(Policy);
  private authService = inject(Auth);
  private billingService = inject(Billing);
  private router = inject(Router);

  private userSignal = toSignal(this.authService.user$);

  // Renewal state
  isRenewing = signal(false);
  renewalError = signal<string | null>(null);
  renewalSuccess = signal(false);

  // Print card state
  showPrintCard = signal(false);
  selectedPolicyForPrint = signal<IPolicy | null>(null);

  policies = toSignal<IPolicy[], IPolicy[]>(
    this.authService.user$.pipe(
      switchMap(user => {
        if (!user?.id) {
          return of([]);
        }
        return this.policyService.getMemberPolicies(user.id);
      })
    ), 
    { initialValue: [] } 
  );
  
  isLoading = computed(() => {
    const user = this.userSignal();
    const data = this.policies();
    return !!user && data === undefined; 
  });

  handleRaiseClaim(policyId: number) {
    this.router.navigate(['/member/claim/new', policyId]);
  }

  handleDownload(policyId: number) {
    const policy = this.policies()?.find(p => p.id === policyId);
    if (policy) {
      this.selectedPolicyForPrint.set(policy);
      this.showPrintCard.set(true);
    }
  }

  closePrintCard() {
    this.showPrintCard.set(false);
    this.selectedPolicyForPrint.set(null);
  }

  getCurrentUser() {
    return this.userSignal();
  }

  async handleRenew(policy: IPolicy) {
    const user = this.userSignal();
    if (!user || !user.id) {
      this.renewalError.set('User not logged in');
      return;
    }

    this.isRenewing.set(true);
    this.renewalError.set(null);
    this.renewalSuccess.set(false);

    // Use billing service which properly creates Razorpay orders
    const planName = policy.plan?.name || policy.insurancePlan?.name || 'Policy';
    
    this.billingService.initiatePayment({
      amount: policy.premium,
      userId: user.id,
      policyId: policy.id,
      planName: `${planName} Renewal`,
      userEmail: user.email,
      userName: user.name
    }).subscribe({
      next: (result) => {
        if (result.verified) {
          // Payment successful, now confirm the renewal with the policy service
          this.policyService.confirmRenewal(policy.id, {
            razorpayOrderId: result.payment?.razorpayOrderId || '',
            razorpayPaymentId: result.payment?.razorpayPaymentId || '',
            success: true
          }).subscribe({
            next: () => {
              this.renewalSuccess.set(true);
              this.isRenewing.set(false);
              // Refresh policies after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            },
            error: (err) => {
              // Payment was successful but renewal confirmation failed
              this.renewalError.set('Payment successful but renewal confirmation failed. Please contact support.');
              this.isRenewing.set(false);
            }
          });
        } else {
          this.renewalError.set('Payment was not completed');
          this.isRenewing.set(false);
        }
      },
      error: (err) => {
        console.error('Renewal payment failed:', err);
        this.renewalError.set(err.message || 'Failed to process renewal payment');
        this.isRenewing.set(false);
      }
    });
  }

  closeRenewalSuccess() {
    this.renewalSuccess.set(false);
  }

  closeRenewalError() {
    this.renewalError.set(null);
  }
}
