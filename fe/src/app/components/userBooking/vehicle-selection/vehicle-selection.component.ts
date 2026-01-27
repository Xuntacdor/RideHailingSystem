import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleType, Vehicle, RideFare, VEHICLE_PRICES, RouteInfo } from '../../../models/models';
import { BookingTypeResponse } from '../../../core/services/booking-type.service';

@Component({
  selector: 'app-vehicle-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="px-2 py-4">
    
    <!-- Fixed height container để force scroll -->
    <div class="h-[250px] overflow-y-auto mb-4 p-2">
      <div class="space-y-3">
        @for (vehicle of vehicles; track vehicle.type) {
          <button
            (click)="selectVehicle(vehicle.type)"
            [class.ring-2]="selectedVehicle === vehicle.type"
            [class.ring-blue-500]="selectedVehicle === vehicle.type"
            [class.bg-blue-50]="selectedVehicle === vehicle.type"
            class="relative flex items-center p-1 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 group w-full">
            
            <!-- Image Section -->
            <div class="w-15 h-15 flex-shrink-0 mr-4 relative overflow-hidden rounded-lg">
              <img 
                [src]="vehicle.image" 
                [alt]="vehicle.name"
                [class.scale-110]="selectedVehicle === vehicle.type"
                class="w-full h-full object-contain transition-transform duration-300 ease-out"
              />
            </div>

            <!-- Info Section -->
            <div class="flex-grow text-left">
              <div class="font-bold text-gray-900 text-lg ">{{ vehicle.name }}</div>
              <div class="text-xs text-gray-500">{{ vehicle.description }}</div>
              @if (routeInfo) {
                <div class="text-sm font-bold text-blue-600 mt-1">
                  {{ formatPrice(getVehiclePrice(vehicle.type, vehicle.bookingType)) }}
                </div>
              }
            </div>
          </button>
        }
      </div>
    </div>

    <!-- Book Button -->
    <button 
      (click)="bookRide()"
      [disabled]="disabled || isLoading"
      [class.opacity-50]="disabled || isLoading"
      [class.cursor-not-allowed]="disabled || isLoading"
      class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
      @if (isLoading) {
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Processing...</span>
      } @else {
        <span>Book {{ getSelectedVehicleName() }}</span>
      }
    </button>
  </div>
`,

  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VehicleSelectionComponent implements OnChanges {
  @Input() selectedVehicle: VehicleType = VehicleType.MOTORBIKE;
  @Input() routeInfo: RouteInfo | null = null;
  @Input() bookingTypes: BookingTypeResponse[] = [];
  @Input() isLoading = false;
  @Input() disabled = false;
  @Output() vehicleSelected = new EventEmitter<VehicleType>();
  @Output() bookRideClicked = new EventEmitter<VehicleType>();

  vehicles: (Vehicle & { image: string; bookingType?: BookingTypeResponse })[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookingTypes'] && this.bookingTypes.length > 0) {
      this.updateVehiclesFromBookingTypes();
    } else if (this.vehicles.length === 0) {
      this.loadDefaultVehicles();
    }
  }

  private updateVehiclesFromBookingTypes(): void {
    this.vehicles = this.bookingTypes.map(bt => ({
      type: bt.vehicleType === 'CAR' ? VehicleType.CAR : VehicleType.MOTORBIKE,
      name: bt.name,
      description: bt.description || '',
      icon: bt.vehicleType === 'CAR' ? '🚗' : '🛵',
      priceMultiplier: 1.0, // Not used when we have bookingType
      image: bt.iconUrl || (bt.vehicleType === 'CAR' ? '/images/car.png' : '/images/motorbike.png'),
      bookingType: bt
    }));
  }

  private loadDefaultVehicles(): void {
    this.vehicles = [
      {
        type: VehicleType.MOTORBIKE,
        name: 'Bike',
        description: 'Fast and affordable for 1 person',
        icon: '🛵',
        priceMultiplier: 1.0,
        image: '/images/motorbike.png'
      },
      {
        type: VehicleType.CAR,
        name: 'Car',
        description: 'Comfortable ride for 4 people',
        icon: '🚗',
        priceMultiplier: 2.5,
        image: '/images/car.png'
      }
    ];
  }

  selectVehicle(type: VehicleType): void {
    this.selectedVehicle = type;
    this.vehicleSelected.emit(type);
  }

  bookRide(): void {
    if (this.disabled || this.isLoading) return;
    this.bookRideClicked.emit(this.selectedVehicle);
    console.log(`Booking a ${this.selectedVehicle}...`);
  }

  getSelectedVehicleName(): string {
    return this.vehicles.find(v => v.type === this.selectedVehicle)?.name || 'Ride';
  }

  getVehiclePrice(vehicleType: VehicleType, bookingType?: BookingTypeResponse): number {
    if (!this.routeInfo) return 0;

    if (bookingType) {
      // Use API pricing from booking type
      const baseFare = bookingType.baseFare;
      const pricePerKm = bookingType.pricePerKm;
      const pricePerMinute = bookingType.pricePerMinute;

      const extraDistance = Math.max(0, this.routeInfo.distance - 2);
      const total = baseFare + (extraDistance * pricePerKm) + (this.routeInfo.duration * pricePerMinute);
      return Math.round(total / 1000) * 1000;
    }

    // Fallback to hardcoded pricing
    const fare = this.calculateFare(vehicleType, this.routeInfo.distance, this.routeInfo.duration);
    return fare.total;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' ₫';
  }

  calculateFare(
    vehicleType: VehicleType,
    distance: number,
    duration: number
  ): RideFare {
    const config = VEHICLE_PRICES[vehicleType];

    const baseFare = config.baseFare;

    const extraDistance = Math.max(0, distance - 2);
    const distanceFee = extraDistance * config.pricePerKm;

    const timeFee = duration * config.pricePerMinute;

    const total = baseFare + distanceFee + timeFee;

    // Round to nearest 1000 VND for cleaner pricing (e.g., 40k, 34k)
    const roundTo1000 = (value: number) => Math.round(value / 1000) * 1000;

    return {
      baseFare: roundTo1000(baseFare),
      distanceFee: roundTo1000(distanceFee),
      timeFee: roundTo1000(timeFee),
      total: roundTo1000(total)
    };
  }
}
