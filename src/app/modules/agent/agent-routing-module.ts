import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentDashboard } from './pages/agent-dashboard/agent-dashboard';
import { NewSale } from './pages/new-sale/new-sale';
import { AgentAnalytics } from './pages/agent-analytics/agent-analytics';
import { MyCustomers } from './pages/my-customers/my-customers';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AgentDashboard },
  { path: 'sale/new', component: NewSale },
  { path: 'analytics', component: AgentAnalytics },
  { path: 'customers', component: MyCustomers }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule { }
