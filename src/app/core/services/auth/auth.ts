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

  getUsername(): string | undefined {
    return this.userSubject.value?.username;
  }
  getUserEmail(): string | undefined {
    return this.userSubject.value?.email;
  }

  // Get user by email (for agent sales)
  // Using /users endpoint instead of /auth/users to avoid CORS and auth issues
  getUserByEmail(email: string): Observable<IUser> {
    return this.api.get<IUser>(`/auth/users/${email}`);
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) this.decodeAndSetUser(token);
  }

  private decodeAndSetUser(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      
      console.log('Decoded JWT token:', decoded);
      console.log('decoded.sub:', decoded.sub);
      console.log('decoded.username:', decoded.username);
      console.log('decoded.email:', decoded.email);
      
      const username = decoded.sub || decoded.username || decoded.email;
      const displayName = decoded.name || username;
      
      console.log('Extracted username:', username);
      
      if (!username) {
        console.error('No username found in JWT token!');
        throw new Error('Invalid token: no username found');
      }
      
      this.userSubject.next({
        username: username,           
        name: displayName,            
        email: decoded.email, 
        role: decoded.roles,
        id: decoded.userId 
      });
      
      console.log('User set in userSubject:', this.userSubject.value);
    } catch (error) {
      console.error('Invalid Token', error);
      this.logout();
    }
  }
}


