import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-claim-form',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './claim-form.html',
  styleUrl: './claim-form.css',
})
export class ClaimForm {
  @Input() isLoading = false;
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    diagnosis: ['', Validators.required],
    claimAmount: [null, [Validators.required, Validators.min(1)]]
  });

  submit() {
    if (this.form.valid) {
      this.onSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
