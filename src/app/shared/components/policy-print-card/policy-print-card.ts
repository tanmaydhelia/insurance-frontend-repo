import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IPolicy, PolicyStatus } from '../../../core/models/policy.model';
import { IUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-policy-print-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './policy-print-card.html',
  styleUrl: './policy-print-card.css',
})
export class PolicyPrintCard {
  @Input({ required: true }) policy!: IPolicy;
  @Input({ required: true }) user!: IUser;
  @Input() isOpen = false;

  @Output() onClose = new EventEmitter<void>();

  readonly PolicyStatus = PolicyStatus;
  readonly today = new Date();

  close() {
    this.onClose.emit();
  }

  print() {
    window.print();
  }

  getStatusColor(): string {
    switch (this.policy.status) {
      case PolicyStatus.ACTIVE: return 'text-green-600';
      case PolicyStatus.EXPIRED: return 'text-gray-600';
      case PolicyStatus.CANCELLED: return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getStatusBgColor(): string {
    switch (this.policy.status) {
      case PolicyStatus.ACTIVE: return 'bg-green-100';
      case PolicyStatus.EXPIRED: return 'bg-gray-100';
      case PolicyStatus.CANCELLED: return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  }
}
