import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable } from 'rxjs';
import { ERole, ICreateStaffRequest, IUpdateUserRequest, IUser } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  private BASE_PATH = '/admin';

  constructor(private api: Api) {}

  // ==================== User Management ====================

  /**
   * Create a new staff user (agent, claims officer, provider, admin)
   */
  createStaffUser(request: ICreateStaffRequest): Observable<IUser> {
    return this.api.post<IUser>(`${this.BASE_PATH}/users`, request);
  }

  /**
   * Get all staff users (agents, officers, providers, admins)
   */
  getStaffUsers(): Observable<IUser[]> {
    return this.api.get<IUser[]>(`${this.BASE_PATH}/users/staff`);
  }

  /**
   * Get all users in the system
   */
  getAllUsers(): Observable<IUser[]> {
    return this.api.get<IUser[]>(`${this.BASE_PATH}/users`);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: ERole): Observable<IUser[]> {
    return this.api.get<IUser[]>(`${this.BASE_PATH}/users/role/${role}`);
  }

  /**
   * Suspend a user account
   */
  suspendUser(userId: number): Observable<IUser> {
    return this.api.put<IUser>(`${this.BASE_PATH}/users/${userId}/suspend`, {});
  }

  /**
   * Activate a suspended user account
   */
  activateUser(userId: number): Observable<IUser> {
    return this.api.put<IUser>(`${this.BASE_PATH}/users/${userId}/activate`, {});
  }

  /**
   * Update user details
   */
  updateUser(userId: number, request: IUpdateUserRequest): Observable<IUser> {
    return this.api.put<IUser>(`${this.BASE_PATH}/users/${userId}`, request);
  }

  /**
   * Delete a user (cannot delete admin accounts)
   */
  deleteUser(userId: number): Observable<void> {
    return this.api.delete<void>(`${this.BASE_PATH}/users/${userId}`);
  }
}
