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
  authenticated: boolean;
  token: string;
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
  latitude?: number;
  longitude?: number;
  vehicleType?: string;
  vehicleIds?: string[];
  vehicleModel?: string;
  vehiclePlate?: string;
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
  startAddress?: string;
  endAddress?: string;
  status: string;
  fare: number;
  distance: number;
  startTime?: number;
  endTime?: number;
  vehicleType: string;
  driverLat?: number;
  driverLng?: number;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
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
  rideDate?: string;
  endAddress?: string;
  startAddress?: string;
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
  content?: string;
  discountPercentage?: number;
  discountAmount?: number;
  maxUsageLimit?: number;
  usagePerUser?: number;
  expirationDate?: string;
  isActive: boolean;
  couponType: 'DEFAULT' | 'ACHIEVEMENT' | 'ADMIN_CREATED' | 'PROMOTIONAL';
  achievementType?: 'NEW_USER' | 'FIRST_RIDE' | 'RIDES_5' | 'RIDES_10' | 'RIDES_25' | 'RIDES_50';
}

export interface CouponRequest {
  code: string;
  content?: string;
  discountPercentage?: number;
  discountAmount?: number;
  maxUsageLimit?: number;
  usagePerUser?: number;
  expirationDate?: string;
  couponType: 'DEFAULT' | 'ACHIEVEMENT' | 'ADMIN_CREATED' | 'PROMOTIONAL';
  achievementType?: 'NEW_USER' | 'FIRST_RIDE' | 'RIDES_5' | 'RIDES_10' | 'RIDES_25' | 'RIDES_50';
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
  userName?: string;
  agentId?: string;
  assignedAgentName?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportTicketRequest {
  userId: string;
  title: string;
  description: string;
  priority?: string;
}

/**
 * Vehicle models
 */
export interface VehicleRegisterResponse {
  id: string;
  driverId: string;
  vehicleType: 'CAR' | 'MOTORBIKE';
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleColor?: string;
  licenseNumber: string;
  status: VehicleStatus;
  imageUrl?: string;
}

export interface VehicleRegisterRequest {
  driverId: string;
  vehicleType: 'CAR' | 'MOTORBIKE';
  vehicleNumber: string;
  vehicleBrand: string;
  vehicleColor?: string;
  licenseNumber: string;
  status?: VehicleStatus;
  imageUrl?: string | null;
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
  PENDING = 'PENDING',
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

// Pageable response
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}