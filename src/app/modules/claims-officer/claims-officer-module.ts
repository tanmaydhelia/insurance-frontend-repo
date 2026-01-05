import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimsOfficerRoutingModule } from './claims-officer-routing-module';
import { ClaimsOfficerDashboard } from './pages/claims-officer-dashboard/claims-officer-dashboard';
import { ClaimDetails } from './pages/claim-details/claim-details';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ClaimsOfficerRoutingModule,
    ClaimsOfficerDashboard,
    ClaimDetails
  ]
})
export class ClaimsOfficerModule { }
