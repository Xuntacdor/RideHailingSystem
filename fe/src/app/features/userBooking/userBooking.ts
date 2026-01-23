import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackAsiaService } from '../../core/services/trackasia.service';
import { RideService } from '../../core/services/ride.service';
import { RideStatusUpdateService } from '../../core/services/ride-status-update.service';
import { DriverPosUpdateService } from '../../driver/services/driverPosUpdate.service';
import { BookingTypeService, BookingTypeResponse } from '../../core/services/booking-type.service';
import { MapComponent } from '../../components/userBooking/map/map.component';
import { UserHeaderComponent } from '../../components/userBooking/user-header/user-header.component';
import { VehicleSelectionComponent } from '../../components/userBooking/vehicle-selection/vehicle-selection.component';
import { LocationSearchComponent } from '../../components/userBooking/location-search/location-search.component';
import { RouteInfoComponent } from '../../components/userBooking/route-info/route-info.component';
import { CustomerNotificationModalComponent, RideNotification } from '../../components/customer-notification-modal/customer-notification-modal.component';
import { Coordinate, SearchResult, RouteInfo, VehicleType, Driver } from '../../models/models';
import { jwtPayload, RideRequest, DriverPositionUpdate } from '../../core/models/api-response.model';
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';
import { BookedRideInfoComponent } from '../../components/userBooking/booked-ride-info/booked-ride-info.component';

enum RideState {
  IDLE = 'IDLE',           // Local state only, not sent to backend
  PENDING = 'PENDING',     // Searching for driver (backend: PENDING)
  CONFIRMED = 'CONFIRMED', // Driver accepted (backend: CONFIRMED)
  PICKINGUP = 'PICKINGUP', // Driver arriving/at pickup (backend: PICKINGUP)
  ONGOING = 'ONGOING',     // Ride in progress (backend: ONGOING)
  FINISHED = 'FINISHED',   // Ride completed (backend: FINISHED)
  CANCELLED = 'CANCELLED'  // Ride cancelled (backend: CANCELLED)
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    UserHeaderComponent,
    VehicleSelectionComponent,
    LocationSearchComponent,
    RouteInfoComponent,
    CustomerNotificationModalComponent,
    BookedRideInfoComponent
  ],
  templateUrl: './userBooking.html',
  styleUrls: []
})
export class userBooking implements OnInit, OnDestroy {
  loading = false;
  isTokenValid = true;
  isSettingOrigin = false;
  isSettingDestination = false;
  rideState: RideState = RideState.IDLE;
  jwtPayload: jwtPayload | null = null;


  selectedVehicle: VehicleType = VehicleType.CAR;
  bookingTypes: BookingTypeResponse[] = [];

  origin: Coordinate | null = null;
  destination: Coordinate | null = null;

  routeInfo: RouteInfo | null = null;
  routeGeometry: any = null;

  searchSuggestions: SearchResult[] = [];
  showSearchSuggestions = false;
  private searchDebounceTimer: any;
  userName: string;

  showRideNotification = false;
  rideInfo: any = null;
  bookingInProgress = false;

  private rideStatusSubscription?: Subscription;
  currentRideId: string | null = null;
  showNotificationModal = false;
  notificationData: RideNotification | null = null;

  private driverPositionSubscription?: Subscription;
  currentDriverId: string | null = null;
  driverLocation: { lat: number; lng: number } | null = null;
  activeDriver: Driver | null = null;
  driverRouteGeometry: any = null;
  currentRideStatus: string | null = null;


  constructor(
    private trackAsiaService: TrackAsiaService,
    private authService: AuthService,
    private rideService: RideService,
    private rideStatusUpdateService: RideStatusUpdateService,
    private driverPosUpdateService: DriverPosUpdateService,
    private bookingTypeService: BookingTypeService,
    private cdr: ChangeDetectorRef
  ) {
    this.jwtPayload = this.authService.getUserInfo();
    this.userName = this.jwtPayload?.name || '';
  }

  get RideState() {
    return RideState;
  }

  getStatusText(): string {
    switch (this.rideState) {
      case RideState.PENDING: return 'Đang tìm tài xế...';
      case RideState.CONFIRMED: return 'Đã tìm thấy tài xế!';
      case RideState.PICKINGUP: return 'Tài xế đang đến';
      case RideState.ONGOING: return 'Đang trong chuyến đi';
      case RideState.FINISHED: return 'Chuyến đi hoàn tất';
      case RideState.CANCELLED: return 'Đã hủy chuyến';
      default: return '';
    }
  }

  ngOnInit(): void {
    this.bookingTypeService.getAllBookingTypes().subscribe({
      next: (types) => {
        this.bookingTypes = types;
        console.log('Loaded booking types:', types);
      },
      error: (error) => {
        console.error('Error loading booking types:', error);
        this.bookingTypes = [];
      }
    });
  }

  onMapReady(): void {
    console.log('Map is ready');
  }

  onTokenInvalid(): void {
    this.isTokenValid = false;
  }

  async onUserLocationDetected(event: { lng: number; lat: number }): Promise<void> {
    const address = await this.trackAsiaService.reverseGeocode(event.lng, event.lat);
    this.origin = { lng: event.lng, lat: event.lat, name: address || 'Your location' };
  }

  onLocationClicked(event: { lng: number; lat: number; type: 'origin' | 'destination' }): void {
    if (event.type === 'origin') {
      this.setOriginFromClick(event.lng, event.lat);
    } else {
      this.setDestinationFromClick(event.lng, event.lat);
    }
  }

  onVehicleSelected(type: VehicleType): void {
    this.selectedVehicle = type;
  }

  async onBookRide(vehicleType: VehicleType): Promise<void> {
    if (!this.jwtPayload) {
      this.showErrorNotification('Please log in to book a ride.');
      return;
    }

    if (!this.origin || !this.destination) {
      this.showErrorNotification('Please select both pickup and destination locations.');
      return;
    }

    if (!this.routeInfo) {
      this.showErrorNotification('Unable to calculate route. Please try selecting locations again.');
      return;
    }

    if (!this.isValidCoordinate(this.origin.lat, this.origin.lng) ||
      !this.isValidCoordinate(this.destination.lat, this.destination.lng)) {
      this.showErrorNotification('Invalid location coordinates. Please select valid locations.');
      return;
    }

    const minDistance = 0.1; // 100 meters minimum
    if (this.routeInfo.distance < minDistance) {
      this.showErrorNotification('Pickup and destination are too close. Minimum distance is 100m.');
      return;
    }

    if (this.bookingInProgress) {
      return;
    }

    this.bookingInProgress = true;
    this.loading = true;

    try {
      const distanceInMeters = this.routeInfo.distance * 1000;
      const durationInMinutes = this.routeInfo.duration;
      const fare = this.calculateFare(vehicleType, this.routeInfo.distance, durationInMinutes);

      const rideRequest: RideRequest = {
        customerId: this.jwtPayload.userId,
        startLatitude: this.origin.lat,
        startLongitude: this.origin.lng,
        endLatitude: this.destination.lat,
        endLongitude: this.destination.lng,
        customerLatitude: this.origin.lat,
        customerLongitude: this.origin.lng,
        distance: Math.round(distanceInMeters),
        fare: Math.round(fare),
        vehicleType: this.mapVehicleTypeToBackend(vehicleType),
        startTime: Date.now(),
      };

      this.rideService.createRide(rideRequest).subscribe({
        next: (response) => {
          console.log('Ride created successfully:', response);
          this.rideInfo = {
            rideRequestId: response.rideRequestId,
            status: response.status,
            message: response.message,
            nearestDriversCount: response.nearestDriversCount,
          };
          this.currentRideId = response.rideRequestId;
          this.showRideNotification = true;
          this.bookingInProgress = false;
          this.loading = false;

          this.subscribeToRideUpdates();
        },
        error: (error) => {
          console.error('Error creating ride:', error);
          const errorMessage = this.parseErrorMessage(error);
          this.showErrorNotification(errorMessage);
          this.bookingInProgress = false;
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Booking error:', error);
      this.showErrorNotification('An unexpected error occurred. Please try again.');
      this.bookingInProgress = false;
      this.loading = false;
    }

    this.rideState = RideState.PENDING;
  }

  private isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
      lat !== 0 && lng !== 0;
  }

  private parseErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status === 404) {
      return 'No drivers available at the moment. Please try again later.';
    }
    if (error?.status === 400) {
      return 'Invalid booking request. Please check your locations and try again.';
    }
    return 'Failed to create ride. Please try again.';
  }

  private showErrorNotification(message: string): void {
    console.error('Booking error:', message);
    alert(message);
  }

  private calculateFare(vehicleType: VehicleType, distance: number, duration: number): number {
    const bookingType = this.bookingTypes.find(bt => bt.vehicleType === vehicleType.toString());

    if (bookingType) {
      const baseFare = bookingType.baseFare;
      const pricePerKm = bookingType.pricePerKm;
      const pricePerMinute = bookingType.pricePerMinute;

      const extraDistance = Math.max(0, distance - 2);
      const total = baseFare + (extraDistance * pricePerKm) + (duration * pricePerMinute);
      return Math.round(total / 1000) * 1000;
    }

    const baseFare = 10000;
    const pricePerKm = 5000;
    const pricePerMinute = 1000;

    let multiplier = 1.0;
    switch (vehicleType) {
      case VehicleType.MOTORBIKE: multiplier = 1.0; break;
      case VehicleType.CAR: multiplier = 2.5; break;
      default: multiplier = 1.0;
    }

    const extraDistance = Math.max(0, distance - 2);
    const total = (baseFare + (extraDistance * pricePerKm) + (duration * pricePerMinute)) * multiplier;
    return Math.round(total / 1000) * 1000;
  }

  private mapVehicleTypeToBackend(vehicleType: VehicleType): string {
    switch (vehicleType) {
      case VehicleType.MOTORBIKE: return 'MOTORBIKE';
      case VehicleType.CAR: return 'CAR';
      default: return 'MOTORBIKE';
    }
  }

  onSearchChanged(query: string): void {
    clearTimeout(this.searchDebounceTimer);

    if (query.trim().length < 2) {
      this.showSearchSuggestions = false;
      return;
    }

    this.searchDebounceTimer = setTimeout(async () => {
      this.searchSuggestions = await this.trackAsiaService.search(query, 5);
      this.showSearchSuggestions = this.searchSuggestions.length > 0;
    });
  }

  onCloseRideNotification() {
    this.showRideNotification = false;
    this.rideInfo = null;
  }

  async onSearchSubmitted(query: string): Promise<void> {
    if (!query.trim()) return;

    this.loading = true;
    try {
      const results = await this.trackAsiaService.search(query, 1);
      if (results[0]) {
        this.selectDestination(results[0]);
      }
    } finally {
      this.loading = false;
    }
  }

  onSuggestionSelected(suggestion: SearchResult): void {
    this.selectDestination(suggestion);
    this.showSearchSuggestions = false;
  }

  private selectDestination(result: SearchResult): void {
    this.destination = { lng: result.lng, lat: result.lat, name: result.display };


    if (this.origin && this.destination) {
      this.calculateRoute(this.destination.lng, this.destination.lat);
    }
  }

  private async setOriginFromClick(lng: number, lat: number): Promise<void> {
    this.isSettingOrigin = false;
    const address = await this.trackAsiaService.reverseGeocode(lng, lat);
    this.origin = { lng, lat, name: address };

    if (this.destination) {
      this.calculateRoute(lng, lat);
    }
  }

  private async setDestinationFromClick(lng: number, lat: number): Promise<void> {
    this.isSettingDestination = false;
    const address = await this.trackAsiaService.reverseGeocode(lng, lat);
    this.destination = { lng, lat, name: address };

    if (this.origin) {
      this.calculateRoute(lng, lat);
    }
  }

  private async calculateRoute(lng: number, lat: number): Promise<void> {
    if (!this.origin || !this.destination) return;

    this.loading = true;
    try {
      const routeData = await this.trackAsiaService.getDirections(
        this.origin.lng,
        this.origin.lat,
        lng,
        lat
      );

      if (routeData) {
        this.routeInfo = {
          distance: routeData.distance / 1000,
          duration: routeData.duration / 60000,
          steps: this.extractRouteSteps(routeData.instructions || [])
        };

        this.routeGeometry = routeData.geometry;
      }
    } catch (error) {
      console.error('Routing error:', error);
    } finally {
      this.loading = false;
    }
  }

  private extractRouteSteps(instructions: any[]): string[] {
    return instructions.map((step: any, index: number) => {
      const instruction = step.html_instructions?.replace(/<[^>]*>/g, '') || '';
      const distance = step.distance?.text || '';

      if (instruction && distance) {
        return `${instruction} - ${distance}`;
      }
      return instruction || `Step ${index + 1}`;
    }).filter(step => step.length > 0);
  }

  onClearRoute(): void {
    this.routeInfo = null;
    this.routeGeometry = null;
    this.destination = null;
  }

  // WebSocket subscription 
  private subscribeToRideUpdates(): void {
    const customerId = this.jwtPayload?.userId;
    if (!customerId) {
      console.error('No customer ID available for WebSocket subscription');
      return;
    }

    console.log(`Subscribing to ride updates for customer: ${customerId}`);
    this.rideStatusSubscription = this.rideStatusUpdateService
      .subscribeToRideStatusUpdates(customerId)
      .subscribe({
        next: (update) => {
          console.log('Received WebSocket notification:', update);
          this.handleRideNotification(update);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('WebSocket subscription error:', err);
        },
        complete: () => {
          console.log('WebSocket subscription completed');
        }
      });
  }

  private handleRideNotification(update: any): void {
    console.log('Handling notification:', update);

    switch (update.type) {
      case 'RIDE_ACCEPTED':
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
    this.showRideNotification = false;

    this.currentDriverId = update.driverId;
    this.currentRideStatus = 'CONFIRMED';
    this.rideState = RideState.CONFIRMED;

    this.routeGeometry = null;

    this.subscribeToDriverPosition(update.driverId);

    this.notificationData = {
      type: 'RIDE_ACCEPTED',
      rideId: update.rideId,
      driverId: update.driverId,
      driverData: {
        name: update.driverName || 'Driver',
        avatarUrl: update.driverAvatar || 'assets/default-avatar.png',
        rating: update.driverRating || 4.5,
        vehicleModel: update.vehicleModel || 'Vehicle',
        vehiclePlate: update.vehiclePlate || 'N/A',
        phoneNumber: update.driverPhone || 'N/A'
      }
    };
    this.showNotificationModal = true;
  }

  private showStatusUpdateModal(update: any): void {
    this.notificationData = {
      type: 'RIDE_STATUS_UPDATE',
      rideId: update.rideId,
      status: update.status,
      timestamp: update.timestamp
    };
    this.showNotificationModal = true;
  }

  private showNoDriverModal(update: any): void {
    this.showRideNotification = false;
    this.rideState = RideState.IDLE;
    this.notificationData = {
      type: 'NO_DRIVER_AVAILABLE',
      rideRequestId: update.rideRequestId,
      message: update.message || 'No drivers available at the moment'
    };
    this.showNotificationModal = true;
  }

  private showCancellationModal(update: any): void {
    this.showRideNotification = false;

    const message = update.cancelledBy === 'DRIVER' ?
      'Driver cancelled the ride' :
      'Ride has been cancelled';

    this.notificationData = {
      type: 'RIDE_CANCELLED',
      rideId: update.rideId,
      message: message,
      timestamp: update.timestamp
    };
    this.showNotificationModal = true;

    setTimeout(() => {
      this.resetToIdle();
    }, 3000);
  }

  onCloseNotificationModal(): void {
    this.showNotificationModal = false;
    this.notificationData = null;
  }

  onRetryBooking(): void {
    this.showNotificationModal = false;
    this.notificationData = null;
    if (this.selectedVehicle) {
      this.onBookRide(this.selectedVehicle);
    }
  }

  onCancelBooking(): void {
    if (!this.currentRideId || !this.jwtPayload?.userId) {
      this.resetToIdle();
      return;
    }

    this.rideService.cancelRide(this.currentRideId, this.jwtPayload.userId, 'CUSTOMER')
      .subscribe({
        next: () => {
          console.log('Ride cancelled successfully');
          this.resetToIdle();
        },
        error: (err) => {
          console.error('Error cancelling ride:', err);
          alert('Failed to cancel ride. Please try again.');
        }
      });
  }

  private resetToIdle(): void {
    this.showNotificationModal = false;
    this.notificationData = null;
    this.currentRideId = null;
    this.rideInfo = null;
    this.rideState = RideState.IDLE;
    this.rideStatusSubscription?.unsubscribe();
    this.cleanupDriverTracking();
  }

  private subscribeToDriverPosition(driverId: string): void {
    console.log(`Subscribing to driver position for driver: ${driverId}`);

    this.driverPositionSubscription = this.driverPosUpdateService
      .subscribeToDriverPositionUpdates(driverId)
      .subscribe({
        next: (message) => {
          const update: DriverPositionUpdate = JSON.parse(message.body);
          console.log('Received driver position update:', update);
          this.updateDriverLocation(update);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Driver position subscription error:', err);
        }
      });
  }

  private updateDriverLocation(update: DriverPositionUpdate): void {
    this.driverLocation = { lat: update.lat, lng: update.lng };

    this.activeDriver = {
      id: update.driverId,
      name: 'Driver',
      vehicleType: VehicleType.CAR,
      lng: update.lng,
      lat: update.lat,
      rating: 4.5,
      icon: '🚗'
    };

    this.calculateDriverRoute();
  }

  private async calculateDriverRoute(): Promise<void> {
    if (!this.driverLocation) return;

    let targetLocation: Coordinate | null = null;

    if (this.rideState === RideState.CONFIRMED ||
      this.rideState === RideState.PICKINGUP) {
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
        console.log('Driver route calculated:', routeData);
      }
    } catch (error) {
      console.error('Error calculating driver route:', error);
    }
  }

  private handleRideStatusUpdate(update: any): void {
    console.log('Ride status update:', update);
    this.currentRideStatus = update.status;

    switch (update.status) {
      case 'PICKINGUP':
        this.rideState = RideState.PICKINGUP;
        break;
      case 'ONGOING':
        this.rideState = RideState.ONGOING;
        break;
      case 'FINISHED':
        this.rideState = RideState.FINISHED;
        break;
      case 'CANCELLED':
        this.rideState = RideState.CANCELLED;
        break;
    }

    if (this.driverLocation) {
      this.calculateDriverRoute();
    }

    if (update.status === 'FINISHED' || update.status === 'CANCELLED') {
      this.cleanupDriverTracking();
      this.routeGeometry = null;
      this.destination = null;
      this.origin = null; // Optional: reset origin too if desired, user requested clear markers
      this.routeInfo = null;

      setTimeout(() => {
        this.rideState = RideState.IDLE;
        this.cdr.detectChanges();
      }, 3000);
    }
  }

  private cleanupDriverTracking(): void {
    console.log('Cleaning up driver tracking');
    this.driverPositionSubscription?.unsubscribe();
    this.driverPositionSubscription = undefined;
    this.currentDriverId = null;
    this.driverLocation = null;
    this.activeDriver = null;
    this.driverRouteGeometry = null;
    this.currentRideStatus = null;
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
    this.rideStatusSubscription?.unsubscribe();
    this.cleanupDriverTracking();
  }
}


