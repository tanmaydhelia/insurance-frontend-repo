import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './claim-form.html',
  styleUrl: './claim-form.css',
})
export class ClaimForm {
  @Input() isLoading = false;
  @Output() onSubmit = new EventEmitter<{ formValues: any; file: File | null }>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  selectedFileName = signal<string | null>(null);
  selectedFile: File | null = null;

  form: FormGroup = this.fb.group({
    diagnosis: ['', Validators.required],
    claimAmount: [null, [Validators.required, Validators.min(1)]],
  });

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName.set(file.name);
    }
  }

  submit() {
    if (this.form.valid) {
      this.onSubmit.emit({ formValues: this.form.value, file: this.selectedFile });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
