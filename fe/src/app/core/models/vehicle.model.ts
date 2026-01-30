export interface Vehicle {
  id?: string;

  vehicleType: 'CAR' | 'MOTORBIKE';
  vehicleNumber?: string;

  licenseNumber: string;
  vehicleBrand: string;
  vehicleColor?: string;

  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  imageUrl?: string;
}