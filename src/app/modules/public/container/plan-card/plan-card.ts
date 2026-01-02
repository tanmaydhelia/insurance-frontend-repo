import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IInsurancePlan } from '../../../../core/models/policy.model';

@Component({
  selector: 'app-plan-card',
  standalone:true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.css',
})
export class PlanCard {
  @Input({ required: true }) plan!: IInsurancePlan;
  @Output() onBuy = new EventEmitter<number>();
}
