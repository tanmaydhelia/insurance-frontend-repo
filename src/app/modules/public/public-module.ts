import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing-module';
import { PlanSearch } from './pages/plan-search/plan-search';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PublicRoutingModule,
    PlanSearch
  ]
})
export class PublicModule { }
