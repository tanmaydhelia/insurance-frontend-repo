import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProviderRoutingModule } from './provider-routing-module';
import { ProviderSubmitClaim } from './pages/provider-submit-claim/provider-submit-claim';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProviderRoutingModule,
    ProviderSubmitClaim
  ]
})
export class ProviderModule { }
