import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';
import { ERole } from '../models/user.model';
import { map } from 'rxjs';

export const roleGuard = (allowedRoles: ERole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(Auth);
    const router = inject(Router);

    return authService.user$.pipe(
      map(user => {
        if (!user) {
          router.navigate(['/auth/login']);
          return false;
        }

        if (allowedRoles.includes(user.role)) {
          return true;
        }

        router.navigate(['/unauthorized']);
        return false;
      })
    );
  };
};
