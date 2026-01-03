import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimsOfficerRoutingModule } from './claims-officer-routing-module';
import { ClaimsOfficerDashboard } from './pages/claims-officer-dashboard/claims-officer-dashboard';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ClaimsOfficerRoutingModule,
    ClaimsOfficerDashboard
  ]
})
export class ClaimsOfficerModule { }
