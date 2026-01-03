import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Hospital } from '../../../../core/services/hospital/hospital';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-hospital-selector',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hospital-selector.html',
  styleUrl: './hospital-selector.css',
})
export class HospitalSelector {
  private hospitalService = inject(Hospital);
  
  hospitals = toSignal(this.hospitalService.getAllHospitals());
  selectedId = signal<number | null>(null);
  onSelect = output<number>();

  select(id: string | number) {
    const numId = Number(id);
    this.selectedId.set(numId);
    this.onSelect.emit(numId);
  }
}
