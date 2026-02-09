import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coordinate } from '../../../models/models';
import { RideService } from '../../../core/services/ride.service';
import { TrackAsiaService } from '../../../core/services/trackasia.service';
import { DriverPosUpdateService } from '../../services/driverPosUpdate.service';
import { DriverRideRequestService } from '../../services/driver-ride-request.service';
import { Subscription } from 'rxjs';

export interface MapUpdate {
    origin: Coordinate | null;
    destination: Coordinate | null;
    routeGeometry: any;
}

export interface ActiveRide {
    rideId: string;
    customerId: string;
    pickupLat: number;
    pickupLng: number;
    destinationLat?: number;
    destinationLng?: number;
    // pickupLocation: string;
    // destinationLocation: string;
    status: string;
}

@Component({
    selector: 'app-driver-active-ride',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="active-ride-panel">
        <div class="ride-header">
            <div class="header-content">
                <h3 class="ride-title">
                    {{ navigationState === 'TO_PICKUP' ? 'Đang đến điểm đón' : 'Đang đi đến điểm trả' }}
                </h3>
                <span class="status-badge">
                    {{ getRideStatusText() }}
                </span>
            </div>
        </div>
        
        <div class="action-buttons">
            <button 
                *ngIf="navigationState === 'TO_PICKUP' && !arrivedAtPickupPoint" 
                (click)="markArrived()"
                class="btn btn-arrived">
                Đã đến điểm đón
            </button>
            
            <button 
                *ngIf="navigationState === 'TO_PICKUP' && arrivedAtPickupPoint" 
                (click)="markPickedUp()"
                class="btn btn-picked-up">
                Đã đón khách
            </button>
            
            <button 
                *ngIf="navigationState === 'TO_DESTINATION' && !arrivedAtDestinationPoint"
                (click)="completeRide()"
                [disabled]="isCompletingRide"
                class="btn btn-complete">
                {{ isCompletingRide ? 'Đang hoàn thành...' : 'Hoàn thành chuyến' }}
            </button>
            
            <button 
                (click)="showCancelConfirm()" 
                class="btn btn-cancel">
                Hủy chuyến
            </button>
        </div>
    </div>
    
    <!-- Cancel Confirmation Modal -->
    <div 
        *ngIf="showCancelModal" 
        (click)="showCancelModal = false"
        class="modal-overlay">
        <div 
            (click)="$event.stopPropagation()"
            class="modal-content">
            <h3 class="modal-title">Xác nhận hủy chuyến?</h3>
            <p class="modal-text">Bạn có chắc chắn muốn hủy chuyến đi này?</p>
            <div class="modal-actions">
                <button 
                    (click)="showCancelModal = false" 
                    class="modal-btn modal-btn-secondary">
                    Không
                </button>
                <button 
                    (click)="cancelRide()" 
                    class="modal-btn modal-btn-danger">
                    Có, hủy chuyến
                </button>
            </div>
        </div>
    </div>
    `,
    styles: [`
        /* Active Ride Panel - Mobile First */
        .active-ride-panel {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-radius: 24px 24px 0 0;
            padding: max(20px, env(safe-area-inset-bottom) + 20px) 20px 20px;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
            z-index: 10;
            pointer-events: auto;
            max-height: 50vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .ride-header {
            margin-bottom: 20px;
        }

        .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
        }

        .ride-title {
            margin: 0;
            font-size: clamp(16px, 4vw, 18px);
            font-weight: 700;
            color: #1a1a1a;
            flex: 1;
            min-width: 0;
        }

        .status-badge {
            padding: 6px 12px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 20px;
            font-size: clamp(12px, 3vw, 14px);
            font-weight: 600;
            white-space: nowrap;
        }

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        /* Button Base Styles - Touch Optimized */
        .btn {
            width: 100%;
            min-height: 52px;
            padding: 14px 20px;
            border: none;
            border-radius: 12px;
            font-size: clamp(15px, 3.5vw, 16px);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn:active {
            transform: scale(0.98);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-arrived {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .btn-picked-up {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-complete {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-cancel {
            background: #f3f4f6;
            color: #ef4444;
            box-shadow: none;
        }

        .btn-cancel:active {
            background: #fee2e2;
        }

        /* Modal Styles - Mobile Optimized */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            backdrop-filter: blur(4px);
        }

        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 24px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: modalSlideUp 0.3s ease;
        }

        @keyframes modalSlideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-title {
            margin: 0 0 12px 0;
            font-size: clamp(18px, 4.5vw, 20px);
            font-weight: 700;
            color: #1a1a1a;
        }

        .modal-text {
            margin: 0 0 24px 0;
            font-size: clamp(14px, 3.5vw, 15px);
            color: #6b7280;
            line-height: 1.5;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
        }

        .modal-btn {
            flex: 1;
            min-height: 48px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-size: clamp(14px, 3.5vw, 15px);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .modal-btn:active {
            transform: scale(0.97);
        }

        .modal-btn-secondary {
            background: #f3f4f6;
            color: #1a1a1a;
        }

        .modal-btn-danger {
            background: #ef4444;
            color: white;
        }

        /* Tablet Optimization */
        @media (min-width: 768px) {
            .active-ride-panel {
                left: auto;
                right: 24px;
                bottom: 24px;
                width: 400px;
                border-radius: 20px;
                max-height: 60vh;
            }

            .action-buttons {
                gap: 14px;
            }

            .btn {
                min-height: 56px;
            }
        }

        /* Desktop Hover Effects */
        @media (min-width: 1024px) {
            .btn:not(:disabled):hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
            }

            .btn:not(:disabled):active {
                transform: translateY(0);
            }

            .btn-arrived:hover {
                box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
            }

            .btn-picked-up:hover {
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            }

            .btn-complete:hover {
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }

            .modal-btn:hover {
                transform: translateY(-1px);
            }

            .modal-btn:active {
                transform: translateY(0);
            }
        }

        /* Landscape Mobile */
        @media (max-height: 600px) and (orientation: landscape) {
            .active-ride-panel {
                max-height: 70vh;
                padding: 16px 20px;
            }

            .ride-header {
                margin-bottom: 16px;
            }

            .action-buttons {
                gap: 10px;
            }

            .btn {
                min-height: 44px;
                padding: 10px 16px;
            }
        }

        /* Very Small Devices */
        @media (max-width: 360px) {
            .active-ride-panel {
                padding: 16px;
            }

            .action-buttons {
                gap: 10px;
            }

            .btn {
                min-height: 48px;
                padding: 12px 16px;
            }

            .modal-content {
                padding: 20px;
            }
        }
    `]
})
export class DriverActiveRideComponent implements OnInit, OnDestroy, OnChanges {
    @Input() activeRide: ActiveRide | null = null;
    @Input() driverId: string | null = null;
    @Output() rideCompleted = new EventEmitter<void>();
    @Output() rideCancelled = new EventEmitter<void>();
    @Output() mapUpdate = new EventEmitter<MapUpdate>();

    navigationState: 'TO_PICKUP' | 'TO_DESTINATION' = 'TO_PICKUP';
    arrivedAtPickupPoint = false;
    arrivedAtDestinationPoint = false;
    showCancelModal = false;
    isCompletingRide = false;

    private pickupCoordinate: Coordinate | null = null;
    private destinationCoordinate: Coordinate | null = null;
    private locationSubscription?: Subscription;
    private notificationSubscription?: Subscription;

    constructor(
        private rideService: RideService,
        private trackAsiaService: TrackAsiaService,
        private driverPosUpdateService: DriverPosUpdateService,
        private driverRideRequestService: DriverRideRequestService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.subscribeToLocationUpdates();

        if (this.activeRide) {
            // Wait for location to be available before calculating routes
            this.waitForLocationThenInitialize();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['activeRide'] && changes['activeRide'].currentValue && !changes['activeRide'].firstChange) {
            this.initializeRide();
        }
    }

    private subscribeToNotifications(): void {
        if (!this.driverId) return;

        this.notificationSubscription = this.driverRideRequestService
            .subscribeToRideRequests(this.driverId)
            .subscribe({
                next: (notification: any) => {
                    if (notification.type === 'RIDE_CANCELLED') {
                        console.log('Ride cancelled notification received:', notification);
                        if (notification.rideId === this.activeRide?.rideId) {
                            alert('Chuyến đi đã bị hủy bởi khách hàng');
                            this.rideCancelled.emit();
                        }
                    }
                },
                error: (err) => console.error('Notification subscription error:', err)
            });
    }

    private subscribeToLocationUpdates(): void {
        let isFirstLocation = true;
        this.locationSubscription = this.driverPosUpdateService.location$.subscribe(location => {
            if (location) {
                // On first location after reload, recalculate route if needed
                if (isFirstLocation && this.activeRide) {
                    isFirstLocation = false;
                    console.log('📍 First location received after reload, recalculating route');
                    if (this.navigationState === 'TO_DESTINATION') {
                        this.calculateRouteToDestination();
                    } else {
                        this.calculateRouteToPickup();
                    }
                }
                this.checkArrival(location);
            }
        });
    }

    private async waitForLocationThenInitialize(): Promise<void> {
        try {
            const location = await this.waitForLocation(10000);
            console.log('✅ Location available, initializing ride:', location);
            this.initializeRide();
        } catch (error) {
            console.warn('⚠️ Timeout waiting for location, will recalculate when available');
            this.initializeRideWithoutRoutes();
        }
    }

    private waitForLocation(timeout: number = 10000): Promise<{ lat: number; lng: number }> {
        return new Promise((resolve, reject) => {
            let subscription: any;

            const timeoutId = setTimeout(() => {
                if (subscription) {
                    subscription.unsubscribe();
                }
                reject(new Error('Timeout waiting for location'));
            }, timeout);

            subscription = this.driverPosUpdateService.location$.subscribe(location => {
                if (location) {
                    clearTimeout(timeoutId);
                    subscription.unsubscribe();
                    resolve(location);
                }
            });
        });
    }

    private checkArrival(currentLocation: { lat: number; lng: number }): void {
        if (this.navigationState === 'TO_DESTINATION' && !this.arrivedAtDestinationPoint && !this.isCompletingRide) {
            if (this.destinationCoordinate) {
                const distance = this.calculateDistance(
                    currentLocation.lat,
                    currentLocation.lng,
                    this.destinationCoordinate.lat,
                    this.destinationCoordinate.lng
                );


                if (distance < 0.05) {
                    console.log('Arrived at destination (auto-detected)');
                    this.completeRide();
                }
            }
        }
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private initializeRide(): void {
        if (!this.activeRide) return;

        console.log('Initializing ride with status:', this.activeRide.status);

        // Reset flags
        this.arrivedAtDestinationPoint = false;
        this.isCompletingRide = false;

        // Set navigation state based on ride status
        if (this.activeRide.status === 'ONGOING') {
            this.navigationState = 'TO_DESTINATION';
            this.arrivedAtPickupPoint = false;
        } else if (this.activeRide.status === 'PICKINGUP') {
            this.navigationState = 'TO_PICKUP';
            this.arrivedAtPickupPoint = true;
        } else {
            this.navigationState = 'TO_PICKUP';
            this.arrivedAtPickupPoint = false;
        }

        this.pickupCoordinate = {
            lat: this.activeRide.pickupLat,
            lng: this.activeRide.pickupLng,
            // name: this.activeRide.pickupLocation
        };

        if (this.activeRide.destinationLat && this.activeRide.destinationLng) {
            this.destinationCoordinate = {
                lat: this.activeRide.destinationLat,
                lng: this.activeRide.destinationLng,
                // name: this.activeRide.destinationLocation
            };
        }

        // Calculate appropriate route based on current state
        if (this.navigationState === 'TO_DESTINATION') {
            this.calculateRouteToDestination();
        } else {
            this.calculateRouteToPickup();
        }
    }

    private initializeRideWithoutRoutes(): void {
        if (!this.activeRide) return;

        console.log('Initializing ride without routes (will calculate when location available):', this.activeRide.status);

        // Reset flags
        this.arrivedAtDestinationPoint = false;
        this.isCompletingRide = false;

        // Set navigation state based on ride status
        if (this.activeRide.status === 'ONGOING') {
            this.navigationState = 'TO_DESTINATION';
            this.arrivedAtPickupPoint = false;
        } else if (this.activeRide.status === 'PICKINGUP') {
            this.navigationState = 'TO_PICKUP';
            this.arrivedAtPickupPoint = true;
        } else {
            this.navigationState = 'TO_PICKUP';
            this.arrivedAtPickupPoint = false;
        }

        this.pickupCoordinate = {
            lat: this.activeRide.pickupLat,
            lng: this.activeRide.pickupLng,
        };

        if (this.activeRide.destinationLat && this.activeRide.destinationLng) {
            this.destinationCoordinate = {
                lat: this.activeRide.destinationLat,
                lng: this.activeRide.destinationLng,
            };
        }

        // Routes will be calculated when first location is received
    }

    private async calculateRouteToPickup(): Promise<void> {
        if (!this.pickupCoordinate) return;

        try {
            const position = await this.driverPosUpdateService.getApproximateLocation();
            const driverLng = position.lng;
            const driverLat = position.lat;

            const routeData = await this.trackAsiaService.getDirections(
                driverLng,
                driverLat,
                this.pickupCoordinate!.lng,
                this.pickupCoordinate!.lat
            );

            if (routeData) {
                this.emitMapUpdate(
                    routeData.geometry,
                    { lat: driverLat, lng: driverLng },
                    this.pickupCoordinate
                );
                this.cdr.detectChanges();
            }
        } catch (error) {
            console.warn('⚠️ Error calculating route to pickup:', error);
            console.log('Will retry when location becomes available');
            // Route will be calculated when location subscription receives update
        }
    }

    getRideStatusText(): string {
        switch (this.navigationState) {
            case 'TO_PICKUP': return 'Đang di chuyển';
            case 'TO_DESTINATION': return 'Có khách';
            default: return 'Đang hoạt động';
        }
    }

    markArrived(): void {
        if (!this.activeRide || this.arrivedAtPickupPoint) return;

        this.rideService.updateRideStatus(this.activeRide.rideId, 'PICKINGUP')
            .subscribe({
                next: () => {
                    this.arrivedAtPickupPoint = true;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    alert('Không thể cập nhật trạng thái');
                }
            });
    }

    markPickedUp(): void {
        if (!this.activeRide) return;

        this.rideService.updateRideStatus(this.activeRide.rideId, 'ONGOING')
            .subscribe({
                next: () => {
                    console.log('Customer picked up, navigating to destination');
                    this.navigationState = 'TO_DESTINATION';
                    this.arrivedAtPickupPoint = false;

                    // Recalculate route to destination
                    if (this.destinationCoordinate) {
                        this.calculateRouteToDestination();
                    }
                },
                error: (err) => {
                    console.error('Error updating ride status:', err);
                    alert('Không thể cập nhật trạng thái chuyến đi');
                }
            });
    }

    private async calculateRouteToDestination(): Promise<void> {
        if (!this.destinationCoordinate) return;

        try {
            const position = await this.driverPosUpdateService.getApproximateLocation();
            const driverLng = position.lng;
            const driverLat = position.lat;

            const routeData = await this.trackAsiaService.getDirections(
                driverLng,
                driverLat,
                this.destinationCoordinate!.lng,
                this.destinationCoordinate!.lat
            );

            if (routeData) {
                console.log('Route to destination calculated, emitting update');
                this.emitMapUpdate(
                    routeData.geometry,
                    this.pickupCoordinate, // Or current driver location if continuously updating
                    this.destinationCoordinate
                );
                this.cdr.detectChanges();
            }
        } catch (error) {
            console.error('⚠️ Error calculating route to destination:', error);
            console.log('Will retry when location becomes available');
            // Route will be calculated when location subscription receives update
        }
    }

    private emitMapUpdate(geometry: any, origin: Coordinate | null, destination: Coordinate | null): void {
        this.mapUpdate.emit({
            origin: origin,
            destination: destination,
            routeGeometry: geometry
        });
        console.log('emit map update with origin/dest');
        this.cdr.detectChanges();
    }

    completeRide(): void {
        if (!this.activeRide || this.isCompletingRide) return;

        this.isCompletingRide = true;
        this.cdr.detectChanges();

        this.rideService.updateRideStatus(this.activeRide.rideId, 'FINISHED')
            .subscribe({
                next: (rideResponse) => {
                    console.log('Ride completed with data:', rideResponse);

                    this.rideCompleted.emit();
                    this.isCompletingRide = false;
                },
                error: (err) => {
                    console.error('Error completing ride:', err);
                    alert('Không thể hoàn thành chuyến đi');
                    this.isCompletingRide = false;
                    this.cdr.detectChanges();
                }
            });
    }

    showCancelConfirm(): void {
        this.showCancelModal = true;
    }

    cancelRide(): void {
        if (!this.activeRide || !this.driverId) return;

        this.rideService.cancelRide(this.activeRide.rideId, this.driverId, 'DRIVER')
            .subscribe({
                next: () => {
                    alert('Chuyến đi đã bị hủy');
                    this.showCancelModal = false;
                    this.rideCancelled.emit();
                },
                error: (err) => {
                    console.error('Error canceling ride:', err);
                    alert('Không thể hủy chuyến đi');
                }
            });
    }

    ngOnDestroy(): void {
        this.locationSubscription?.unsubscribe();
        this.notificationSubscription?.unsubscribe();
    }
}
