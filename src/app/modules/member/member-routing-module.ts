import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberDashboard } from './pages/member-dashboard/member-dashboard';
import { RaiseClaims } from './pages/raise-claims/raise-claims';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MemberDashboard },
  { path: 'claim/new/:id', component: RaiseClaims }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
