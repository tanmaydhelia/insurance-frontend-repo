import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanSearch } from './pages/plan-search/plan-search';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: PlanSearch }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
