import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

export const publicGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Nếu đã đăng nhập, không cho vào trang login/register nữa, chuyển về profile
  if (authService.isLoggedIn()) {
    console.log('Already logged in - Redirecting to profile');
    return router.createUrlTree(['/profile']);
  }

  // Nếu chưa đăng nhập, cho phép truy cập
  return true;
};
