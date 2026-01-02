import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberRoutingModule } from './member-routing-module';
import { MemberDashboard } from './pages/member-dashboard/member-dashboard';
import { RaiseClaims } from './pages/raise-claims/raise-claims';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MemberRoutingModule,
    MemberDashboard,
    RaiseClaims
  ]
})
export class MemberModule { }
