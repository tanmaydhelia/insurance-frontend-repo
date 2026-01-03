import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberRoutingModule } from './member-routing-module';
import { MemberDashboard } from './pages/member-dashboard/member-dashboard';
import { RaiseClaims } from './pages/raise-claims/raise-claims';
import { ClaimHistory } from './pages/claim-history/claim-history';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MemberRoutingModule,
    MemberDashboard,
    RaiseClaims,
    ClaimHistory
  ]
})
export class MemberModule { }
