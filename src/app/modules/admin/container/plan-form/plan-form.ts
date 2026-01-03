import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPlanRequest } from '../../../../core/models/policy.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-form',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plan-form.html',
  styleUrl: './plan-form.css',
})
export class PlanForm {
isLoading = signal(false); // Using Signal input pattern manually or just standard signal
  onSubmit = output<IPlanRequest>();

  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    basePremium: [null, [Validators.required, Validators.min(100)]],
    coverageAmount: [null, [Validators.required, Validators.min(1000)]]
  });

  submit() {
    if (this.form.valid) {
      this.onSubmit.emit(this.form.value as IPlanRequest);
    } else {
      this.form.markAllAsTouched();
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
