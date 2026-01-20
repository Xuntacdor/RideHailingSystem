import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different error status codes
      switch (error.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('Unauthorized access - redirecting to login');
          localStorage.removeItem('auth_token');
          router.navigate(['/login']);
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden - insufficient permissions');
          // Optionally redirect to an error page
          // router.navigate(['/forbidden']);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', error.url);
          break;

        case 500:
          // Server error
          console.error('Server error:', error.message);
          break;

        case 0:
          // Network error or CORS issue
          console.error('Network error - unable to reach server');
          break;

        default:
          console.error('HTTP Error:', error);
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  console.log(`🚀 HTTP Request: ${req.method} ${req.url}`);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;
      console.error(
        `❌ HTTP Error: ${req.method} ${req.url} - ${error.status} ${error.statusText} (${duration}ms)`
      );
      return throwError(() => error);
    })
  );
};

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Check if we have cached data
  const cachedData = cache.get(req.url);
  if (cachedData) {
    const age = Date.now() - cachedData.timestamp;
    if (age < CACHE_DURATION) {
      console.log(` Serving from cache: ${req.url}`);
      // Return cached response (you'd need to create a proper HttpResponse here)
      // This is simplified for demonstration
    }
  }

  // If not cached or expired, make the request
  return next(req);
};
