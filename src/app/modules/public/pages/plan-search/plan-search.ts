import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PlanCard } from '../../container/plan-card/plan-card';
import { IPolicyEnrollmentRequest } from '../../../../core/models/policy.model';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-plan-search',
  standalone:true,
  imports: [CommonModule, RouterModule, PlanCard],
  templateUrl: './plan-search.html',
  styleUrl: './plan-search.css',
})
export class PlanSearch {
  private policyService = inject(Policy);
  private authService = inject(Auth);
  private router = inject(Router);

  // Fetch plans via Signal
  plans = toSignal(
    this.policyService.getAllPlans().pipe(
      catchError(err => {
        console.error('Failed to load plans', err);
        return of([]);
      })
    )
  );

  handleEnrollment(planId: number) {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      // Not Logged In -> Redirect to Login with return URL
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/search' }
      });
      return;
    }

    // Get user ID
    const userId = this.authService.getUserId();
    
    if (!userId) {
      alert('Unable to get user information. Please try logging in again.');
      this.authService.logout();
      return;
    }

    // Confirm purchase
    if (confirm('Confirm purchase of this plan? (Mock Payment)')) {
      const request: IPolicyEnrollmentRequest = {
        userId: userId,
        planId: planId
      };

      this.policyService.enrollPolicy(request).subscribe({
        next: () => {
          alert('Enrollment Successful! Redirecting to Dashboard.');
          this.router.navigate(['/member/dashboard']);
        },
        error: (err) => {
          alert('Enrollment Failed: ' + (err.error?.message || 'Unknown Error'));
        }
      });
    }
  }
}
