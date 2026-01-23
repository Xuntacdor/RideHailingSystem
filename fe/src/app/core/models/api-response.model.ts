/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  code: number;
  message?: string;
  results: T;
}

export interface jwtPayload {
  sub: string;
  name: string;
  userId: string;
  driverId?: string; // Optional: for drivers only
  imageUrl?: string;
  scope: string;
  exp: number;
  iat: number;
}

/**
 * Authentication models
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  cccd?: string;
  imageUrl?: string;
  accountType?: string;
}

export interface AuthenticationResponse {
  token: string;
  user: UserResponse;
  userId: string;
  email: string;
  role: string;
}

/**
 * User models
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  imageUrl?: string;
  role: string;
  userName: string;
  cccd?: string;
  accountType?: string;


}

export interface UserRequest {
  name: string;
  userName: string;
  phoneNumber: string;
  password: string;
  role: string;
  email?: string;
  cccd?: string;
  imageUrl?: string;
  accountType?: string;
}

/**
 * Driver models
 */
export interface DriverResponse {
  id: string;
  user: UserResponse;
  licenseNumber: string;
  driverStatus: string;
  address: string;
  avatarUrl: string;
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
 * Ride models
 */
export interface RideResponse {
  id: string;
  customer?: UserResponse;
  driver?: DriverResponse;
  pickupLocation?: string; // Backend uses startLocation
  dropoffLocation?: string; // Backend uses endLocation
  startLocation: string;
  endLocation: string;
  status: string;
  fare: number;
  distance: number;
  startTime?: number;
  endTime?: number;
  vehicleType: string;
}

export interface RideRequest {
  customerId: string;
  driverId?: string;
  startTime?: number;
  endTime?: number;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  customerLatitude: number;
  customerLongitude: number;
  distance: number;
  fare: number;
  status?: string;
  vehicleType: string;
}

export interface CreateRideResponse {
  rideRequestId: string;
  status: string;
  message: string;
  nearestDriversCount: number;
}

export interface UpdateRideStatusRequest {
  status: string;
}

export interface RideStatusUpdate {
  type: string;
  rideId: string;
  status: string;
  timestamp: number;
}

export enum RideStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKINGUP = 'PICKINGUP',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  REJECTED = 'REJECTED'
}


/**
 * Coupon models
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
 * Rate models
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

/**
 * Support Ticket models
 */
export interface SupportTicketResponse {
  id: string;
  userId: string;
  agentId?: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportTicketRequest {
  userId: string;
  subject: string;
  description: string;
  priority?: string;
}

/**
 * Vehicle models
 */
export interface VehicleRegisterResponse {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRegisterRequest {
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: string;
}

/**
 * Enums
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum Role {
  USER = 'USER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Driver Position Update (WebSocket)
 */
export interface DriverPositionUpdate {
  driverId: string;
  lat: number;
  lng: number;
  timestamp: string;
  bearing?: number;
}
