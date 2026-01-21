import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, RateResponse, RateRequest } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class RateService extends ApiService {
  createRating(request: RateRequest): Observable<ApiResponse<RateResponse>> {
    return this.post<ApiResponse<RateResponse>>('/rate', request);
  }

  getRatingById(id: string): Observable<ApiResponse<RateResponse>> {
    return this.get<ApiResponse<RateResponse>>(`/rate/${id}`);
  }

  getRatingsGivenByUser(userId: string): Observable<ApiResponse<RateResponse[]>> {
    return this.get<ApiResponse<RateResponse[]>>(`/rate/given/${userId}`);
  }

  getRatingsReceivedByUser(userId: string): Observable<ApiResponse<RateResponse[]>> {
    return this.get<ApiResponse<RateResponse[]>>(`/rate/received/${userId}`);
  }

  getAverageRating(userId: string): Observable<ApiResponse<number>> {
    return this.get<ApiResponse<number>>(`/rate/average/${userId}`);
  }

  updateRating(id: string, request: RateRequest): Observable<ApiResponse<RateResponse>> {
    return this.put<ApiResponse<RateResponse>>(`/rate/${id}`, request);
  }

  deleteRating(id: string): Observable<ApiResponse<string>> {
    return this.delete<ApiResponse<string>>(`/rate/${id}`);
  }
}
