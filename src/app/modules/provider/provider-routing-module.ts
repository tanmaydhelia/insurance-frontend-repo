import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderSubmitClaim } from './pages/provider-submit-claim/provider-submit-claim';

const routes: Routes = [
  { path: '', redirectTo: 'submit', pathMatch: 'full' },
  { path: 'submit', component: ProviderSubmitClaim }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
