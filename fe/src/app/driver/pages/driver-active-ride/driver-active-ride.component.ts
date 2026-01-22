import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../../components/userBooking/map/map.component';
import { Coordinate } from '../../../models/models';
import { RideService } from '../../../core/services/ride.service';
import { TrackAsiaService } from '../../../core/services/trackasia.service';

export interface ActiveRide {
    rideId: string;
    customerId: string;
    pickupLat: number;
    pickupLng: number;
    destinationLat?: number;
    destinationLng?: number;
    pickupLocation: string;
    destinationLocation: string;
    status: string;
}

@Component({
    selector: 'app-driver-active-ride',
    standalone: true,
    imports: [CommonModule, MapComponent],
    template: `
    <div class="w-full h-screen relative overflow-hidden bg-gray-100">
      <!-- Map showing route -->
      <app-map 
        [origin]="pickupCoordinate" 
        [destination]="destinationCoordinate"
        [routeGeometry]="routeGeometry"
        class="absolute inset-0 z-0">
      </app-map>
      
      <!-- Ride Info Panel -->
      <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] z-10">
        <div class="mb-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="m-0 text-lg font-bold text-gray-900">
              {{ navigationState === 'TO_PICKUP' ? '🚗 Đang đến điểm đón' : '🎯 Đang đi đến điểm trả' }}
            </h3>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {{ getRideStatusText() }}
            </span>
          </div>
          <p class="m-0 text-base text-gray-600">
            <strong>📍 {{ activeRide?.pickupLocation }}</strong>
          </p>
          <p class="m-0 text-sm text-gray-500 mt-1">
            → {{ activeRide?.destinationLocation }}
          </p>
        </div>
        
        <div class="flex flex-col gap-3">
          <button 
            *ngIf="navigationState === 'TO_PICKUP' && arrivedAtPickupPoint" 
            (click)="markPickedUp()"
            class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
            ✅ Đã đón khách
          </button>
          
          <button 
            *ngIf="navigationState === 'TO_DESTINATION' && arrivedAtDestinationPoint"
            (click)="completeRide()"
            class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            🎉 Hoàn thành chuyến
          </button>
          
          <button 
            (click)="showCancelConfirm()" 
            class="w-full px-4 py-4 border-0 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-100 text-red-500 hover:bg-red-50">
            ❌ Hủy chuyến
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
    </div>
  `,
    styles: []
})
export class DriverActiveRideComponent implements OnInit, OnDestroy {
    @Input() activeRide: ActiveRide | null = null;
    @Output() rideCompleted = new EventEmitter<void>();
    @Output() rideCancelled = new EventEmitter<void>();

    navigationState: 'TO_PICKUP' | 'TO_DESTINATION' = 'TO_PICKUP';
    arrivedAtPickupPoint = false;
    arrivedAtDestinationPoint = false;
    showCancelModal = false;

    pickupCoordinate: Coordinate | null = null;
    destinationCoordinate: Coordinate | null = null;
    routeGeometry: any = null;

    constructor(
        private rideService: RideService,
        private trackAsiaService: TrackAsiaService
    ) { }

    ngOnInit(): void {
        if (this.activeRide) {
            this.pickupCoordinate = {
                lat: this.activeRide.pickupLat,
                lng: this.activeRide.pickupLng,
                name: this.activeRide.pickupLocation
            };

            if (this.activeRide.destinationLat && this.activeRide.destinationLng) {
                this.destinationCoordinate = {
                    lat: this.activeRide.destinationLat,
                    lng: this.activeRide.destinationLng,
                    name: this.activeRide.destinationLocation
                };
            }

            // Calculate initial route to pickup
            this.calculateRouteToPickup();
        }
    }

    private async calculateRouteToPickup(): Promise<void> {
        if (!this.pickupCoordinate) return;

        try {
            // Get current driver position
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const driverLng = position.coords.longitude;
                    const driverLat = position.coords.latitude;

                    const routeData = await this.trackAsiaService.getDirections(
                        driverLng,
                        driverLat,
                        this.pickupCoordinate!.lng,
                        this.pickupCoordinate!.lat
                    );

                    if (routeData) {
                        this.routeGeometry = routeData.geometry;
                    }
                },
                (error) => console.error('Error getting driver location:', error)
            );
        } catch (error) {
            console.error('Error calculating route:', error);
        }
    }

    getRideStatusText(): string {
        switch (this.navigationState) {
            case 'TO_PICKUP': return 'Đang di chuyển';
            case 'TO_DESTINATION': return 'Có khách';
            default: return 'Đang hoạt động';
        }
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
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const driverLng = position.coords.longitude;
                    const driverLat = position.coords.latitude;

                    const routeData = await this.trackAsiaService.getDirections(
                        driverLng,
                        driverLat,
                        this.destinationCoordinate!.lng,
                        this.destinationCoordinate!.lat
                    );

                    if (routeData) {
                        this.routeGeometry = routeData.geometry;
                    }
                },
                (error) => console.error('Error getting driver location:', error)
            );
        } catch (error) {
            console.error('Error calculating route:', error);
        }
    }

    completeRide(): void {
        if (!this.activeRide) return;

        this.rideService.updateRideStatus(this.activeRide.rideId, 'FINISHED')
            .subscribe({
                next: () => {
                    alert('🎉 Chuyến đi hoàn thành!');
                    this.rideCompleted.emit();
                },
                error: (err) => {
                    console.error('Error completing ride:', err);
                    alert('Không thể hoàn thành chuyến đi');
                }
            });
    }

    showCancelConfirm(): void {
        this.showCancelModal = true;
    }

    cancelRide(): void {
        if (!this.activeRide) return;

        this.rideService.updateRideStatus(this.activeRide.rideId, 'REJECTED')
            .subscribe({
                next: () => {
                    alert('Chuyến đi đã bị hủy');
                    this.rideCancelled.emit();
                },
                error: (err) => {
                    console.error('Error canceling ride:', err);
                    alert('Không thể hủy chuyến đi');
                }
            });
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }
}
