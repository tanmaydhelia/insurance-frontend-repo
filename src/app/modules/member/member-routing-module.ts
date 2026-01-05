import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberDashboard } from './pages/member-dashboard/member-dashboard';
import { RaiseClaims } from './pages/raise-claims/raise-claims';
import { ClaimHistory } from './pages/claim-history/claim-history';
import { MemberAnalytics } from './pages/member-analytics/member-analytics';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MemberDashboard },
  { path: 'analytics', component: MemberAnalytics },
  { path: 'claim/new/:id', component: RaiseClaims },
  { path: 'claims', component: ClaimHistory }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
