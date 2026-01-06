import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Billing } from '../../../core/services/billing/billing';
import { IInsurancePlan } from '../../../core/models/policy.model';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './payment-checkout.html',
  styleUrl: './payment-checkout.css',
})
export class PaymentCheckout {
  private billingService = inject(Billing);

  @Input({ required: true }) plan!: IInsurancePlan;
  @Input({ required: true }) userId!: number;
  @Input() userName?: string;
  @Input() userEmail?: string;
  @Input() policyId?: number;

  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onError = new EventEmitter<string>();

  isProcessing = signal(false);
  paymentStatus = signal<'idle' | 'processing' | 'success' | 'failed'>('idle');
  errorMessage = signal<string | null>(null);

  get basePremium(): number {
    return this.plan?.basePremium || 0;
  }

  get gstAmount(): number {
    return this.basePremium * 0.18;
  }

  get totalAmount(): number {
    return Math.round(this.basePremium * 1.18);
  }

  initiatePayment() {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);
    this.paymentStatus.set('processing');
    this.errorMessage.set(null);

    this.billingService.initiatePayment({
      amount: this.totalAmount,
      userId: this.userId,
      policyId: this.policyId,
      planName: this.plan.name,
      userName: this.userName,
      userEmail: this.userEmail
    }).subscribe({
      next: (result) => {
        this.isProcessing.set(false);
        if (result.verified) {
          this.paymentStatus.set('success');
          // Small delay to show success state
          setTimeout(() => {
            this.onSuccess.emit();
          }, 1500);
        } else {
          this.paymentStatus.set('failed');
          this.errorMessage.set('Payment was not completed. Please try again.');
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.paymentStatus.set('failed');
        const message = err.error?.message || err.message || 'Payment failed. Please try again.';
        this.errorMessage.set(message);
        this.onError.emit(message);
      }
    });
  }

  cancel() {
    if (this.isProcessing()) return;
    this.onCancel.emit();
  }

  retry() {
    this.paymentStatus.set('idle');
    this.errorMessage.set(null);
  }
}
