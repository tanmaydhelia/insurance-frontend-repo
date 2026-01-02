import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ERole, IAuthRequest, IChangePasswordRequest, IUser } from '../../models/user.model';
import { Api } from '../api/api';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private userSubject = new BehaviorSubject<IUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private api: Api, private router: Router) {
    this.loadUserFromToken();
  }

  login(credentials: IAuthRequest): Observable<string> {
    return this.api.postText('/auth/token', credentials).pipe(
      tap((token) => {
        localStorage.setItem('token', token);
        this.decodeAndSetUser(token);
      })
    );
  }

  register(user: IUser): Observable<string> {
    return this.api.postText('/auth/register', user);
  }

  changePassword(req: IChangePasswordRequest): Observable<string> {
    return this.api.putText('/auth/change-password', req);
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  hasRole(role: ERole): boolean {
    return this.userSubject.value?.role === role;
  }

  getUserId(): number | undefined {
    return this.userSubject.value?.id;
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) this.decodeAndSetUser(token);
  }

  private decodeAndSetUser(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      
      this.userSubject.next({
        name: decoded.sub, 
        email: decoded.email, 
        role: decoded.roles,
        id: decoded.userId 
      });
    } catch (error) {
      console.error('Invalid Token', error);
      this.logout();
    }
  }
}


