/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  code: number;
  message?: string;
  results: T;
}

/**
 * Authentication models
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string;
  role: string;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/**
 * Driver models
 */
export interface DriverResponse {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
  rating: number;
  totalRides: number;
  avatar?: string;
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
  customerId: string;
  driverId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  fare: number;
  distance: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface RideRequest {
  customerId: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare?: number;
  distance?: number;
}

export interface UpdateRideStatusRequest {
  status: string;
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
