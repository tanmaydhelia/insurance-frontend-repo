import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimsOfficerDashboard } from './pages/claims-officer-dashboard/claims-officer-dashboard';
import { ClaimDetails } from './pages/claim-details/claim-details';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ClaimsOfficerDashboard },
  { path: 'details/:id', component: ClaimDetails }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimsOfficerRoutingModule { }
