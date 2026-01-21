import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiResponse,
  VehicleRegisterResponse,
  VehicleRegisterRequest,
  VehicleStatus,
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService extends ApiService {
  registerVehicle(
    request: VehicleRegisterRequest
  ): Observable<ApiResponse<VehicleRegisterResponse>> {
    return this.post<ApiResponse<VehicleRegisterResponse>>('/vehicle', request);
  }

  getVehicleById(id: string): Observable<ApiResponse<VehicleRegisterResponse>> {
    return this.get<ApiResponse<VehicleRegisterResponse>>(`/vehicle/${id}`);
  }

  getVehiclesByDriverId(driverId: string): Observable<ApiResponse<VehicleRegisterResponse[]>> {
    return this.get<ApiResponse<VehicleRegisterResponse[]>>(`/vehicle/driver/${driverId}`);
  }

  updateVehicle(
    id: string,
    request: VehicleRegisterRequest
  ): Observable<ApiResponse<VehicleRegisterResponse>> {
    return this.put<ApiResponse<VehicleRegisterResponse>>(`/vehicle/${id}`, request);
  }

  updateVehicleStatus(
    id: string,
    status: VehicleStatus
  ): Observable<ApiResponse<VehicleRegisterResponse>> {
    return this.put<ApiResponse<VehicleRegisterResponse>>(
      `/vehicle/${id}/status?status=${status}`,
      {}
    );
  }

  deleteVehicle(id: string): Observable<ApiResponse<string>> {
    return this.delete<ApiResponse<string>>(`/vehicle/${id}`);
  }

  getVehiclesByStatus(status: VehicleStatus): Observable<ApiResponse<VehicleRegisterResponse[]>> {
    return this.get<ApiResponse<VehicleRegisterResponse[]>>(`/vehicle/status/${status}`);
  }
}
