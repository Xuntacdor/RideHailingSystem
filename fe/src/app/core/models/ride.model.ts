/**
 * Ride
 */
export interface RideResponse {
  id: string;
  driver?: {
    id: string;
    name: string;
    phoneNumber: string;
    avatarUrl?: string;
    rating?: number;
  };
  customer?: {
    id: string;
    name: string;
    phoneNumber: string;
    imageUrl?: string;
  };
  startTime: number;
  endTime?: number;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  distance: number;
  fare: number;
  status: 'PENDING' | 'CONFIRMED' | 'PICKINGUP' | 'ONGOING' | 'FINISHED' | 'CANCELLED';
  vehicleType: 'MOTORBIKE' | 'CAR' | 'CAR_7_SEATS';
  startAddress: string;
  endAddress: string;
  reviews?: any[];
  payments?: any[];
}

export interface RideRequest {
  customerId: string;
  startLocation: string;
  endLocation: string;
  fare?: number;
  distance?: number;
}

export interface UpdateRideStatusRequest {
  status: string;
}

/**
 * Coupon
 */
export interface CouponResponse {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxUsage: number;
  currentUsage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
}

export interface CouponRequest {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxUsage: number;
  validFrom: string;
  validTo: string;
}

export interface ApplyCouponRequest {
  couponCode: string;
  userId: string;
  rideId?: string;
}

/**
 * Rate
 */
export interface RateResponse {
  id: string;
  userId: string;
  ratedUserId: string;
  rating: number;
  comment?: string;
  rideId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateRequest {
  userId: string;
  ratedUserId: string;
  rating: number;
  comment?: string;
  rideId?: string;
}
