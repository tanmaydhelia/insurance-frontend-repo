import { Component, inject } from '@angular/core';
import { Auth } from '../../../../core/services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ERole, IAuthRequest } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { LoginForm } from '../../container/login-form/login-form';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone:true,
  imports:[CommonModule, LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  isLoading = false;
  errorMessage: string | null = null;

  handleLogin(formData: any): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    const credentials: IAuthRequest = {
      email: formData.email,
      password: formData.password
    };

    this.auth.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        
        // Get the return URL or redirect based on user role
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigate([returnUrl]);
        } else {
          // Redirect to role-specific landing page
          this.redirectToLandingPage();
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid credentials. Please try again.';
      }
    });
  }

  private redirectToLandingPage(): void {
    // Use take(1) to automatically unsubscribe after getting the user
    this.auth.user$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }

      switch (user.role) {
        case ERole.ROLE_ADMIN:
          this.router.navigate(['/admin/dashboard']);
          break;
        case ERole.ROLE_USER:
          this.router.navigate(['/member/dashboard']);
          break;
        case ERole.ROLE_AGENT:
          this.router.navigate(['/agent/dashboard']);
          break;
        case ERole.ROLE_PROVIDER:
          this.router.navigate(['/provider/dashboard']);
          break;
        case ERole.ROLE_CLAIMS_OFFICER:
          this.router.navigate(['/claims/dashboard']);
          break;
        default:
          this.router.navigate(['/auth/login']);
          break;
      }
    });
  }
}
