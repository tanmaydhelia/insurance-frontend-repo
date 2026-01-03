import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentRoutingModule } from './agent-routing-module';
import { AgentDashboard } from './pages/agent-dashboard/agent-dashboard';
import { NewSale } from './pages/new-sale/new-sale';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AgentRoutingModule,
    AgentDashboard,
    NewSale
  ]
})
export class AgentModule { }
