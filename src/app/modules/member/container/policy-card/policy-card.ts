import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPolicy, PolicyStatus, RenewalStatus } from '../../../../core/models/policy.model';

@Component({
  selector: 'app-policy-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DecimalPipe, NgClass],
  templateUrl: './policy-card.html',
  styleUrl: './policy-card.css',
})
export class PolicyCard {
  @Input({ required: true }) policy!: IPolicy;

  @Output() onClaim = new EventEmitter<number>();
  @Output() onDownload = new EventEmitter<number>();
  @Output() onRenew = new EventEmitter<IPolicy>();

  readonly PolicyStatus = PolicyStatus;

  getStatusColor(status: PolicyStatus): string {
    switch (status) {
      case PolicyStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case PolicyStatus.EXPIRED: return 'bg-gray-100 text-gray-800';
      case PolicyStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getRemainingPercentage(): number {
    const coverage = this.policy.plan?.coverageAmount || this.policy.insurancePlan?.coverageAmount || 0;
    const remaining = this.policy.remainingSumInsured ?? coverage;
    if (coverage === 0) return 100;
    return (remaining / coverage) * 100;
  }

  isExpiringSoon(): boolean {
    const daysRemaining = this.policy.daysRemaining;
    return daysRemaining !== undefined && daysRemaining <= 30 && daysRemaining > 0;
  }

  canRenew(): boolean {
    return this.policy.renewable === true || this.isExpiringSoon() || this.policy.status === PolicyStatus.EXPIRED;
  }

  getDaysRemainingClass(): string {
    const days = this.policy.daysRemaining;
    if (days === undefined) return 'text-gray-600';
    if (days <= 7) return 'text-red-600';
    if (days <= 14) return 'text-orange-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  }

  getRenewalStatusText(): string {
    if (!this.policy.lastRenewalStatus) return '';
    switch (this.policy.lastRenewalStatus) {
      case RenewalStatus.PENDING: return 'Renewal Pending';
      case RenewalStatus.COMPLETED: return 'Renewal Completed';
      case RenewalStatus.FAILED: return 'Renewal Failed';
      default: return '';
    }
  }
}
