import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  constructor(private api: Api) {}

  // getDashboardStats(): Observable<IStats> {
  //   return of({
  //     totalUsers: 150,
  //     totalPlans: 8,
  //     activePolicies: 89,
  //     pendingClaims: 5,
  //     totalRevenue: 1200000
  //   });
  // }
}
