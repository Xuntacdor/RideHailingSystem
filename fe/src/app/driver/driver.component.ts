import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverRideRequestService, RideRequestNotification } from './services/driver-ride-request.service';
import { DriverNotificationModalComponent, DriverRideRequest } from './components/driver-notification-modal/driver-notification-modal.component';
import { AuthService } from '../core/services/auth';
import { MapComponent } from '../components/userBooking/map/map.component';
import { DriverPosUpdateService } from './services/driverPosUpdate.service';
import { DriverActiveRideComponent, ActiveRide } from './pages/driver-active-ride/driver-active-ride.component';


@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, DriverNotificationModalComponent, MapComponent, DriverActiveRideComponent],
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

  // Active ride state
  showActiveRide = false;
  activeRide: ActiveRide | null = null;

  constructor(
    private router: Router,
    private driverRideRequestService: DriverRideRequestService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private driverPosUpdateService: DriverPosUpdateService
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
        next: (notification) => {
          this.showRideRequestNotification(notification);
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
      customerLatitude: notification.customerLatitude,
      customerLongitude: notification.customerLongitude,
      distance: notification.distance,
      fare: notification.fare,
      vehicleType: notification.vehicleType,
      timestamp: notification.timestamp
    };

    console.log('Current ride request set:', this.currentRideRequest);
    console.log('Setting showRideRequestModal = true');
    this.showRideRequestModal = true;
    console.log('Modal visibility flag:', this.showRideRequestModal);

    console.log('Triggering change detection...');
    this.cdr.detectChanges();
    console.log('Change detection triggered');
  }

  onAcceptRide(rideRequest: DriverRideRequest): void {
    if (this.driverId) {
      console.log('Driver accepting ride:', rideRequest.rideRequestId);
      this.driverRideRequestService.sendDriverResponse(
        rideRequest.rideRequestId,
        this.driverId,
        true
      );
      this.driverStatus = 'Matching';

      // Show active ride component instead of navigating
      this.activeRide = {
        rideId: rideRequest.rideRequestId,
        customerId: rideRequest.customerId,
        pickupLat: rideRequest.customerLatitude,
        pickupLng: rideRequest.customerLongitude,
        destinationLat: rideRequest.destinationLatitude,
        destinationLng: rideRequest.destinationLongitude,
        pickupLocation: rideRequest.startLocation,
        destinationLocation: rideRequest.endLocation,
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

  onRideCompleted(): void {
    console.log('Ride completed');
    this.showActiveRide = false;
    this.activeRide = null;
    this.driverStatus = 'Resting';
  }

  onRideCancelled(): void {
    console.log('Ride cancelled');
    this.showActiveRide = false;
    this.activeRide = null;
    this.driverStatus = 'Resting';
  }

  ngOnDestroy(): void {
    this.unsubscribeFromRideRequests();
    this.driverRideRequestService.disconnect();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
