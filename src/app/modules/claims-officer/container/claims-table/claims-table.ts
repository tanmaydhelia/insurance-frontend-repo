import { CommonModule, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IClaim } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-claims-table',
  standalone:true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './claims-table.html',
  styleUrl: './claims-table.css',
})
export class ClaimsTable {
  claims = input.required<IClaim[]>();
  onApprove = output<number>();
  onReject = output<number>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'REJECTED': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
      case 'IN_REVIEW': return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'; 
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  }
}
