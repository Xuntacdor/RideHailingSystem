import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriverRideRequestService, RideRequestNotification } from '../../driver/services/driver-ride-request.service';
import { DriverNotificationModalComponent, DriverRideRequest } from '../../driver/components/driver-notification-modal/driver-notification-modal.component';
import { AuthService } from '../../core/services/auth.service';
import { MapComponent } from '../../components/userBooking/map/map.component';
import { DriverPosUpdateService } from '../../driver/services/driverPosUpdate.service';
import { DriverActiveRideComponent, ActiveRide, MapUpdate } from '../../driver/pages/driver-active-ride/driver-active-ride.component';
import { DriverFinishedRideComponent, CompletedRideInfo } from '../../driver/components/driver-finished-ride/driver-finished-ride.component';
import { RideService } from '../../core/services/ride.service';
import { Coordinate } from '../../models/models';
import { DriverService } from '../../core/services/driver.service';
import { TrackAsiaService } from '../../core/services/trackasia.service';


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
  checkRide: any | null = null;

  // GPS Debug logs for mobile
  debugLogs: string[] = [];
  showDebugPanel = false;
  private gpsUpdateSubscription?: Subscription;

  constructor(
    private router: Router,
    private driverRideRequestService: DriverRideRequestService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private driverPosUpdateService: DriverPosUpdateService,
    private rideService: RideService,
    private driverService: DriverService,
    private trackAsiaService: TrackAsiaService
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.driverId = userInfo?.driverId || userInfo?.userId || null;

    // Subscribe to GPS updates for debug panel
    this.subscribeToGPSUpdates();
    this.addDebugLog('🚀 Driver component initialized');

    //check if driver has an active ride
    this.rideService.getActiveRide(this.driverId!).subscribe({
      next: (rideData) => {
        if (rideData) {
          this.driverService.updateDriverStatus(this.driverId!, 'ACTIVE').subscribe({});
          this.activeRide = {
            rideId: rideData.id || '',
            customerId: rideData.customer?.id || '',
            pickupLat: rideData.startLatitude || 0,
            pickupLng: rideData.startLongitude || 0,
            destinationLat: rideData.endLatitude || 0,
            destinationLng: rideData.endLongitude || 0,
            status: rideData.status || ''
          };

          if (rideData.status === 'CONFIRMED' || rideData.status === 'PICKINGUP' || rideData.status === 'ONGOING') {
            this.driverStatus = 'Matching';
            console.log(rideData.status);
            this.driverPosUpdateService.setDriverStatus('Matching');
            this.isOnline = true;
            this.subscribeToRideRequests();
            // ✅ Start GPS tracking and auto location updates
            this.driverPosUpdateService.startGPSTracking();
            this.driverPosUpdateService.startAutoLocationUpdate(this.driverId!);
            this.addDebugLog('✅ GPS tracking started (active ride detected)');
          }

          this.showActiveRide = true;
          this.cdr.detectChanges();
        }
        else {
          this.driverService.updateDriverStatus(this.driverId!, 'INACTIVE').subscribe({});
        }
      },
      error: (err) => {
        console.error('Error fetching active ride data:', err);
        this.addDebugLog('❌ Error fetching active ride');
      }
    });

  }

  toggleOnline(): void {
    this.isOnline = !this.isOnline;

    if (this.isOnline) {
      this.subscribeToRideRequests();

      this.driverService.updateDriverStatus(this.driverId!, 'ACTIVE').subscribe({});

      console.log(this.driverId);

      // Start GPS tracking and auto location updates
      this.driverPosUpdateService.startGPSTracking();
      this.driverPosUpdateService.startAutoLocationUpdate(this.driverId!);
      this.addDebugLog('✅ Driver online - GPS tracking started');

    } else {
      this.unsubscribeFromRideRequests();

      this.driverService.updateDriverStatus(this.driverId!, 'INACTIVE').subscribe({});
      this.driverPosUpdateService.stopGPSTracking();
      this.driverPosUpdateService.stopAutoLocationUpdate();
      this.addDebugLog('⏹️ Driver offline - GPS tracking stopped');
    }
  }

  onMapLocationDetected(location: { lng: number; lat: number }) {
    this.driverPosUpdateService.setCurrentLocation({ lat: location.lat, lng: location.lng });
    this.addDebugLog(`📍 Map location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
  }

  private subscribeToGPSUpdates(): void {
    // Subscribe to location updates
    this.gpsUpdateSubscription = this.driverPosUpdateService.location$.subscribe((location) => {
      if (location) {
        const timestamp = new Date().toLocaleTimeString();
        this.addDebugLog(`🛰️ GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      }
    });

    // Subscribe to debug logs from service
    this.driverPosUpdateService.debugLog$.subscribe((log) => {
      if (log) {
        this.addDebugLog(log);
      }
    });
  }

  private addDebugLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.debugLogs.unshift(`[${timestamp}] ${message}`);
    // Keep only last 20 logs
    if (this.debugLogs.length > 20) {
      this.debugLogs = this.debugLogs.slice(0, 20);
    }
  }

  toggleDebugPanel(): void {
    this.showDebugPanel = !this.showDebugPanel;
  }

  private subscribeToRideRequests(): void {
    if (!this.driverId) {
      return;
    }

    if (this.rideRequestSubscription) {
      return;
    }

    this.rideRequestSubscription = this.driverRideRequestService
      .subscribeToRideRequests(this.driverId)
      .subscribe({
        next: (notification: any) => {


          if (notification.type === 'RIDE_CREATED') {
            if (this.activeRide) {
              this.activeRide = {
                ...this.activeRide,
                rideId: notification.rideId
              };
            }
          } else if (notification.type === 'RIDE_CANCELLED') {
            alert('Chuyến đi đã bị hủy bởi khách hàng.');
            if (this.showRideRequestModal) {
              this.showRideRequestModal = false;
              this.currentRideRequest = null;
            }
            if (this.showActiveRide) {
              this.onRideCancelled();
            }
          } else if (notification.type === 'RIDE_REQUEST_CANCELLED') {
            alert('Chuyến đi này đã bị khách hàng hủy trước khi bạn chấp nhận.');
            if (this.showRideRequestModal) {
              this.showRideRequestModal = false;
              this.currentRideRequest = null;
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
    this.rideRequestSubscription = undefined; // ← Fix: Set to undefined to allow re-subscription
  }

  private async showRideRequestNotification(notification: RideRequestNotification): Promise<void> {

    // Use startAddress and endAddress from backend if available, otherwise fallback to reverse geocode
    let startLocation = notification.startAddress || notification.startLocation;
    let endLocation = notification.endAddress || notification.endLocation;

    // Only reverse geocode if address is not provided
    if (!startLocation && notification.startLatitude && notification.startLongitude) {
      try {
        startLocation = await this.trackAsiaService.reverseGeocode(notification.startLongitude, notification.startLatitude);
      } catch (e) {
        console.error('Error reverse geocoding start location:', e);
        startLocation = 'Đang cập nhật...';
      }
    }

    if (!endLocation && notification.endLatitude && notification.endLongitude) {
      try {
        endLocation = await this.trackAsiaService.reverseGeocode(notification.endLongitude, notification.endLatitude);
      } catch (e) {
        endLocation = 'Đang cập nhật...';
      }
    }

    this.currentRideRequest = {
      rideRequestId: notification.rideRequestId,
      customerId: notification.customerId,
      customerName: notification.customerName,
      startLocation: startLocation || 'Đang cập nhật...',
      endLocation: endLocation || 'Đang cập nhật...',
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
      this.driverRideRequestService.sendDriverResponse(
        rideRequest.rideRequestId,
        this.driverId,
        true
      );
      this.driverStatus = 'Matching';
      this.driverPosUpdateService.setDriverStatus('Matching');

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

    this.showActiveRide = false;
    this.activeRide = null;
    this.driverStatus = 'Resting';
    this.driverPosUpdateService.setDriverStatus('Resting');
    this.driverPosUpdateService.stopGPSTracking();
    this.driverPosUpdateService.stopAutoLocationUpdate();
    this.resetMap();

    const timeout = setTimeout(() => {
      if (!this.showFinishedRide) {
        this.finishedRideInfo = {
          rideId: rideId,
          distance: 0,
          fare: 0,
          customerName: 'Khách hàng'
        };
        this.showFinishedRide = true;
        this.cdr.detectChanges();
      }
    }, 3000);

    this.rideService.getRideById(rideId).subscribe({
      next: (rideData) => {
        clearTimeout(timeout);

        this.finishedRideInfo = {
          rideId: rideId,
          distance: rideData.distance || 0,
          fare: rideData.fare || 0,
          customerName: rideData.customer?.name || 'Khách hàng',
          startTime: rideData.startTime,
          endTime: rideData.endTime || Date.now()
        };

        this.showFinishedRide = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        clearTimeout(timeout);
        console.error('Error fetching ride data:', err);

        this.finishedRideInfo = {
          rideId: rideId,
          distance: 0,
          fare: 0,
          customerName: 'Khách hàng'
        };

        this.showFinishedRide = true;
        this.cdr.detectChanges();
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
    this.driverPosUpdateService.setDriverStatus('Resting');
    this.driverPosUpdateService.stopGPSTracking();
    this.driverPosUpdateService.stopAutoLocationUpdate();
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
    this.gpsUpdateSubscription?.unsubscribe();
    // Service tự clean up khi stopAutoLocationUpdate() được gọi
  }
}
