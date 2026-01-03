import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IInsurancePlan } from '../../../../core/models/policy.model';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-agent-plan-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './agent-plan-table.html',
  styleUrl: './agent-plan-table.css',
})
export class AgentPlanTable {
  @Input({ required: true }) plans!: IInsurancePlan[];
  @Output() onSelect = new EventEmitter<IInsurancePlan>();
}
