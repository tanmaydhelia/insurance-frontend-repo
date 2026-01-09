import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

// Password validation requirements
interface PasswordRequirement {
  label: string;
  validator: (value: string) => boolean;
  met: boolean;
}

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-form.html',
  styleUrl: './password-form.css',
})
export class PasswordForm {
  private fb = inject(FormBuilder);

  @Input() isLoading = false;
  @Output() update = new EventEmitter<any>();

  // Password requirements checklist
  passwordRequirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', validator: (v) => v.length >= 8, met: false },
    { label: 'At least one uppercase letter (A-Z)', validator: (v) => /[A-Z]/.test(v), met: false },
    { label: 'At least one lowercase letter (a-z)', validator: (v) => /[a-z]/.test(v), met: false },
    { label: 'At least one number (0-9)', validator: (v) => /[0-9]/.test(v), met: false },
    { label: 'At least one special character (!@#$%^&*)', validator: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), met: false },
  ];

  showPasswordRequirements = signal(false);

  passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', [Validators.required, Validators.minLength(4)]],
    newPassword: ['', [Validators.required, this.strongPasswordValidator.bind(this)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    // Update requirements on password change
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.updatePasswordRequirements(value || '');
    });
  }

  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    
    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    if (!isStrong) {
      return { weakPassword: true };
    }
    return null;
  }

  private updatePasswordRequirements(value: string) {
    this.passwordRequirements = this.passwordRequirements.map(req => ({
      ...req,
      met: req.validator(value)
    }));
  }

  onPasswordFocus() {
    this.showPasswordRequirements.set(true);
  }

  onPasswordBlur() {
    const password = this.passwordForm.get('newPassword')?.value;
    if (!password || this.passwordRequirements.every(r => r.met)) {
      this.showPasswordRequirements.set(false);
    }
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;
      this.update.emit({ oldPassword, newPassword });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  reset() {
    this.passwordForm.reset();
    this.updatePasswordRequirements('');
  }

  isInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasFormError(errorName: string): boolean {
    return !!(this.passwordForm.errors?.[errorName] && 
             this.passwordForm.get('confirmPassword')?.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.passwordForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(field)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('weakPassword')) {
      return 'Password does not meet all requirements';
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      oldPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password'
    };
    return labels[field] || field;
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
