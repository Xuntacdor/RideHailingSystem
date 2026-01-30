import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleStatus } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService extends ApiService {


  getVehiclesByDriverId(driverId: string): Observable<ApiResponse<Vehicle[]>> {
    return this.get<ApiResponse<Vehicle[]>>(`/vehicle/driver/${driverId}`);
  }

  getVehiclesByDriverIdHardcode(driverId: string): Observable<ApiResponse<Vehicle[]>> {
    const url = `http://localhost:8080/api/vehicle/driver/${driverId}`;

    return this.http.get<ApiResponse<Vehicle[]>>(url, {
      headers: this.getHeaders(),
    });
  }


  registerVehicle(request: Partial<Vehicle>): Observable<ApiResponse<Vehicle>> {
    return this.post<ApiResponse<Vehicle>>('/vehicle', request);
  }


  updateVehicle(
    id: string,
    payload: Partial<Vehicle>
  ): Observable<ApiResponse<Vehicle>> {
    return this.put<ApiResponse<Vehicle>>(`/vehicle/${id}`, payload);
  }

  updateVehicleStatus(
    id: string,
    status: VehicleStatus
  ): Observable<ApiResponse<Vehicle>> {
    return this.put<ApiResponse<Vehicle>>(
      `/vehicle/${id}/status?status=${status}`,
      {}
    );
  }

  deleteVehicle(id: string): Observable<ApiResponse<string>> {
    return this.delete<ApiResponse<string>>(`/vehicle/${id}`);
  }

  getVehiclesByStatus(
    status: VehicleStatus
  ): Observable<ApiResponse<Vehicle[]>> {
    return this.get<ApiResponse<Vehicle[]>>(`/vehicle/status/${status}`);
  }
}
