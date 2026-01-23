import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const userRole = authService.getUserRole();
    console.log('Already logged in - Redirecting to profile');
    return router.createUrlTree(['/profile']);
  }

  return true;
};
