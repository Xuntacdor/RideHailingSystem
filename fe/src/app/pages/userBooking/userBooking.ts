import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackAsiaService } from '../../core/services/trackasia.service';
import { RideService } from '../../core/services/ride.service';
import { MapComponent } from '../../components/userBooking/map/map.component';
import { UserHeaderComponent } from '../../components/userBooking/user-header/user-header.component';
import { VehicleSelectionComponent } from '../../components/userBooking/vehicle-selection/vehicle-selection.component';
import { LocationSearchComponent } from '../../components/userBooking/location-search/location-search.component';
import { RouteInfoComponent } from '../../components/userBooking/route-info/route-info.component';
import { Coordinate, SearchResult, RouteInfo, VehicleType, Driver } from '../../models/models';
import { jwtPayload, RideRequest } from '../../core/models/api-response.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './userBooking.html',
  styleUrls: [],
})
export class userBooking implements OnDestroy {
  loading = false;
  isTokenValid = true;
  isSettingOrigin = false;
  isSettingDestination = false;

  jwtPayload: jwtPayload | null = null;

  selectedVehicle: VehicleType = VehicleType.CAR;

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

  constructor(
    private trackAsiaService: TrackAsiaService,
    private authService: AuthService,
    private rideService: RideService,
    private router: Router
  ) {
    // Get JWT payload on component initialization
    this.jwtPayload = this.authService.getUserInfo();
    this.userName = this.jwtPayload?.name || '';
  }

  onMapReady(): void {
    console.log('Map is ready');
  }

  onTokenInvalid(): void {
    this.isTokenValid = false;
  }

  async onUserLocationDetected(event: { lng: number; lat: number }): Promise<void> {
    // console.log('Setting origin from GPS:', event);
    const address = await this.trackAsiaService.reverseGeocode(event.lng, event.lat);
    this.origin = { lng: event.lng, lat: event.lat, name: address || 'Your location' };
    // this.currentLocation = address || 'Your location';
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
    if (!this.origin || !this.destination || !this.routeInfo || !this.jwtPayload) {
      alert('Please select both origin and destination before booking.');
      return;
    }

    if (this.bookingInProgress) {
      return;
    }

    this.bookingInProgress = true;
    this.loading = true;

    try {
      // Calculate fare based on distance and duration
      const distanceInMeters = this.routeInfo.distance * 1000; // Convert km to meters
      const durationInMinutes = this.routeInfo.duration; // Already in minutes
      const fare = this.calculateFare(vehicleType, this.routeInfo.distance, durationInMinutes);

      const rideRequest: RideRequest = {
        customerId: this.jwtPayload.userId,
        startLocation: this.origin.name!,
        endLocation: this.destination.name!,
        customerLatitude: this.origin.lat,
        customerLongitude: this.origin.lng,
        distance: Math.round(distanceInMeters), // Backend expects Long (integer)
        fare: Math.round(fare), // Backend expects Long (integer)
        vehicleType: this.mapVehicleTypeToBackend(vehicleType),
        startTime: Date.now(),
      };

      // Call the ride service to create the ride
      this.rideService.createRide(rideRequest).subscribe({
        next: (response) => {
          console.log('Ride created successfully:', response);
          this.rideInfo = {
            rideRequestId: response.rideRequestId,
            status: response.status,
            message: response.message,
            nearestDriversCount: response.nearestDriversCount,
          };
          this.showRideNotification = true;
          this.bookingInProgress = false;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating ride:', error);
          alert('Failed to create ride. Please try again.');
          this.bookingInProgress = false;
          this.loading = false;
        },
      });
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking. Please try again.');
      this.bookingInProgress = false;
      this.loading = false;
    }
  }

  private calculateFare(vehicleType: VehicleType, distance: number, duration: number): number {
    // Simple fare calculation - you can adjust this based on your business logic
    const baseFare = 10000; // VND
    const pricePerKm = 5000; // VND per km
    const pricePerMinute = 1000; // VND per minute

    // Apply multipliers based on vehicle type
    let multiplier = 1.0;
    switch (vehicleType) {
      case VehicleType.MOTORBIKE:
        multiplier = 1.0;
        break;
      case VehicleType.CAR:
        multiplier = 2.5;
        break;
      default:
        multiplier = 1.0;
    }

    const extraDistance = Math.max(0, distance - 2);
    const total = (baseFare + extraDistance * pricePerKm + duration * pricePerMinute) * multiplier;
    return Math.round(total / 1000) * 1000; // Round to nearest 1000 VND
  }

  private mapVehicleTypeToBackend(vehicleType: VehicleType): string {
    // Map frontend VehicleType enum to backend string
    switch (vehicleType) {
      case VehicleType.MOTORBIKE:
        return 'MOTORBIKE';
      case VehicleType.CAR:
        return 'CAR';
      default:
        return 'MOTORBIKE';
    }
  }

  // Search handling
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
      this.calculateRoute();
    }
  }

  private async setOriginFromClick(lng: number, lat: number): Promise<void> {
    this.isSettingOrigin = false;
    const address = await this.trackAsiaService.reverseGeocode(lng, lat);
    this.origin = { lng, lat, name: address };

    if (this.destination) {
      this.calculateRoute();
    }
  }

  private async setDestinationFromClick(lng: number, lat: number): Promise<void> {
    this.isSettingDestination = false;
    const address = await this.trackAsiaService.reverseGeocode(lng, lat);
    this.destination = { lng, lat, name: address };

    if (this.origin) {
      this.calculateRoute();
    }
  }

  private async calculateRoute(): Promise<void> {
    if (!this.origin || !this.destination) return;

    this.loading = true;
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
          duration: routeData.duration / 60000,
          steps: this.extractRouteSteps(routeData.instructions || []),
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
    return instructions
      .map((step: any, index: number) => {
        const instruction = step.html_instructions?.replace(/<[^>]*>/g, '') || '';
        const distance = step.distance?.text || '';

        if (instruction && distance) {
          return `${instruction} - ${distance}`;
        }
        return instruction || `Step ${index + 1}`;
      })
      .filter((step) => step.length > 0);
  }

  onClearRoute(): void {
    this.routeInfo = null;
    this.routeGeometry = null;
    this.destination = null;
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
  }
  openProfileMenu() {
    console.log('Chuyển hướng sang trang Profile...');
    this.router.navigate(['/profile']);
  }
}
