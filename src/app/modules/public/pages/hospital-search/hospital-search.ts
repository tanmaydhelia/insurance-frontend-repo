import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HospitalCard } from '../../container/hospital-card/hospital-card';
import { Hospital } from '../../../../core/services/hospital/hospital';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-hospital-search',
  standalone:true,
  imports: [CommonModule, FormsModule, HospitalCard],
  templateUrl: './hospital-search.html',
  styleUrl: './hospital-search.css',
})
export class HospitalSearch {
  private hospitalService = inject(Hospital);
  
  searchTerm = signal('');
  private search$ = new Subject<string>();

  // Reactive Search Stream
  hospitals = toSignal(
    this.search$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term) return this.hospitalService.getAllHospitals();
        return this.hospitalService.searchHospitals(term);
      }),
      catchError(() => of([]))
    )
  );

  isLoading = signal(false); // In a real app, wrap the stream to handle loading state

  search(term: string) {
    this.searchTerm.set(term);
    this.search$.next(term);
  }
}
