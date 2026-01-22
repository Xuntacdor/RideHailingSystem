import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap, of } from 'rxjs';

// --- 1. AUTH INTERCEPTOR ---
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Sửa lại key cho đúng với lúc login (ví dụ: 'token' hoặc 'accessToken')
  const token = localStorage.getItem('token');

  // Danh sách các URL không cần đính kèm Token (Public API)
  const publicEndpoints = ['/auth/login', '/auth/register'];

  // Check xem URL hiện tại có nằm trong danh sách public không
  const isPublic = publicEndpoints.some((url) => req.url.includes(url));

  let authReq = req;

  // Chỉ gắn token nếu có token VÀ không phải là public api
  if (token && !isPublic) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Xử lý các mã lỗi
      if (error.status === 401) {
        console.error('Hết phiên đăng nhập hoặc Token không hợp lệ.');
        localStorage.removeItem('token'); // Xóa token cũ
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.error('Không có quyền truy cập (Forbidden).');
        // router.navigate(['/403']); // Tùy chọn
      }

      return throwError(() => error);
    })
  );
};

// --- 2. LOGGING INTERCEPTOR (Đã thêm log success) ---
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  console.log(`Request sending: ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      // Log khi thành công
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`Request success: ${req.url} - Status ${event.status} (${duration}ms)`);
        }
      },
      // Log khi thất bại (để catchError bên dưới xử lý logic, ở đây chỉ log)
      error: (error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        console.error(`Request failed: ${req.url} - Status ${error.status} (${duration}ms)`);
      },
    })
  );
};

// --- 3. CACHE INTERCEPTOR (Đã sửa logic trả về Cache & Lưu Cache) ---
// Lưu ý: Cân nhắc kỹ trước khi dùng. Chỉ dùng cho data tĩnh.

const cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Chỉ cache GET
  if (req.method !== 'GET') {
    return next(req);
  }

  // QUAN TRỌNG: Chỉ cache các URL cụ thể để tránh lỗi bảo mật user data
  // Ví dụ: chỉ cache danh sách tỉnh thành, danh mục xe
  const allowedCacheUrls = ['/api/provinces', '/api/vehicle-types'];
  const isAllowed = allowedCacheUrls.some((url) => req.url.includes(url));

  if (!isAllowed) {
    return next(req);
  }

  // 1. Kiểm tra cache có sẵn không
  const cachedEntry = cache.get(req.url);
  if (cachedEntry) {
    const age = Date.now() - cachedEntry.timestamp;
    if (age < CACHE_DURATION) {
      console.log(`Serving from cache: ${req.url}`);
      // Trả về Observable chứa data từ cache
      return of(cachedEntry.response.clone());
    } else {
      // Cache hết hạn thì xóa
      cache.delete(req.url);
    }
  }

  // 2. Nếu chưa có cache, gọi API và lưu lại kết quả
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log(`Saving to cache: ${req.url}`);
        cache.set(req.url, { response: event.clone(), timestamp: Date.now() });
      }
    })
  );
};
