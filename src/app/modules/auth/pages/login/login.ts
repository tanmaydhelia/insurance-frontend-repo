import { Component, inject } from '@angular/core';
import { Auth } from '../../../../core/services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { IAuthRequest } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { LoginForm } from '../../container/login-form/login-form';

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
      username: formData.username,
      password: formData.password
    };

    this.auth.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        // Redirect to return URL or default to home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}
