import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IClaim } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-claim-history-table',
  standalone:true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './claim-history-table.html',
  styleUrl: './claim-history-table.css',
})
export class ClaimHistoryTable {
  claims = input.required<IClaim[]>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUBMITTED': 
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
