import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderSubmitClaim } from './pages/provider-submit-claim/provider-submit-claim';
import { ProviderClaims } from './pages/provider-claims/provider-claims';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ProviderSubmitClaim },
  { path: 'claims', component: ProviderClaims }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
