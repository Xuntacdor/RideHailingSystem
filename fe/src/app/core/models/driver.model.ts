/**
 * Driver
 */
export interface DriverResponse {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
  rating: number;
  totalRides: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRequest {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
}

/**
 * Vehicle
 */
export interface VehicleRegisterResponse {
  id: string;
  driverId: string;
  //make: string;
  //model: string;
  //year: number;
  vehicleColor: string;
  licenseNumber: string;
  vehicleType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRegisterRequest {
  driverId: string;
  //make: string;
  //model: string;
  //year: number;
  vehicleColor: string;
  licenseNumber: string;
  vehicleType: string;
}
