import { Component, inject } from '@angular/core';
import { Auth } from '../../../../core/services/auth/auth';
import { Router } from '@angular/router';
import { ERole, IUser } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { RegitserForm } from '../../container/regitser-form/regitser-form';
import { Footer } from '../../../../shared/components/footer/footer';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RegitserForm, Footer, ToastModule],
  providers: [MessageService],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);
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
        // Registration successful - now auto-login
        this.successMessage = 'Registration successful! Logging you in...';
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Registration successful! Logging you in...',
          life: 3000
        });

        // Auto-login with the same credentials
        this.auth.login({ email: formData.email, password: formData.password }).subscribe({
          next: () => {
            this.isLoading = false;
            // Get role from auth service after login
            this.auth.user$.subscribe(user => {
              if (user) {
                let redirectPath = '/member/dashboard';
                
                if (user.role === ERole.ROLE_ADMIN) {
                  redirectPath = '/admin/dashboard';
                } else if (user.role === ERole.ROLE_AGENT) {
                  redirectPath = '/agent/dashboard';
                } else if (user.role === ERole.ROLE_PROVIDER) {
                  redirectPath = '/provider/dashboard';
                } else if (user.role === ERole.ROLE_CLAIMS_OFFICER) {
                  redirectPath = '/claims-officer/dashboard';
                }

                this.router.navigate([redirectPath]);
              }
            });
          },
          error: (err) => {
            this.isLoading = false;
            // If auto-login fails, redirect to login page
            this.messageService.add({
              severity: 'info',
              summary: 'Login Required',
              detail: 'Please login with your new credentials',
              life: 3000
            });
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 1500);
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.message || 'Registration failed. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Registration Failed',
          detail: this.errorMessage || 'Please try again.',
          life: 5000
        });
      },
    });
  }
}
