import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiResponse,
  RideResponse,
  RideRequest,
  UpdateRideStatusRequest,
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class RideService extends ApiService {
  createRide(request: RideRequest): Observable<RideResponse> {
    return this.post<RideResponse>('/rides', request);
  }

  getRideById(id: string): Observable<RideResponse> {
    return this.get<RideResponse>(`/rides/${id}`);
  }

  getAllRides(): Observable<RideResponse[]> {
    return this.get<RideResponse[]>('/rides');
  }

  updateRide(id: string, request: RideRequest): Observable<RideResponse> {
    return this.put<RideResponse>(`/rides/${id}`, request);
  }

  getRidesByDriver(driverId: string): Observable<RideResponse[]> {
    return this.get<RideResponse[]>(`/rides/driver/${driverId}`);
  }

  getRidesByCustomer(customerId: string): Observable<RideResponse[]> {
    return this.get<RideResponse[]>(`/rides/customer/${customerId}`);
  }

  getRidesByUser(userId: string): Observable<RideResponse[]> {
    return this.get<RideResponse[]>(`/rides/user/${userId}`);
  }

  updateRideStatus(rideId: string, status: string): Observable<RideResponse> {
    const request: UpdateRideStatusRequest = { status };
    return this.patch<RideResponse>(`/rides/${rideId}/status`, request);
  }
}
