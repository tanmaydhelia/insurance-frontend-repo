import { Component, inject, signal, computed } from '@angular/core';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IPolicy, PolicyStatus } from '../../../../core/models/policy.model';

@Component({
  selector: 'app-agent-dashboard',
  standalone:true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-dashboard.html',
  styleUrl: './agent-dashboard.css',
})
export class AgentDashboard {
  private policyService = inject(Policy);
  private auth = inject(Auth);

  readonly PolicyStatus = PolicyStatus;

  // State
  sendingReminder = signal<number | null>(null);
  reminderSent = signal<number[]>([]);
  reminderError = signal<string | null>(null);
  activeTab = signal<'all' | 'expiring'>('all');

  private userSignal = toSignal(this.auth.user$);

  policies = toSignal(
    this.auth.user$.pipe(
      switchMap((user) => {
        if (!user?.id) return of([]);
        return this.policyService.getAgentPolicies(user.id);
      })
    ),
    { initialValue: [] }
  );

  expiringPolicies = toSignal(
    this.auth.user$.pipe(
      switchMap((user) => {
        if (!user?.id) return of([]);
        return this.policyService.getExpiringPoliciesByAgent(user.id, 30);
      })
    ),
    { initialValue: [] }
  );

  // Computed values for dashboard stats
  totalPolicies = computed(() => this.policies()?.length || 0);
  activePolicies = computed(() => 
    this.policies()?.filter(p => p.status === PolicyStatus.ACTIVE).length || 0
  );
  expiringCount = computed(() => this.expiringPolicies()?.length || 0);
  totalPremium = computed(() => 
    this.policies()?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0
  );

  displayedPolicies = computed(() => {
    if (this.activeTab() === 'expiring') {
      return this.expiringPolicies() || [];
    }
    return this.policies() || [];
  });

  setActiveTab(tab: 'all' | 'expiring') {
    this.activeTab.set(tab);
  }

  sendRenewalReminder(policy: IPolicy) {
    const user = this.userSignal();
    if (!user?.id) return;

    this.sendingReminder.set(policy.id);
    this.reminderError.set(null);

    this.policyService.sendRenewalReminder(policy.id, user.id).subscribe({
      next: () => {
        this.reminderSent.update(ids => [...ids, policy.id]);
        this.sendingReminder.set(null);
      },
      error: (err) => {
        this.reminderError.set(err.message || 'Failed to send reminder');
        this.sendingReminder.set(null);
      }
    });
  }

  isReminderSent(policyId: number): boolean {
    return this.reminderSent().includes(policyId);
  }

  isSendingReminder(policyId: number): boolean {
    return this.sendingReminder() === policyId;
  }

  getDaysRemainingClass(days?: number): string {
    if (days === undefined) return 'text-gray-600';
    if (days <= 7) return 'text-red-600 font-bold';
    if (days <= 14) return 'text-orange-600 font-semibold';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  }

  getStatusColor(status: PolicyStatus): string {
    switch (status) {
      case PolicyStatus.ACTIVE: return 'bg-emerald-500';
      case PolicyStatus.EXPIRED: return 'bg-gray-500';
      case PolicyStatus.CANCELLED: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  closeReminderError() {
    this.reminderError.set(null);
  }
}
