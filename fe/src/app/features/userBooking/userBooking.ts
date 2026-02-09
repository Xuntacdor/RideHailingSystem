import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { TrackAsiaService } from '../../core/services/trackasia.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingTypeService, BookingTypeResponse } from '../../core/services/booking-type.service';
import { RideService } from '../../core/services/ride.service';
import { RideStatusUpdateService } from '../../core/services/ride-status-update.service';
import { DriverPosUpdateService } from '../../driver/services/driverPosUpdate.service';

// Components
import { MapComponent } from '../../components/userBooking/map/map.component';
import { VehicleSelectionComponent } from '../../components/userBooking/vehicle-selection/vehicle-selection.component';
import { LocationSearchComponent } from '../../components/userBooking/location-search/location-search.component';
import { RouteInfoComponent } from '../../components/userBooking/route-info/route-info.component';
import {
  CustomerNotificationModalComponent,
  RideNotification,
} from '../../components/customer-notification-modal/customer-notification-modal.component';
import { BookedRideInfoComponent } from '../../components/userBooking/booked-ride-info/booked-ride-info.component';
import {
  RateDriverModalComponent,
  RideCompletionData,
} from '../../components/userBooking/rate-driver-modal/rate-driver-modal.component';
import { PendingBookingComponent } from '../../components/userBooking/pending-booking.component';
import { UserHeaderComponent } from '../../components/userBooking/user-header/user-header.component';
// Models
import { Coordinate, SearchResult, RouteInfo, VehicleType, Driver } from '../../models/models';
import {
  jwtPayload,
  RideRequest,
  DriverPositionUpdate,
} from '../../core/models/api-response.model';

enum RideState {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKINGUP = 'PICKINGUP',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

@Component({
  selector: 'app-user-booking',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    VehicleSelectionComponent,
    LocationSearchComponent,
    RouteInfoComponent,
    CustomerNotificationModalComponent,
    BookedRideInfoComponent,
    RateDriverModalComponent,
    PendingBookingComponent,
    UserHeaderComponent,
  ],
  templateUrl: './userBooking.html',
  styleUrls: [],
})
export class UserBookingComponent implements OnInit, OnDestroy {
  // Constants
  private readonly SEARCH_DEBOUNCE_MS = 300;
  private readonly DRIVER_ROUTE_DEBOUNCE_MS = 3000;
  private readonly DRIVER_MOVEMENT_THRESHOLD_KM = 0;

  // UI State
  isTokenValid = true;
  loading = false;
  selectedVehicle: VehicleType = VehicleType.CAR;
  bookingTypes: BookingTypeResponse[] = [];
  isBookingTypesLoaded = false;
  isBookingInProgress = false;

  // Location State
  origin: Coordinate | null = null;
  destination: Coordinate | null = null;
  routeInfo: RouteInfo | null = null;
  routeGeometry: RouteGeometry | null = null;
  driverRouteGeometry: RouteGeometry | null = null;

  // Search State
  searchSuggestions: SearchResult[] = [];
  showSearchSuggestions = false;
  private searchDebounceTimer: any;

  // Ride State
  rideState: RideState = RideState.IDLE;
  currentRideId: string | null = null;
  currentRideRequestId: string | null = null;
  driverLocation: { lat: number; lng: number } | null = null;
  activeDriver: Driver | null = null;
  notificationData: RideNotification | null = null;
  driverInfo: any | null = null;
  showNotificationModal = false;
  showRateDriverModal = false;
  completionRideData: RideCompletionData | null = null;

  // Driver tracking
  private lastRouteCalculation: { lat: number; lng: number } | null = null;
  private driverRouteDebounceTimer: any;

  // Auth
  jwtPayload: jwtPayload | null = null;
  userName: string;

  // Lifecycle flags
  private isDestroyed = false;

  // Subscriptions
  private subscriptions = new Subscription();
  private rideStatusSubscription?: Subscription;
  private driverPositionSubscription?: Subscription;

  get RideState() {
    return RideState;
  }

  constructor(
    private trackAsiaService: TrackAsiaService,
    private authService: AuthService,
    private bookingTypeService: BookingTypeService,
    private rideService: RideService,
    private rideStatusUpdateService: RideStatusUpdateService,
    private driverPosUpdateService: DriverPosUpdateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.jwtPayload = this.authService.getUserInfo();
    this.userName = this.jwtPayload?.name || '';
  }

  ngOnInit(): void {
    this.loadBookingTypes();
    this.rideService.getActiveRide(this.jwtPayload!.userId).subscribe({
      next: (rideData) => {
        if (rideData) {

          this.currentRideId = rideData.id;

          const statusToStateMap: Record<string, RideState> = {
            'PENDING': RideState.PENDING,
            'CONFIRMED': RideState.CONFIRMED,
            'PICKINGUP': RideState.PICKINGUP,
            'ONGOING': RideState.ONGOING
          };
          this.rideState = statusToStateMap[rideData.status] || RideState.IDLE;

          if (rideData.startLatitude && rideData.startLongitude) {
            this.origin = {
              lat: rideData.startLatitude,
              lng: rideData.startLongitude,
              name: 'Điểm đón'
            };
          }

          if (rideData.endLatitude && rideData.endLongitude) {
            this.destination = {
              lat: rideData.endLatitude,
              lng: rideData.endLongitude,
              name: 'Điểm đến'
            };
          }

          if (rideData.driver && (this.rideState === RideState.CONFIRMED ||
            this.rideState === RideState.PICKINGUP || this.rideState === RideState.ONGOING)) {

            this.driverInfo = {
              name: rideData.driver.user?.name || 'Tài xế',
              avatarUrl: rideData.driver.avatarUrl || 'assets/images/default-avatar.png',
              rating: rideData.driver.rating || 4.5,
              vehicleModel: rideData.driver.vehicleModel || 'Vehicle',
              vehiclePlate: rideData.driver.vehiclePlate || 'N/A',
              phoneNumber: rideData.driver.user?.phoneNumber || 'N/A'
            };

            if (rideData.driverLat && rideData.driverLng) {
              this.driverLocation = {
                lat: rideData.driverLat,
                lng: rideData.driverLng
              };

              this.activeDriver = {
                id: rideData.driver.id || '',
                name: rideData.driver.user?.name || 'Tài xế',
                vehicleType: rideData.vehicleType === 'CAR' ? VehicleType.CAR : VehicleType.MOTORBIKE,
                lng: rideData.driverLng,
                lat: rideData.driverLat,
                rating: rideData.driver.rating || 4.5,
                icon: rideData.vehicleType === 'CAR' ? '🚗' : '🏍️'
              };
            }

            if (rideData.driver.id) {
              this.subscribeToDriverPosition(rideData.driver.id);
            }
          }

          this.subscribeToRideUpdates();

          if (this.origin && this.destination) {
            if (this.rideState === RideState.PICKINGUP || this.rideState === RideState.CONFIRMED) {
              if (this.driverLocation) {
                this.calculateDriverRoute();
              }
            } else if (this.rideState === RideState.ONGOING) {
              this.calculateRouteToDestination();
            }
          }

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching active ride data:', err);
      }
    });
  }

  private loadBookingTypes(): void {
    const sub = this.bookingTypeService.getAllBookingTypes().subscribe({
      next: (types) => {
        this.bookingTypes = types;
        this.isBookingTypesLoaded = true;
        console.log('Loaded booking types:', types);
      },
      error: (error) => {
        console.error('Error loading booking types:', error);
        this.bookingTypes = [];
        this.isBookingTypesLoaded = false;
      },
    });
    this.subscriptions.add(sub);
  }

  onMapReady(): void {
    console.log('Map is ready');
  }

  onTokenInvalid(): void {
    this.isTokenValid = false;
  }

  async onUserLocationDetected(event: { lng: number; lat: number }): Promise<void> {
    try {
      const address = await this.trackAsiaService.reverseGeocode(event.lng, event.lat);
      this.origin = {
        lng: event.lng,
        lat: event.lat,
        name: address || 'Vị trí của bạn',
      };
    } catch (error) {
      console.error('Error detecting user location:', error);
      this.origin = {
        lng: event.lng,
        lat: event.lat,
        name: 'Vị trí của bạn',
      };
    }
  }

  async onBookRide(vehicleType: VehicleType): Promise<void> {
    const validation = this.validateBookingRequest();
    if (!validation.valid) {
      this.showErrorNotification(validation.error || 'Yêu cầu đặt xe không hợp lệ');
      return;
    }

    if (!this.isBookingTypesLoaded) {
      this.showErrorNotification('Đang tải thông tin giá. Vui lòng chờ...');
      return;
    }

    if (this.isBookingInProgress) {
      return;
    }

    this.isBookingInProgress = true;
    this.loading = true;

    try {
      const distanceInMeters = this.routeInfo!.distance * 1000;
      const durationInMinutes = this.routeInfo!.duration;
      const fare = this.calculateFare(vehicleType, this.routeInfo!.distance, durationInMinutes);

      const rideRequest: RideRequest = {
        customerId: this.jwtPayload!.userId,
        startLatitude: this.origin!.lat,
        startLongitude: this.origin!.lng,
        endLatitude: this.destination!.lat,
        endLongitude: this.destination!.lng,
        customerLatitude: this.origin!.lat,
        customerLongitude: this.origin!.lng,
        distance: Math.round(distanceInMeters),
        fare: Math.round(fare),
        vehicleType: this.mapVehicleTypeToBackend(vehicleType),
        startTime: Date.now(),
        rideDate: new Date().toISOString().split('T')[0],
        startAddress: this.origin!.name,
        endAddress: this.destination!.name,
      };
      console.log('Creating ride with request:', rideRequest.rideDate);

      const sub = this.rideService.createRide(rideRequest).subscribe({
        next: (response) => {
          console.log('Ride request created with ID:', response.rideRequestId);
          this.currentRideRequestId = response.rideRequestId;
          this.rideState = RideState.PENDING;
          this.subscribeToRideUpdates();

          this.isBookingInProgress = false;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error creating ride:', error);

          if (error?.error?.code === 1052) {
            this.showNoDriverModal({
              rideRequestId: `failed-${Date.now()}`,
              message: 'Rất tiếc, hiện không có tài xế nào gần đây.',
            });
          } else {
            const errorMessage = this.parseErrorMessage(error);
            this.showErrorNotification(errorMessage);
          }

          this.isBookingInProgress = false;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });

      this.subscriptions.add(sub);
    } catch (error) {
      console.error('Booking error:', error);
      this.showErrorNotification('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      this.isBookingInProgress = false;
      this.loading = false;
    }
  }

  onVehicleSelected(type: VehicleType): void {
    this.selectedVehicle = type;
  }

  private validateBookingRequest(): { valid: boolean; error?: string } {
    if (!this.jwtPayload) {
      return { valid: false, error: 'Vui lòng đăng nhập để đặt xe.' };
    }

    if (!this.origin || !this.destination) {
      return { valid: false, error: 'Vui lòng chọn điểm đón và điểm đến.' };
    }

    if (!this.routeInfo) {
      return {
        valid: false,
        error: 'Không thể tính toán lộ trình. Vui lòng thử chọn lại địa điểm.',
      };
    }

    if (
      !this.isValidCoordinate(this.origin.lat, this.origin.lng) ||
      !this.isValidCoordinate(this.destination.lat, this.destination.lng)
    ) {
      return { valid: false, error: 'Tọa độ không hợp lệ. Vui lòng chọn địa điểm hợp lệ.' };
    }

    const minDistance = 0.1;
    if (this.routeInfo.distance < minDistance) {
      return {
        valid: false,
        error: 'Điểm đón và điểm đến quá gần nhau. Khoảng cách tối thiểu là 100m.',
      };
    }

    return { valid: true };
  }

  private isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
  }

  private calculateFare(vehicleType: VehicleType, distance: number, duration: number): number {
    const bookingType = this.bookingTypes.find((bt) => bt.vehicleType === vehicleType.toString());

    if (bookingType) {
      const { baseFare, pricePerKm, pricePerMinute } = bookingType;
      const extraDistance = Math.max(0, distance - 2);
      const total = baseFare + extraDistance * pricePerKm + duration * pricePerMinute;
      return Math.round(total / 1000) * 1000;
    }

    // Fallback pricing
    const baseFare = 10000;
    const pricePerKm = 5000;
    const pricePerMinute = 1000;
    const multiplier = vehicleType === VehicleType.CAR ? 2.5 : 1.0;
    const extraDistance = Math.max(0, distance - 2);
    const total = (baseFare + extraDistance * pricePerKm + duration * pricePerMinute) * multiplier;
    return Math.round(total / 1000) * 1000;
  }

  private mapVehicleTypeToBackend(vehicleType: VehicleType): string {
    return vehicleType === VehicleType.MOTORBIKE ? 'MOTORBIKE' : 'CAR';
  }

  onSearchChanged(query: string): void {
    clearTimeout(this.searchDebounceTimer);

    if (query.trim().length < 2) {
      this.showSearchSuggestions = false;
      return;
    }

    this.searchDebounceTimer = setTimeout(async () => {
      if (this.isDestroyed) return;

      try {
        this.searchSuggestions = await this.trackAsiaService.search(query, 5);
        this.showSearchSuggestions = this.searchSuggestions.length > 0;
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Search error:', error);
        this.searchSuggestions = [];
        this.showSearchSuggestions = false;
      }
    }, this.SEARCH_DEBOUNCE_MS);
  }

  async onSearchSubmitted(query: string): Promise<void> {
    if (!query.trim()) return;

    try {
      const results = await this.trackAsiaService.search(query, 1);
      if (results[0]) {
        this.selectDestination(results[0]);
      }
    } catch (error) {
      console.error('Search submission error:', error);
      this.showErrorNotification('Tìm kiếm địa điểm thất bại');
    }
  }

  onSuggestionSelected(suggestion: SearchResult): void {
    this.selectDestination(suggestion);
    this.showSearchSuggestions = false;
  }

  private async selectDestination(result: SearchResult): Promise<void> {
    this.destination = {
      lng: result.lng,
      lat: result.lat,
      name: result.display,
    };

    if (this.origin && this.destination) {
      await this.calculateRoute();
    }
  }

  private async calculateRoute(): Promise<void> {
    if (!this.origin || !this.destination) return;

    try {
      const routeData = await this.trackAsiaService.getDirections(
        this.origin.lng,
        this.origin.lat,
        this.destination.lng,
        this.destination.lat
      );

      if (routeData) {
        this.routeInfo = {
          distance: routeData.distance / 1000,
          duration: routeData.duration / 60,
          steps: this.extractRouteSteps(routeData.instructions || []),
        };
        this.routeGeometry = routeData.geometry;
      }
    } catch (error) {
      this.showErrorNotification('Không thể tìm đường. Vui lòng thử lại.');
    }
  }

  private calculateDriverRouteDebounced(location: { lat: number; lng: number }): void {
    if (this.lastRouteCalculation) {
      const distance = this.calculateDistance(
        this.lastRouteCalculation.lat,
        this.lastRouteCalculation.lng,
        location.lat,
        location.lng
      );

      if (distance < this.DRIVER_MOVEMENT_THRESHOLD_KM) {
        return;
      }
    }

    clearTimeout(this.driverRouteDebounceTimer);
    this.driverRouteDebounceTimer = setTimeout(async () => {
      if (this.isDestroyed) return;
      await this.calculateDriverRoute();
      this.lastRouteCalculation = { ...location };
    }, this.DRIVER_ROUTE_DEBOUNCE_MS);
  }

  private async calculateDriverRoute(): Promise<void> {
    if (!this.driverLocation) return;

    let targetLocation: Coordinate | null = null;

    if (this.rideState === RideState.CONFIRMED || this.rideState === RideState.PICKINGUP) {
      targetLocation = this.origin;
    } else if (this.rideState === RideState.ONGOING) {
      targetLocation = this.destination;
    }

    if (!targetLocation) return;

    try {
      const routeData = await this.trackAsiaService.getDirections(
        this.driverLocation.lng,
        this.driverLocation.lat,
        targetLocation.lng,
        targetLocation.lat
      );

      if (routeData) {
        this.driverRouteGeometry = routeData.geometry;

        this.routeInfo = {
          distance: routeData.distance / 1000,
          duration: routeData.duration / 60,
          steps: this.routeInfo?.steps || [],
        };
        this.cdr.detectChanges();
      }
    } catch (error) { }
  }

  onClearRoute(): void {
    this.routeInfo = null;
    this.routeGeometry = null;
    this.destination = null;
  }

  private subscribeToRideUpdates(): void {
    const customerId = this.jwtPayload?.userId;
    if (!customerId) {
      return;
    }

    // Unsubscribe existing subscription
    this.rideStatusSubscription?.unsubscribe();

    this.rideStatusSubscription = this.rideStatusUpdateService
      .subscribeToRideStatusUpdates(customerId)
      .subscribe({
        next: (update) => {
          // Defer handling to next cycle to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.handleRideNotification(update);
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          console.error('WebSocket subscription error:', err);
        },
        complete: () => {
          console.log('WebSocket subscription completed');
        },
      });
  }

  private handleRideNotification(update: any): void {
    switch (update.type) {
      case 'RIDE_ACCEPTED':
        this.currentRideId = update.rideId;
        this.showDriverAssignedModal(update);
        break;
      case 'RIDE_STATUS_UPDATE':
        this.handleRideStatusUpdate(update);
        this.showStatusUpdateModal(update);
        break;
      case 'NO_DRIVER_AVAILABLE':
        this.showNoDriverModal(update);
        break;
      case 'RIDE_CANCELLED':
        this.showCancellationModal(update);
        break;
      default:
        console.log('Unknown notification type:', update.type);
    }
  }

  private showDriverAssignedModal(update: any): void {
    this.rideState = RideState.CONFIRMED;
    this.routeGeometry = null;

    this.subscribeToDriverPosition(update.driverId);

    const driverDetails = {
      name: update.driverName || 'Driver',
      avatarUrl: update.driverAvatar || 'assets/images/default-avatar.png',
      rating: update.driverRating || 4.5,
      vehicleModel: update.vehicleModel || 'Vehicle',
      vehiclePlate: update.vehiclePlate || 'N/A',
      phoneNumber: update.driverPhone || 'N/A',
    };

    this.driverInfo = driverDetails;

    this.notificationData = {
      type: 'RIDE_ACCEPTED',
      rideId: update.rideId,
      driverId: update.driverId,
      driverData: driverDetails,
    };
    this.showNotificationModal = true;

    if (update.driverLat && update.driverLng) {
      this.updateDriverLocation({
        driverId: update.driverId,
        lat: update.driverLat,
        lng: update.driverLng,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.warn('No initial driver location provided in RIDE_ACCEPTED notification');
    }
  }

  private showStatusUpdateModal(update: any): void {
    this.notificationData = {
      type: 'RIDE_STATUS_UPDATE',
      rideId: update.rideId,
      status: update.status,
      timestamp: update.timestamp,
    };
    this.showNotificationModal = true;
  }

  private showNoDriverModal(update: any): void {
    this.rideState = RideState.IDLE;
    this.notificationData = {
      type: 'NO_DRIVER_AVAILABLE',
      rideRequestId: update.rideRequestId,
      message: update.message || 'Không có tài xế nào khả dụng lúc này',
    };
    this.showNotificationModal = true;
  }

  private showCancellationModal(update: any): void {
    const message =
      update.cancelledBy === 'DRIVER' ? 'Tài xế đã hủy chuyến đi' : 'Chuyến đi đã bị hủy';

    this.notificationData = {
      type: 'RIDE_CANCELLED',
      rideId: update.rideId,
      message: message,
      timestamp: update.timestamp,
    };
    this.showNotificationModal = true;

    setTimeout(() => {
      this.resetToIdle();
    }, 3000);
  }

  private subscribeToDriverPosition(driverId: string): void {
    // Unsubscribe existing subscription
    this.driverPositionSubscription?.unsubscribe();

    console.log(`🔔 [USER] Subscribing to driver position updates for driverId: ${driverId}`);

    this.driverPositionSubscription = this.driverPosUpdateService
      .subscribeToDriverPositionUpdates(driverId)
      .subscribe({
        next: (message) => {
          const timestamp = new Date().toLocaleTimeString();
          const update: DriverPositionUpdate = JSON.parse(message.body);

          console.log(`[${timestamp}] 📍 [USER] Received driver position update:`, {
            driverId: update.driverId,
            position: `${update.lat.toFixed(6)}, ${update.lng.toFixed(6)}`,
            timestamp: update.timestamp || 'N/A'
          });

          this.updateDriverLocation(update);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ [USER] Driver position subscription error:', err);
        },
      });
  }

  private async updateDriverLocation(update: DriverPositionUpdate): Promise<void> {
    console.log('🚗 [USER] Updating driver location on map:', {
      from: this.driverLocation ? `${this.driverLocation.lat.toFixed(6)}, ${this.driverLocation.lng.toFixed(6)}` : 'null',
      to: `${update.lat.toFixed(6)}, ${update.lng.toFixed(6)}`
    });

    this.driverLocation = { lat: update.lat, lng: update.lng };

    this.activeDriver = {
      id: update.driverId,
      name: this.notificationData?.driverData?.name || 'Driver',
      vehicleType: this.selectedVehicle,
      lng: update.lng,
      lat: update.lat,
      rating: this.notificationData?.driverData?.rating || 4.5,
      icon: this.selectedVehicle === VehicleType.CAR ? '🚗' : '🏍️',
    };

    this.cdr.detectChanges();

    if (this.driverLocation) {
      this.calculateDriverRouteDebounced(this.driverLocation);
    }
  }

  private async handleRideStatusUpdate(update: any): Promise<void> {
    if (update.driverId && update.driverLat && update.driverLng) {
      await this.updateDriverLocation({
        driverId: update.driverId,
        lat: update.driverLat,
        lng: update.driverLng,
        timestamp: new Date().toISOString(),
      });
    }

    const previousState = this.rideState;
    switch (update.status) {
      case 'PICKINGUP':
        this.rideState = RideState.PICKINGUP;
        this.currentRideId = update.rideId;
        if (this.driverLocation) {
          await this.calculateDriverRoute();
        }
        break;
      case 'ONGOING':
        this.rideState = RideState.ONGOING;
        this.driverRouteGeometry = null;
        this.routeGeometry = null;
        if (this.origin && this.destination) {
          await this.calculateRouteToDestination();
        }
        break;
      case 'FINISHED':
        this.rideState = RideState.FINISHED;
        this.showRateDriverModalForCompletedRide(update);
        break;
      case 'CANCELLED':
        this.rideState = RideState.CANCELLED;
        break;
    }

    // Trigger change detection after state updates
    this.cdr.markForCheck();

    if (
      (this.rideState === RideState.PICKINGUP || this.rideState === RideState.CONFIRMED) &&
      this.driverLocation &&
      previousState === this.rideState
    ) {
      await this.calculateDriverRoute();
    }

    if (update.status === 'FINISHED' || update.status === 'CANCELLED') {
      this.cleanupDriverTracking();
      this.routeGeometry = null;
      this.destination = null;
      this.routeInfo = null;

      if (update.status === 'CANCELLED') {
        setTimeout(() => {
          this.rideState = RideState.IDLE;
          this.cdr.detectChanges();
        }, 3000);
      }
    }
  }

  // ============================================================================
  // NOTIFICATION HANDLERS
  // ============================================================================

  onCloseNotificationModal(): void {
    this.showNotificationModal = false;
    this.notificationData = null;
  }

  private showRateDriverModalForCompletedRide(update: any): void {
    if (!this.currentRideId || !this.jwtPayload?.userId || !update.driverId) {
      console.warn('Missing required data for rating modal');
      return;
    }

    this.completionRideData = {
      rideId: this.currentRideId,
      driverId: update.driverId,
      customerId: this.jwtPayload.userId,
    };

    this.showRateDriverModal = true;
    this.cdr.detectChanges();
  }

  onReviewSubmitted(): void {
    this.showRateDriverModal = false;
    this.completionRideData = null;

    setTimeout(() => {
      this.resetToIdle();
    }, 1000);
  }

  onRateDriverModalClosed(): void {
    this.showRateDriverModal = false;
    this.completionRideData = null;

    setTimeout(() => {
      this.resetToIdle();
    }, 500);
  }

  onRetryBooking(): void {
    this.onCloseNotificationModal();
    if (this.selectedVehicle) {
      this.onBookRide(this.selectedVehicle);
    }
  }

  onCancelBooking(): void {
    // Check if we have something to cancel based on current state
    if (this.rideState === RideState.PENDING) {
      if (!this.currentRideRequestId) {
        console.warn('No ride request to cancel');
        this.resetToIdle();
        return;
      }
    } else {
      if (!this.currentRideId) {
        console.warn('No ride to cancel');
        this.resetToIdle();
        return;
      }
    }

    // Only allow cancellation in PENDING, CONFIRMED, or PICKINGUP states
    if (this.rideState === RideState.ONGOING) {
      alert('Cannot cancel ride that is already ongoing');
      return;
    }

    if (this.rideState === RideState.FINISHED || this.rideState === RideState.CANCELLED) {
      console.warn('Ride already finished or cancelled');
      this.resetToIdle();
      return;
    }

    if (!this.jwtPayload?.userId && this.rideState !== RideState.PENDING) {
      console.error('User ID not available');
      this.resetToIdle();
      return;
    }

    // Prevent multiple cancel requests
    if (this.loading) {
      console.log('Cancel already in progress');
      return;
    }

    this.loading = true;
    console.log(`Canceling ${this.rideState} ride...`);

    // Use cancelPendingRide for PENDING state (with rideRequestId), cancelRide for CONFIRMED/PICKINGUP (with rideId)
    const cancelRequest$ =
      this.rideState === RideState.PENDING
        ? this.rideService.cancelPendingRide(this.currentRideRequestId!)
        : this.rideService.cancelRide(this.currentRideId!, this.jwtPayload!.userId, 'USER');

    const sub = cancelRequest$.subscribe({
      next: () => {
        console.log('Ride cancelled successfully');
        this.loading = false;
        this.resetToIdle();
        this.cdr.detectChanges(); // Force UI update to hide modal
      },
      error: (err) => {
        console.error('Error canceling ride:', err);
        this.loading = false;
        this.showErrorNotification('Failed to cancel ride. Please try again.');
        this.cdr.detectChanges();
      },
    });

    this.subscriptions.add(sub);
  }

  private resetToIdle(): void {
    this.showNotificationModal = false;
    this.notificationData = null;
    this.driverInfo = null;
    this.currentRideId = null;
    this.currentRideRequestId = null;
    this.rideState = RideState.IDLE;
    this.rideStatusSubscription?.unsubscribe();
    this.cleanupDriverTracking();

    this.showRateDriverModal = false;
    this.completionRideData = null;

    this.destination = null;
    this.routeInfo = null;
    this.routeGeometry = null;
  }

  private cleanupDriverTracking(): void {
    console.log('Cleaning up driver tracking');
    this.driverPositionSubscription?.unsubscribe();
    this.driverPositionSubscription = undefined;
    this.driverLocation = null;
    this.activeDriver = null;
    this.driverRouteGeometry = null;
    this.lastRouteCalculation = null;
    clearTimeout(this.driverRouteDebounceTimer);
  }

  // HELPER METHODS

  getStatusText(): string {
    const statusMap: Record<RideState, string> = {
      [RideState.IDLE]: '',
      [RideState.PENDING]: 'Đang tìm tài xế...',
      [RideState.CONFIRMED]: 'Đã tìm thấy tài xế!',
      [RideState.PICKINGUP]: 'Tài xế đang đến',
      [RideState.ONGOING]: 'Đang trong chuyến đi',
      [RideState.FINISHED]: 'Chuyến đi hoàn tất',
      [RideState.CANCELLED]: 'Đã hủy chuyến',
    };
    return statusMap[this.rideState] || '';
  }

  private parseErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
    }

    if (error?.name === 'TimeoutError') {
      return 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.';
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.status === 404) {
      return 'Không có tài xế khả dụng. Vui lòng thử lại sau.';
    }

    if (error?.status === 400) {
      return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra địa điểm và thử lại.';
    }

    if (error?.status === 500) {
      return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    }

    return 'Không thể tạo chuyến đi. Vui lòng thử lại.';
  }

  private showErrorNotification(message: string): void {
    console.error('Error:', message);
    alert(message); // TODO: Replace with toast notification service
  }

  private extractRouteSteps(instructions: any[]): string[] {
    return instructions
      .map((step: any, index: number) => {
        const instruction = step.html_instructions?.replace(/<[^>]*>/g, '') || '';
        const distance = step.distance?.text || '';

        if (instruction && distance) {
          return `${instruction} - ${distance}`;
        }
        return instruction || `Bước ${index + 1}`;
      })
      .filter((step) => step.length > 0);
  }

  private async calculateRouteToDestination(): Promise<void> {
    if (!this.origin || !this.destination) return;

    try {
      const routeData = await this.trackAsiaService.getDirections(
        this.origin.lng,
        this.origin.lat,
        this.destination.lng,
        this.destination.lat
      );

      if (routeData) {
        this.routeInfo = {
          distance: routeData.distance / 1000,
          duration: routeData.duration / 60,
          steps: this.extractRouteSteps(routeData.instructions || []),
        };
        this.routeGeometry = routeData.geometry;

        console.log('Route to destination calculated:', {
          distance: this.routeInfo.distance,
          duration: this.routeInfo.duration,
        });

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error calculating route to destination:', error);
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  onAvatarClick(): void {
    console.log('Avatar clicked - user:', this.userName);
    this.router.navigate(['/profile']);
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnDestroy(): void {
    this.isDestroyed = true;

    clearTimeout(this.searchDebounceTimer);
    clearTimeout(this.driverRouteDebounceTimer);

    this.subscriptions.unsubscribe();
    this.rideStatusSubscription?.unsubscribe();
    this.cleanupDriverTracking();

    console.log('UserBookingComponent destroyed');
  }
}
