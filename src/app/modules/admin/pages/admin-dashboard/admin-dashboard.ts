import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PlanForm } from '../../container/plan-form/plan-form';
import { Policy } from '../../../../core/services/policy/policy';
import { catchError, of, startWith, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IPlanRequest } from '../../../../core/models/policy.model';
import { Dialog } from '../../../../core/services/dialog/dialog';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, PlanForm],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private policyService = inject(Policy);
  private dialogService = inject(Dialog);
  private refresh$ = new Subject<void>();

  isCreating = signal(false); // Used to pass loading state to dumb component if needed

  // Reactive Data Stream (Resource pattern)
  plans = toSignal(
    this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => this.policyService.getAllPlans()),
      catchError(() => of([]))
    )
  );

  handleCreate(formData: IPlanRequest) {
    this.isCreating.set(true);
    this.policyService.createPlan(formData).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.dialogService.success('Plan created successfully!');
        this.refresh$.next(); // Refresh list
      },
      error: (err) => {
        this.isCreating.set(false);
        this.dialogService.error('Failed to create plan: ' + err.message);
      },
    });
  }
}
