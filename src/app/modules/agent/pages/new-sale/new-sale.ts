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
import { ERole, IUser } from '../../../../core/models/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-sale',
  standalone:true,
  imports: [CommonModule, RouterModule, AgentPlanTable, DocumentUpload, FormsModule],
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

  // Registration modal state
  showRegistrationModal = signal(false);
  isRegistering = signal(false);
  registrationError = signal<string | null>(null);
  newCustomer = signal<{name: string; email: string; password: string}>({
    name: '',
    email: '',
    password: ''
  });

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
          // Customer not found - show registration modal
          this.openRegistrationModal(email, plan);
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
        // Customer not found - show registration modal
        this.openRegistrationModal(email, plan);
      },
    });
  }

  // Registration Modal Methods
  openRegistrationModal(email: string, plan: IInsurancePlan) {
    this.newCustomer.set({ name: '', email: email, password: '' });
    this.pendingPlan.set(plan);
    this.registrationError.set(null);
    this.showRegistrationModal.set(true);
  }

  closeRegistrationModal() {
    this.showRegistrationModal.set(false);
    this.registrationError.set(null);
    this.pendingPlan.set(null);
  }

  updateNewCustomer(field: 'name' | 'email' | 'password', value: string) {
    this.newCustomer.update(current => ({ ...current, [field]: value }));
    this.registrationError.set(null);
  }

  isRegistrationValid(): boolean {
    const customer = this.newCustomer();
    return !!(
      customer.name.trim().length >= 2 &&
      customer.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) &&
      customer.password.length >= 6
    );
  }

  registerCustomer() {
    if (!this.isRegistrationValid()) {
      this.registrationError.set('Please fill all fields correctly.');
      return;
    }

    const customer = this.newCustomer();
    const plan = this.pendingPlan();
    const agentId = this.auth.getUserId();

    if (!plan || !agentId) {
      this.registrationError.set('Unable to proceed. Please try again.');
      return;
    }

    this.isRegistering.set(true);
    this.registrationError.set(null);

    const newUser: IUser = {
      name: customer.name.trim(),
      email: customer.email.trim(),
      password: customer.password,
      role: ERole.ROLE_USER
    };

    this.auth.register(newUser).subscribe({
      next: () => {
        this.isRegistering.set(false);
        this.showRegistrationModal.set(false);
        
        // Update the customer email field
        this.customerEmail.set(customer.email);
        
        // Get the newly registered user and proceed
        this.auth.getUserByEmail(customer.email).subscribe({
          next: (registeredUser) => {
            if (registeredUser?.id) {
              // Show document upload modal for the new user
              this.pendingCustomer.set(registeredUser);
              this.pendingPlan.set(plan);
              this.showDocumentUpload.set(true);
              
              this.dialogService.success('Customer registered successfully! Please upload verification documents.');
            } else {
              this.errorMessage.set('Registration successful. Please try selecting the plan again.');
            }
          },
          error: () => {
            this.errorMessage.set('Registration successful. Please try selecting the plan again.');
          }
        });
      },
      error: (err) => {
        this.isRegistering.set(false);
        const message = err.error?.message || err.error || 'Registration failed. Email may already exist.';
        this.registrationError.set(message);
      }
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
