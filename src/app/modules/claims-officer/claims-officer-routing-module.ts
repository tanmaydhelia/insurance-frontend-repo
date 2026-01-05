import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimsOfficerDashboard } from './pages/claims-officer-dashboard/claims-officer-dashboard';
import { ClaimDetails } from './pages/claim-details/claim-details';
import { ClaimsOfficerAnalytics } from './pages/claims-officer-analytics/claims-officer-analytics';
import { ApprovedClaims } from './pages/approved-claims/approved-claims';
import { RejectedClaims } from './pages/rejected-claims/rejected-claims';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ClaimsOfficerDashboard },
  { path: 'analytics', component: ClaimsOfficerAnalytics },
  { path: 'approved', component: ApprovedClaims },
  { path: 'rejected', component: RejectedClaims },
  { path: 'details/:id', component: ClaimDetails }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimsOfficerRoutingModule { }
