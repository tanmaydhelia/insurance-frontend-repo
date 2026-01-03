import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IHospital } from '../../../../core/models/hospital.model';

@Component({
  selector: 'app-hospital-card',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './hospital-card.html',
  styleUrl: './hospital-card.css',
})
export class HospitalCard {
  hospital = input.required<IHospital>();
}
