import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PlanCard } from '../../container/plan-card/plan-card';
import { IPolicyEnrollmentRequest } from '../../../../core/models/policy.model';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { Dialog } from '../../../../core/services/dialog/dialog';
import { MemberDocument } from '../../../../core/services/member-document/member-document';
import { DocumentUpload } from '../../../../shared/components/document-upload/document-upload';

@Component({
  selector: 'app-plan-search',
  standalone:true,
  imports: [CommonModule, RouterModule, PlanCard, DocumentUpload],
  templateUrl: './plan-search.html',
  styleUrl: './plan-search.css',
})
export class PlanSearch {
  private policyService = inject(Policy);
  private authService = inject(Auth);
  private router = inject(Router);
  private dialogService = inject(Dialog);
  private memberDocService = inject(MemberDocument);

  // State for document upload modal
  showDocumentUpload = signal(false);
  pendingPlanId = signal<number | null>(null);
  currentUserId = signal<number | null>(null);

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
      this.dialogService.error('Unable to get user information. Please try logging in again.');
      this.authService.logout();
      return;
    }

    this.currentUserId.set(userId);

    // Check if documents exist before enrollment
    this.memberDocService.checkDocumentsExist(userId).subscribe({
      next: (response) => {
        if (response.exists) {
          // Documents exist, proceed with enrollment
          this.proceedWithEnrollment(planId, userId);
        } else {
          // Documents don't exist, show upload modal
          this.pendingPlanId.set(planId);
          this.showDocumentUpload.set(true);
        }
      },
      error: () => {
        // If check fails, show upload modal to be safe
        this.pendingPlanId.set(planId);
        this.showDocumentUpload.set(true);
      }
    });
  }

  onDocumentsSubmitted() {
    this.showDocumentUpload.set(false);
    const planId = this.pendingPlanId();
    const userId = this.currentUserId();
    
    if (planId && userId) {
      this.proceedWithEnrollment(planId, userId);
    }
  }

  onDocumentUploadCancel() {
    this.showDocumentUpload.set(false);
    this.pendingPlanId.set(null);
  }

  private proceedWithEnrollment(planId: number, userId: number) {
    // Confirm purchase
    this.dialogService.confirm({
      title: 'Confirm Purchase',
      message: 'Confirm purchase of this plan? (Mock Payment)',
      type: 'info',
      confirmText: 'Purchase',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      const request: IPolicyEnrollmentRequest = {
        userId: userId,
        planId: planId
      };

      this.policyService.enrollPolicy(request).subscribe({
        next: () => {
          this.dialogService.success('Enrollment Successful! Redirecting to Dashboard.').subscribe(() => {
            this.router.navigate(['/member/dashboard']);
          });
        },
        error: (err) => {
          this.dialogService.error('Enrollment Failed: ' + (err.error?.message || 'Unknown Error'));
        }
      });
    });
  }
}
