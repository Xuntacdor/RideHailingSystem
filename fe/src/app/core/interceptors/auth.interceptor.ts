import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap, of } from 'rxjs';

function getCookie(name: string): string | null {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');

  const csrfToken = getCookie('XSRF-TOKEN');

  const publicEndpoints = ['/auth/login', '/auth/register'];

  const isPublic = publicEndpoints.some((url) => req.url.includes(url));

  const isMutationRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

  let headers = req.headers;

  if (token && !isPublic) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (isMutationRequest && csrfToken && !isPublic) {
    headers = headers.set('X-XSRF-TOKEN', csrfToken);
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Hết phiên đăng nhập hoặc Token không hợp lệ.');
        localStorage.removeItem('auth_token');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.error('Không có quyền truy cập (Forbidden).');
      }

      return throwError(() => error);
    })
  );
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  console.log(`Request sending: ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`Request success: ${req.url} - Status ${event.status} (${duration}ms)`);
        }
      },

      error: (error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        console.error(`Request failed: ${req.url} - Status ${error.status} (${duration}ms)`);
      },
    })
  );
};

const cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  const allowedCacheUrls = ['/api/provinces', '/api/vehicle-types'];
  const isAllowed = allowedCacheUrls.some((url) => req.url.includes(url));

  if (!isAllowed) {
    return next(req);
  }

  const cachedEntry = cache.get(req.url);
  if (cachedEntry) {
    const age = Date.now() - cachedEntry.timestamp;
    if (age < CACHE_DURATION) {
      console.log(`Serving from cache: ${req.url}`);

      return of(cachedEntry.response.clone());
    } else {
      cache.delete(req.url);
    }
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log(`Saving to cache: ${req.url}`);
        cache.set(req.url, { response: event.clone(), timestamp: Date.now() });
      }
    })
  );
};
