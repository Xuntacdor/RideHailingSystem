import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DriverResponse, DriverRequest } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class DriverService extends ApiService {
  createDriver(request: DriverRequest): Observable<ApiResponse<DriverResponse>> {
    return this.post<ApiResponse<DriverResponse>>('/driver', request);
  }

  getDriverById(id: string): Observable<ApiResponse<DriverResponse>> {
    return this.get<ApiResponse<DriverResponse>>(`/driver/${id}`);
  }

  getDriverByUserId(userId: string): Observable<ApiResponse<DriverResponse>> {
    return this.get<ApiResponse<DriverResponse>>(`/driver/user/${userId}`);
  }

  updateDriver(id: string, request: DriverRequest): Observable<ApiResponse<DriverResponse>> {
    return this.put<ApiResponse<DriverResponse>>(`/driver/${id}`, request);
  }

  updateDriverStatus(id: string, status: string): Observable<ApiResponse<DriverResponse>> {
    return this.put<ApiResponse<DriverResponse>>(`/driver/${id}/status?status=${status}`, {});
  }

  uploadDriverAvatar(id: string, file: File): Observable<ApiResponse<DriverResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadFile<ApiResponse<DriverResponse>>(`/driver/${id}/avatar`, formData);
  }

  getAllDrivers(): Observable<ApiResponse<DriverResponse[]>> {
    return this.get<ApiResponse<DriverResponse[]>>('/driver');
  }

  getDriversByStatus(status: string): Observable<ApiResponse<DriverResponse[]>> {
    return this.get<ApiResponse<DriverResponse[]>>(`/driver/status/${status}`);
  }
}
