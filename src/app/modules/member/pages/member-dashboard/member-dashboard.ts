import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PolicyCard } from '../../container/policy-card/policy-card';
import { Router, RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
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
    if (!user) {
      this.renewalError.set('User not logged in');
      return;
    }

    this.isRenewing.set(true);
    this.renewalError.set(null);
    this.renewalSuccess.set(false);

    try {
      // Load Razorpay script if not already loaded
      await this.loadRazorpayScript();

      // Initiate renewal to get order details
      this.policyService.initiateRenewal(policy.id).subscribe({
        next: (orderResponse) => {
          // Open Razorpay checkout
          // Note: Backend should return amount in paise (smallest currency unit)
          // If backend returns amount in rupees, multiply by 100
          const amountInPaise = orderResponse.amount < 1000 
            ? orderResponse.amount * 100 
            : orderResponse.amount;

          const options = {
            key: environment.razorpayKey,
            amount: amountInPaise,
            currency: orderResponse.currency || 'INR',
            name: 'Insurance Renewal',
            description: `Renewal for Policy #${policy.policyNumber}`,
            order_id: orderResponse.orderId,
            prefill: {
              name: user.name,
              email: user.email,
            },
            handler: (response: any) => {
              this.confirmRenewal(policy.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                success: true
              });
            },
            modal: {
              ondismiss: () => {
                this.isRenewing.set(false);
              }
            },
            theme: {
              color: '#f97316' // Orange for renewal
            }
          };

          const razorpay = new Razorpay(options);
          razorpay.on('payment.failed', (response: any) => {
            this.renewalError.set(response.error?.description || 'Payment failed');
            this.isRenewing.set(false);
          });
          razorpay.open();
        },
        error: (err) => {
          this.renewalError.set(err.error?.message || err.message || 'Failed to initiate renewal');
          this.isRenewing.set(false);
        }
      });
    } catch (error: any) {
      this.renewalError.set(error.message || 'Failed to load payment gateway');
      this.isRenewing.set(false);
    }
  }

  private confirmRenewal(policyId: number, request: IRenewalConfirmRequest) {
    this.policyService.confirmRenewal(policyId, request).subscribe({
      next: () => {
        this.renewalSuccess.set(true);
        this.isRenewing.set(false);
        // Refresh policies after a short delay to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error: (err) => {
        this.renewalError.set(err.error?.message || err.message || 'Failed to confirm renewal');
        this.isRenewing.set(false);
      }
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  }

  closeRenewalSuccess() {
    this.renewalSuccess.set(false);
  }

  closeRenewalError() {
    this.renewalError.set(null);
  }
}
