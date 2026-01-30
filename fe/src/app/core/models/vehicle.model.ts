import { VehicleStatus } from './api-response.model';

export interface Vehicle {
  id?: string;

  vehicleType: 'CAR' | 'MOTORBIKE';
  vehicleNumber?: string;

  licenseNumber: string;
  vehicleBrand: string;
  vehicleColor?: string;

  status?: VehicleStatus;
  imageUrl?: string;
}