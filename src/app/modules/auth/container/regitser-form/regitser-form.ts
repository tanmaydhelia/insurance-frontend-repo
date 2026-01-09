import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Password validation requirements
interface PasswordRequirement {
  label: string;
  validator: (value: string) => boolean;
  met: boolean;
}

@Component({
  selector: 'app-register-form',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './regitser-form.html',
  styleUrl: './regitser-form.css',
})
export class RegitserForm {
  @Input() isLoading = false;
  @Output() onSubmit = new EventEmitter<any>();
  private fb = inject(FormBuilder);

  // Password requirements checklist
  passwordRequirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', validator: (v) => v.length >= 8, met: false },
    { label: 'At least one uppercase letter (A-Z)', validator: (v) => /[A-Z]/.test(v), met: false },
    { label: 'At least one lowercase letter (a-z)', validator: (v) => /[a-z]/.test(v), met: false },
    { label: 'At least one number (0-9)', validator: (v) => /[0-9]/.test(v), met: false },
    { label: 'At least one special character (!@#$%^&*)', validator: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), met: false },
  ];

  showPasswordRequirements = signal(false);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.strongPasswordValidator.bind(this)]]
  });

  constructor() {
    // Update requirements on password change
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
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
    // Keep showing if there are unmet requirements and field has value
    const password = this.registerForm.get('password')?.value;
    if (!password || this.passwordRequirements.every(r => r.met)) {
      this.showPasswordRequirements.set(false);
    }
  }

  submit() {
    if (this.registerForm.valid) {
      this.onSubmit.emit(this.registerForm.value);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  isInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('weakPassword')) {
      return 'Password does not meet all requirements';
    }
    return '';
  }
}
