import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPolicy, PolicyStatus } from '../../../../core/models/policy.model';

@Component({
  selector: 'app-policy-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, NgClass],
  templateUrl: './policy-card.html',
  styleUrl: './policy-card.css',
})
export class PolicyCard {
  @Input({ required: true }) policy!: IPolicy;

  @Output() onClaim = new EventEmitter<number>();
  @Output() onDownload = new EventEmitter<number>();


  getStatusColor(status: PolicyStatus): string {
    switch (status) {
      case PolicyStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case PolicyStatus.EXPIRED: return 'bg-gray-100 text-gray-800';
      case PolicyStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
