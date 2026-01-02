import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberRoutingModule } from './member-routing-module';
import { MemberDashboard } from './pages/member-dashboard/member-dashboard';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MemberRoutingModule,
    MemberDashboard
  ]
})
export class MemberModule { }
