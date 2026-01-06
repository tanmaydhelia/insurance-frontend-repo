import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { AdminAnalytics } from './pages/admin-analytics/admin-analytics';
import { UserManagement } from './pages/user-management/user-management';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboard },
  { path: 'analytics', component: AdminAnalytics },
  { path: 'users', component: UserManagement }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
