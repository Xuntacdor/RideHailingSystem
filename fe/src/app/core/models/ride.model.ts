/**
 * Ride
 */
export interface RideResponse {
  id: string;
  customerId: string;
  driverId?: string;
  startLocation: string;
  endLocation: string;
  status: string;
  fare: number;
  distance: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
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
