import { Component, inject, signal } from '@angular/core';
import { AgentPlanTable } from '../../container/agent-plan-table/agent-plan-table';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { IInsurancePlan, IPolicyEnrollmentRequest } from '../../../../core/models/policy.model';
import { Dialog } from '../../../../core/services/dialog/dialog';

@Component({
  selector: 'app-new-sale',
  standalone:true,
  imports: [CommonModule, RouterModule, AgentPlanTable],
  templateUrl: './new-sale.html',
  styleUrl: './new-sale.css',
})
export class NewSale {
  private policyService = inject(Policy);
  private auth = inject(Auth);
  private router = inject(Router);
  private dialogService = inject(Dialog);

  // Simple email input for customer
  customerEmail = signal<string>('');
  errorMessage = signal<string | null>(null);

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

    // Get user by email and enroll
    this.auth.getUserByEmail(email).subscribe({
      next: (user) => {
        if (!user?.id) {
          this.errorMessage.set('Customer not found. Please check the email.');
          return;
        }

        this.dialogService.confirm({
          title: 'Confirm Enrollment',
          message: `Enroll ${user.name || email} into ${plan.name}?`,
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
      },
      error: () => {
        this.errorMessage.set('Customer not found with this email.');
      },
    });
  }
}
