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
    <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] z-10 pointer-events-auto">
        <div class="mb-5">
            <div class="flex items-center justify-between mb-3">
                <h3 class="m-0 text-lg font-bold text-gray-900">
                    {{ navigationState === 'TO_PICKUP' ? 'Đang đến điểm đón' : 'Đang đi đến điểm trả' }}
                </h3>
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {{ getRideStatusText() }}
                </span>
            </div>
            <p class="m-0 text-base text-gray-600">
            </p>
            <p class="m-0 text-sm text-gray-500 mt-1">
            </p>
        </div>
        
        <div class="flex flex-col gap-3">
            <button 
                *ngIf="navigationState === 'TO_PICKUP' && !arrivedAtPickupPoint" 
                (click)="markArrived()"
                class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,179,8,0.3)]">
                Đã đến điểm đón
            </button>
            
            <button 
                *ngIf="navigationState === 'TO_PICKUP' && arrivedAtPickupPoint" 
                (click)="markPickedUp()"
                class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
                Đã đón khách
            </button>
            
            <button 
                *ngIf="navigationState === 'TO_DESTINATION' && !arrivedAtDestinationPoint"
                (click)="completeRide()"
                [disabled]="isCompletingRide"
                class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] disabled:opacity-70">
                {{ isCompletingRide ? 'Đang hoàn thành...' : 'Hoàn thành chuyến' }}
            </button>
            
            <button 
                (click)="showCancelConfirm()" 
                class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-100 text-red-500 hover:bg-red-50">
                Hủy chuyến
            </button>
        </div>
    </div>
    
    <!-- Cancel Confirmation Modal -->
    <div 
        *ngIf="showCancelModal" 
        (click)="showCancelModal = false"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
        <div 
            (click)="$event.stopPropagation()"
            class="bg-white rounded-2xl p-6 max-w-[400px] w-[90%]">
            <h3 class="m-0 mb-3 text-xl text-gray-900">Xác nhận hủy chuyến?</h3>
            <p class="m-0 mb-5 text-gray-500">Bạn có chắc chắn muốn hủy chuyến đi này?</p>
            <div class="flex gap-3">
                <button 
                    (click)="showCancelModal = false" 
                    class="flex-1 px-4 py-3 border-0 rounded-lg font-semibold cursor-pointer bg-gray-100 text-gray-900">
                    Không
                </button>
                <button 
                    (click)="cancelRide()" 
                    class="flex-1 px-4 py-3 border-0 rounded-lg font-semibold cursor-pointer bg-red-500 text-white">
                    Có, hủy chuyến
                </button>
            </div>
        </div>
    </div>
    `,
    styles: []
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
