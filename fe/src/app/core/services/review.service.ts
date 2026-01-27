import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, UserResponse } from '../models/api-response.model';

export interface ReviewRequest {
  rideId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  rideId: string;
  reviewer: UserResponse;
  reviewee: UserResponse;
  rating: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService extends ApiService {
  
  createReview(request: ReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.post<ApiResponse<ReviewResponse>>('/api/review', request);
  }

  getReviewById(id: string): Observable<ApiResponse<ReviewResponse>> {
    return this.get<ApiResponse<ReviewResponse>>(`/api/review/${id}`);
  }

  getReviewsByRideId(rideId: string): Observable<ApiResponse<ReviewResponse[]>> {
    return this.get<ApiResponse<ReviewResponse[]>>(`/api/review/ride/${rideId}`);
  }

  getReviewsByReviewerId(reviewerId: string): Observable<ApiResponse<ReviewResponse[]>> {
    return this.get<ApiResponse<ReviewResponse[]>>(`/api/review/reviewer/${reviewerId}`);
  }

  getReviewsByRevieweeId(revieweeId: string): Observable<ApiResponse<ReviewResponse[]>> {
    return this.get<ApiResponse<ReviewResponse[]>>(`/api/review/reviewee/${revieweeId}`);
  }

  getAverageRating(revieweeId: string): Observable<ApiResponse<number>> {
    return this.get<ApiResponse<number>>(`/api/review/average/${revieweeId}`);
  }

  getReviewCount(revieweeId: string): Observable<ApiResponse<number>> {
    return this.get<ApiResponse<number>>(`/api/review/count/${revieweeId}`);
  }

  updateReview(id: string, request: ReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.put<ApiResponse<ReviewResponse>>(`/api/review/${id}`, request);
  }

  deleteReview(id: string): Observable<ApiResponse<string>> {
    return this.delete<ApiResponse<string>>(`/api/review/${id}`);
  }
}
