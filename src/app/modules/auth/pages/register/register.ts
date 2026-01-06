import { Component, inject } from '@angular/core';
import { Auth } from '../../../../core/services/auth/auth';
import { Router } from '@angular/router';
import { ERole, IUser } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { RegitserForm } from '../../container/regitser-form/regitser-form';
import { Footer } from '../../../../shared/components/footer/footer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RegitserForm, Footer],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  handleRegister(formData: any) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const newUser: IUser = { 
      name: formData.name,
      email: formData.email, 
      password: formData.password,
      role: ERole.ROLE_USER 
    };

    this.auth.register(newUser).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.message || 'Registration failed. Please try again.';
      },
    });
  }
}
