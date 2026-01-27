import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { RideNotification } from "../../../components/customer-notification-modal/customer-notification-modal.component";
import { RideStatusUpdateService } from "../ride-status-update.service";
import { DriverPosUpdateService } from "../../../driver/services/driverPosUpdate.service";
import { DriverPositionUpdate } from "../../models/api-response.model";

enum RideState {
    IDLE = 'IDLE',           // Local state only, not sent to backend
    PENDING = 'PENDING',     // Searching for driver (backend: PENDING)
    CONFIRMED = 'CONFIRMED', // Driver accepted (backend: CONFIRMED)
    PICKINGUP = 'PICKINGUP', // Driver arriving/at pickup (backend: PICKINGUP)
    ONGOING = 'ONGOING',     // Ride in progress (backend: ONGOING)
    FINISHED = 'FINISHED',   // Ride completed (backend: FINISHED)
    CANCELLED = 'CANCELLED'  // Ride cancelled (backend: CANCELLED)
}

@Injectable({ providedIn: 'root' })
export class RideStateService {
    private rideStateSubject = new BehaviorSubject<RideState>(RideState.IDLE);
    private currentRideIdSubject = new BehaviorSubject<string | null>(null);
    private driverLocationSubject = new BehaviorSubject<{ lat: number; lng: number } | null>(null);
    private notificationSubject = new BehaviorSubject<RideNotification | null>(null);

    rideState$ = this.rideStateSubject.asObservable();
    currentRideId$ = this.currentRideIdSubject.asObservable();
    driverLocation$ = this.driverLocationSubject.asObservable();
    notification$ = this.notificationSubject.asObservable();

    private rideStatusSubscription?: Subscription;
    private driverPositionSubscription?: Subscription;

    constructor(
        private rideStatusUpdateService: RideStatusUpdateService,
        private driverPosUpdateService: DriverPosUpdateService
    ) { }

    // Subscribe to ride updates
    subscribeToRideUpdates(customerId: string): void {
        this.rideStatusSubscription = this.rideStatusUpdateService
            .subscribeToRideStatusUpdates(customerId)
            .subscribe({
                next: (update) => this.handleRideUpdate(update),
                error: (err) => console.error('WebSocket subscription error:', err)
            });
    }

    // Subscribe to driver position
    subscribeToDriverPosition(driverId: string): void {
        this.driverPositionSubscription = this.driverPosUpdateService
            .subscribeToDriverPositionUpdates(driverId)
            .subscribe({
                next: (message) => {
                    const update: DriverPositionUpdate = JSON.parse(message.body);
                    this.driverLocationSubject.next({ lat: update.lat, lng: update.lng });
                },
                error: (err) => console.error('Driver position error:', err)
            });
    }

    // Update ride state
    updateRideState(state: RideState): void {
        this.rideStateSubject.next(state);
    }

    // Update current ride ID
    updateCurrentRideId(rideId: string | null): void {
        this.currentRideIdSubject.next(rideId);
    }

    // Show notification
    showNotification(notification: RideNotification): void {
        this.notificationSubject.next(notification);
    }

    // Reset to idle
    resetToIdle(): void {
        this.updateRideState(RideState.IDLE);
        this.updateCurrentRideId(null);
        this.driverLocationSubject.next(null);
        this.notificationSubject.next(null);
        this.cleanup();
    }

    // Cleanup subscriptions
    cleanup(): void {
        this.rideStatusSubscription?.unsubscribe();
        this.driverPositionSubscription?.unsubscribe();
    }

    private handleRideUpdate(update: any): void {
        switch (update.type) {
            case 'RIDE_ACCEPTED':
                this.updateRideState(RideState.CONFIRMED);
                this.showNotification({
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
                });
                this.subscribeToDriverPosition(update.driverId);
                break;

            case 'RIDE_STATUS_UPDATE':
                this.handleStatusUpdate(update);
                break;

            case 'NO_DRIVER_AVAILABLE':
                this.updateRideState(RideState.IDLE);
                this.showNotification({
                    type: 'NO_DRIVER_AVAILABLE',
                    rideRequestId: update.rideRequestId,
                    message: update.message || 'No drivers available'
                });
                break;

            case 'RIDE_CANCELLED':
                this.showNotification({
                    type: 'RIDE_CANCELLED',
                    rideId: update.rideId,
                    message: update.cancelledBy === 'DRIVER' ? 'Driver cancelled the ride' : 'Ride cancelled',
                    timestamp: update.timestamp
                });
                setTimeout(() => this.resetToIdle(), 3000);
                break;
        }
    }

    private handleStatusUpdate(update: any): void {
        const statusMap: Record<string, RideState> = {
            'PICKINGUP': RideState.PICKINGUP,
            'ONGOING': RideState.ONGOING,
            'FINISHED': RideState.FINISHED,
            'CANCELLED': RideState.CANCELLED
        };

        const newState = statusMap[update.status];
        if (newState) {
            this.updateRideState(newState);
        }

        if (update.status === 'FINISHED' || update.status === 'CANCELLED') {
            setTimeout(() => this.resetToIdle(), 3000);
        }
    }
}
