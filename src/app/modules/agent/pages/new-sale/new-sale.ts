import { Component, inject, signal } from '@angular/core';
import { AgentPlanTable } from '../../container/agent-plan-table/agent-plan-table';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { IInsurancePlan, IPolicyEnrollmentRequest } from '../../../../core/models/policy.model';
import { Dialog } from '../../../../core/services/dialog/dialog';
import { MemberDocument } from '../../../../core/services/member-document/member-document';
import { DocumentUpload } from '../../../../shared/components/document-upload/document-upload';
import { IUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-new-sale',
  standalone:true,
  imports: [CommonModule, RouterModule, AgentPlanTable, DocumentUpload],
  templateUrl: './new-sale.html',
  styleUrl: './new-sale.css',
})
export class NewSale {
  private policyService = inject(Policy);
  private auth = inject(Auth);
  private router = inject(Router);
  private dialogService = inject(Dialog);
  private memberDocService = inject(MemberDocument);

  // Simple email input for customer
  customerEmail = signal<string>('');
  errorMessage = signal<string | null>(null);

  // Document upload modal state
  showDocumentUpload = signal(false);
  pendingCustomer = signal<IUser | null>(null);
  pendingPlan = signal<IInsurancePlan | null>(null);

  // Load plans immediately
  plans = toSignal(this.policyService.getAllPlans());

  handlePlanSelection(plan: IInsurancePlan) {
    const email = this.customerEmail().trim();
    const agentId = this.auth.getUserId();

    if (!email || !plan) {
      this.errorMessage.set('Please enter customer email and select a plan.');
      return;
    }

    if (!agentId) {
      this.errorMessage.set('Agent not identified. Please log in again.');
      return;
    }

    this.errorMessage.set(null);

    // Get user by email and check documents
    this.auth.getUserByEmail(email).subscribe({
      next: (user) => {
        if (!user?.id) {
          this.errorMessage.set('Customer not found. Please check the email.');
          return;
        }

        // Check if customer has documents uploaded
        this.memberDocService.checkDocumentsExist(user.id).subscribe({
          next: (response) => {
            if (response.exists) {
              // Documents exist, proceed with enrollment
              this.proceedWithEnrollment(user, plan, agentId);
            } else {
              // Documents don't exist, show upload modal
              this.pendingCustomer.set(user);
              this.pendingPlan.set(plan);
              this.showDocumentUpload.set(true);
            }
          },
          error: () => {
            // If check fails, show upload modal to be safe
            this.pendingCustomer.set(user);
            this.pendingPlan.set(plan);
            this.showDocumentUpload.set(true);
          }
        });
      },
      error: () => {
        this.errorMessage.set('Customer not found with this email.');
      },
    });
  }

  onDocumentsSubmitted() {
    this.showDocumentUpload.set(false);
    const customer = this.pendingCustomer();
    const plan = this.pendingPlan();
    const agentId = this.auth.getUserId();
    
    if (customer && plan && agentId) {
      this.proceedWithEnrollment(customer, plan, agentId);
    }
  }

  onDocumentUploadCancel() {
    this.showDocumentUpload.set(false);
    this.pendingCustomer.set(null);
    this.pendingPlan.set(null);
  }

  private proceedWithEnrollment(user: IUser, plan: IInsurancePlan, agentId: number) {
    this.dialogService.confirm({
      title: 'Confirm Enrollment',
      message: `Enroll ${user.name || user.email} into ${plan.name}?`,
      type: 'info',
      confirmText: 'Enroll',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      const request: IPolicyEnrollmentRequest = {
        userId: user.id!,
        planId: plan.id!,
        agentId: agentId,
      };

      this.policyService.enrollPolicy(request).subscribe({
        next: () => {
          this.dialogService.success('Policy Sold Successfully!').subscribe(() => {
            this.customerEmail.set('');
            this.router.navigate(['/agent/dashboard']);
          });
        },
        error: (err) => {
          this.errorMessage.set('Enrollment Failed: ' + (err.error?.message || err.message));
        },
      });
    });
  }
}
