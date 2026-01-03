import { Component, inject } from '@angular/core';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  policies = toSignal(
    this.auth.user$.pipe(
      switchMap((user) => {
        if (!user?.id) return of([]);
        return this.policyService.getAgentPolicies(user.id);
      })
    )
  );
}
