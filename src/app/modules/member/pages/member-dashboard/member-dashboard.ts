import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { PolicyCard } from '../../container/policy-card/policy-card';
import { Router, RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Auth } from '../../../../core/services/auth/auth';
import { of, switchMap } from 'rxjs';
import { IPolicy } from '../../../../core/models/policy.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-member-dashboard',
  standalone:true,
  imports: [CommonModule, PolicyCard, RouterModule],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.css',
})
export class MemberDashboard{
  private policyService = inject(Policy);
  private authService = inject(Auth);
  private router = inject(Router);

  private userSignal = toSignal(this.authService.user$);

  policies = toSignal<IPolicy[], IPolicy[]>(
    this.authService.user$.pipe(
      switchMap(user => {
        if (!user?.id) {
          return of([]);
        }
        return this.policyService.getMemberPolicies(user.id);
      })
    ), 
    { initialValue: [] } 
  );
  
  isLoading = computed(() => {
    const user = this.userSignal();
    const data = this.policies();
    return !!user && data === undefined; 
  });

  handleRaiseClaim(policyId: number) {
    this.router.navigate(['/member/claim/new', policyId]);
  }

  handleDownload(policyId: number) {
    console.log('Download requested for:', policyId);
  }
}
