export type VehicleType = 'CAR' | 'MOTORBIKE';
export type VehicleStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Vehicle {
  id?: string;
  vehicleType: VehicleType;
  licensePlate: string;
  vehicleBrand: string;
  vehicleColor: string;
  imageUrl?: string | null;
  status?: VehicleStatus;
}
