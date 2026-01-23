import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverRideRequestService, RideRequestNotification } from './services/driver-ride-request.service';
import { DriverNotificationModalComponent, DriverRideRequest } from './components/driver-notification-modal/driver-notification-modal.component';
import { AuthService } from '../core/services/auth';
import { MapComponent } from '../components/userBooking/map/map.component';
import { DriverPosUpdateService } from './services/driverPosUpdate.service';
import { DriverActiveRideComponent, ActiveRide, MapUpdate } from './pages/driver-active-ride/driver-active-ride.component';
import { DriverFinishedRideComponent, CompletedRideInfo } from './components/driver-finished-ride/driver-finished-ride.component';
import { RideService } from '../core/services/ride.service';
import { Coordinate } from '../models/models';


@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, DriverNotificationModalComponent, MapComponent, DriverActiveRideComponent, DriverFinishedRideComponent],
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit, OnDestroy {
  isOnline = false;
  driverAvatar = 'assets/avatar.png';
  driverId: string | null = null;
  interval: any;

  private rideRequestSubscription?: Subscription;
  showRideRequestModal = false;
  currentRideRequest: DriverRideRequest | null = null;
  driverStatus: 'Matching' | 'Resting' = 'Resting';

  showActiveRide = false;
  activeRide: ActiveRide | null = null;

  showFinishedRide = false;
  finishedRideInfo: CompletedRideInfo | null = null;

  mapOrigin: Coordinate | null = null;
  mapDestination: Coordinate | null = null;
  mapRouteGeometry: any = null;

  constructor(
    private router: Router,
    private driverRideRequestService: DriverRideRequestService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private driverPosUpdateService: DriverPosUpdateService,
    private rideService: RideService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.driverId = userInfo?.driverId || userInfo?.userId || null;
  }

  toggleOnline(): void {
    this.isOnline = !this.isOnline;

    if (this.isOnline) {
      this.subscribeToRideRequests();

      this.driverPosUpdateService.startWatchingLocation();

      this.driverPosUpdateService.sendDriverLocation(this.driverId!);

      this.interval = setInterval(() => {
        this.driverPosUpdateService.sendDriverLocation(this.driverId!);
      }, 3000);

    } else {
      this.unsubscribeFromRideRequests();

      this.driverPosUpdateService.stopWatchingLocation();

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }

  private subscribeToRideRequests(): void {
    if (!this.driverId) {
      return;
    }

    this.rideRequestSubscription = this.driverRideRequestService
      .subscribeToRideRequests(this.driverId)
      .subscribe({
        next: (notification: any) => {
          if (notification.type === 'RIDE_CREATED') {
            if (this.activeRide) {
              console.log('Updating activeRide with actual ride ID:', notification.rideId);
              this.activeRide = {
                ...this.activeRide,
                rideId: notification.rideId
              };
            }
          } else {
            this.showRideRequestNotification(notification);
          }
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

  private unsubscribeFromRideRequests(): void {
    this.rideRequestSubscription?.unsubscribe();
  }

  private showRideRequestNotification(notification: RideRequestNotification): void {
    console.log('showRideRequestNotification called');
    console.log('Creating ride request object...');

    this.currentRideRequest = {
      rideRequestId: notification.rideRequestId,
      customerId: notification.customerId,
      customerName: notification.customerName,
      startLocation: notification.startLocation,
      endLocation: notification.endLocation,
      startLatitude: notification.startLatitude,
      startLongitude: notification.startLongitude,
      endLatitude: notification.endLatitude,
      endLongitude: notification.endLongitude,
      distance: notification.distance,
      fare: notification.fare,
      vehicleType: notification.vehicleType,
      timestamp: notification.timestamp
    };

    this.showRideRequestModal = true;

    this.cdr.detectChanges();
  }

  onAcceptRide(rideRequest: DriverRideRequest): void {
    if (this.driverId) {
      console.log('Driver accepting ride:', rideRequest.rideRequestId);
      console.log(rideRequest.startLatitude + ' ' + rideRequest.startLongitude + 'aaaaaa');
      console.log(rideRequest.endLatitude + ' ' + rideRequest.endLongitude + 'zzzzzz');
      this.driverRideRequestService.sendDriverResponse(
        rideRequest.rideRequestId,
        this.driverId,
        true
      );
      this.driverStatus = 'Matching';

      this.activeRide = {
        rideId: rideRequest.rideRequestId,
        customerId: rideRequest.customerId,
        pickupLat: rideRequest.startLatitude,
        pickupLng: rideRequest.startLongitude,
        destinationLat: rideRequest.endLatitude,
        destinationLng: rideRequest.endLongitude,
        // pickupLocation: rideRequest.startLocation,
        // destinationLocation: rideRequest.endLocation,
        status: 'CONFIRMED'
      };

      this.showActiveRide = true;
      this.showRideRequestModal = false;
      this.currentRideRequest = null;
    }
  }

  onRejectRide(rideRequest: DriverRideRequest): void {
    if (this.driverId) {
      console.log('Driver rejecting ride:', rideRequest.rideRequestId);
      this.driverRideRequestService.sendDriverResponse(
        rideRequest.rideRequestId,
        this.driverId,
        false
      );
      this.showRideRequestModal = false;
      this.currentRideRequest = null;
    }
  }

  onRideRequestTimeout(rideRequest: DriverRideRequest): void {
    console.log('Ride request timed out:', rideRequest.rideRequestId);
    if (this.driverId) {
      this.driverRideRequestService.sendDriverResponse(
        rideRequest.rideRequestId,
        this.driverId,
        false
      );
    }
    this.showRideRequestModal = false;
    this.currentRideRequest = null;
  }


  goToProfile(): void {
    this.router.navigate(['/driver-profile']);
  }

  onMapUpdate(update: MapUpdate): void {
    this.mapOrigin = update.origin;
    this.mapDestination = update.destination;
    this.mapRouteGeometry = update.routeGeometry;

    this.cdr.detectChanges();
  }

  onRideCompleted(): void {
    console.log('Ride completed');

    if (!this.activeRide) return;

    const rideId = this.activeRide.rideId;

    // Immediately hide active ride and reset driver status
    this.showActiveRide = false;
    this.activeRide = null;
    this.driverStatus = 'Resting';
    this.resetMap();

    // Fetch ride data asynchronously for display
    this.rideService.getRideById(rideId).subscribe({
      next: (rideData) => {

        this.finishedRideInfo = {
          rideId: rideId,
          // pickupLocation: pickupLocation,
          // destinationLocation: destinationLocation,
          distance: rideData.distance || 0,
          fare: rideData.fare || 0,
          customerName: rideData.customer?.name || 'Khách hàng',
          startTime: rideData.startTime,
          endTime: rideData.endTime || Date.now()
        };

        this.showFinishedRide = true;
      },
      error: (err) => {
        console.error('Error fetching ride data:', err);
        // Mock data if fetch fails
        this.finishedRideInfo = {
          rideId: rideId,
          // pickupLocation: pickupLocation,
          // destinationLocation: destinationLocation,
          distance: 0,
          fare: 0,
          customerName: 'Khách hàng'
        };

        this.showFinishedRide = true;
        this.resetMap();
      }


    });
  }

  onCloseFinishedRide(): void {
    console.log('Closing finished ride screen');
    this.showFinishedRide = false;
    this.finishedRideInfo = null;
  }

  onRideCancelled(): void {
    console.log('Ride cancelled');
    this.showActiveRide = false;
    this.activeRide = null;
    this.driverStatus = 'Resting';
    this.resetMap();
  }

  private resetMap(): void {
    this.mapOrigin = null;
    this.mapDestination = null;
    this.mapRouteGeometry = null;
  }

  ngOnDestroy(): void {
    this.unsubscribeFromRideRequests();
    this.driverRideRequestService.disconnect();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
