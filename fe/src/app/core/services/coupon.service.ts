import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiResponse,
  CouponResponse,
  CouponRequest,
  ApplyCouponRequest,
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CouponService extends ApiService {

  createCoupon(request: CouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.post<ApiResponse<CouponResponse>>('/coupon', request);
  }

  getCouponById(id: string): Observable<ApiResponse<CouponResponse>> {
    return this.get<ApiResponse<CouponResponse>>(`/coupon/${id}`);
  }

  getCouponByCode(code: string): Observable<ApiResponse<CouponResponse>> {
    return this.get<ApiResponse<CouponResponse>>(`/coupon/code/${code}`);
  }

  validateCoupon(code: string, userId: string): Observable<ApiResponse<CouponResponse>> {
    return this.post<ApiResponse<CouponResponse>>(
      `/coupon/validate?code=${code}&userId=${userId}`,
      {}
    );
  }

  applyCoupon(request: ApplyCouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.post<ApiResponse<CouponResponse>>('/coupon/apply', request);
  }

  getUserCouponUsage(userId: string): Observable<ApiResponse<CouponResponse[]>> {
    return this.get<ApiResponse<CouponResponse[]>>(`/coupon/user/${userId}`);
  }

  updateCoupon(id: string, request: CouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.put<ApiResponse<CouponResponse>>(`/coupon/${id}`, request);
  }

  deactivateCoupon(id: string): Observable<ApiResponse<CouponResponse>> {
    return this.put<ApiResponse<CouponResponse>>(`/coupon/${id}/deactivate`, {});
  }

  getActiveCoupons(): Observable<ApiResponse<CouponResponse[]>> {
    return this.get<ApiResponse<CouponResponse[]>>('/coupon/active');
  }

  getUserAvailableCoupons(userId: string): Observable<ApiResponse<CouponResponse[]>> {
    return this.get<ApiResponse<CouponResponse[]>>(`/coupon/user/${userId}/available`);
  }

  assignCouponToUser(userId: string, couponId: string): Observable<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(`/coupon/admin/assign?userId=${userId}&couponId=${couponId}`, {});
  }
}
