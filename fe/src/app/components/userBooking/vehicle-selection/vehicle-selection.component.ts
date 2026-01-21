import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleType, Vehicle, RideFare, VEHICLE_PRICES, RouteInfo } from '../../../models/models';
import { formatCurrency } from '@angular/common';

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
            [class.ring-green-500]="selectedVehicle === vehicle.type"
            [class.bg-green-50]="selectedVehicle === vehicle.type"
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
                <div class="text-sm font-bold text-green-600 mt-1">
                  {{ formatPrice(getVehiclePrice(vehicle.type)) }}
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
      class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
      <span>Book {{ getSelectedVehicleName() }}</span>
    </button>
  </div>
`,

  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VehicleSelectionComponent {
  @Input() selectedVehicle: VehicleType = VehicleType.MOTORBIKE;
  @Input() routeInfo: RouteInfo | null = null;
  @Output() vehicleSelected = new EventEmitter<VehicleType>();
  @Output() bookRideClicked = new EventEmitter<VehicleType>();

  vehicles: (Vehicle & { image: string })[] = [
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

  selectVehicle(type: VehicleType): void {
    this.selectedVehicle = type;
    this.vehicleSelected.emit(type);
  }

  bookRide(): void {
    this.bookRideClicked.emit(this.selectedVehicle);
    console.log(`Booking a ${this.selectedVehicle}...`);
    // Assuming there's a parent component handling the actual booking logic
  }

  getSelectedVehicleName(): string {
    return this.vehicles.find(v => v.type === this.selectedVehicle)?.name || 'Ride';
  }

  getVehiclePrice(vehicleType: VehicleType): number {
    if (!this.routeInfo) return 0;

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
