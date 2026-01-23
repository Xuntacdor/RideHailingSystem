import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DriverData {
  name: string;
  avatarUrl: string;
  rating: number;
  vehicleModel: string;
  vehiclePlate: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-booked-ride-info',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="px-6 py-4">
    <!-- Driver Information Card -->
    <div class="bg-white rounded-2xl p-4 mb-4 shadow-md">
      <div class="flex items-center gap-4 mb-4">
        <!-- Driver Avatar -->
        <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <img 
            [src]="driverData?.avatarUrl || 'assets/default-avatar.png'" 
            [alt]="driverData?.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Driver Info -->
        <div class="flex-grow">
          <h3 class="font-bold text-lg text-gray-900">{{ driverData?.name || 'Driver' }}</h3>
        </div>

        <!-- Phone Contact Button -->
        @if (driverData?.phoneNumber && driverData?.phoneNumber !== 'N/A') {
          <a 
            [href]="'tel:' + (driverData?.phoneNumber || '')"
            class="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            
          </a>
        }
      </div>

      <!-- Vehicle Info -->
      <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div>
          <div class="text-sm text-gray-600">Vehicle</div>
          <div class="font-semibold text-gray-900">{{ driverData?.vehicleModel || 'N/A' }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600">Plate</div>
          <div class="font-bold text-blue-600">{{ driverData?.vehiclePlate || 'N/A' }}</div>
        </div>
      </div>
    </div>

    <!-- Ride Status -->
    <div class="bg-white rounded-2xl p-4 mb-4 shadow-md">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-600">Ride Status</div>
          <div class="font-bold text-lg" [class]="getStatusColor()">
            {{ getStatusText() }}
          </div>
        </div>
      </div>

      @if (destination) {
        <div class="mt-3 pt-3 border-t border-gray-200">
          <div class="text-sm text-gray-600 mb-1">Destination</div>
          <div class="font-medium text-gray-900 line-clamp-2">{{ destination.name }}</div>
        </div>
      }
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button 
        (click)="onCancelRide()"
        class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        Cancel Ride
      </button>
    </div>
  </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class BookedRideInfoComponent {
  @Input() driverData: DriverData | null | undefined = null;
  @Input() rideStatus: string | null = null;
  @Input() driverLocation: { lat: number; lng: number } | null = null;
  @Input() destination: { lat: number; lng: number; name?: string } | null = null;

  @Output() cancelRide = new EventEmitter<void>();

  getStatusText(): string {
    switch (this.rideStatus) {
      case 'CONFIRMED':
        return 'Driver Confirmed';
      case 'PICKINGUP':
        return 'Driver is on the way';
      case 'ONGOING':
        return 'In Progress';
      case 'FINISHED':
        return 'Ride Completed';
      case 'CANCELLED':
        return 'Ride Cancelled';
      default:
        return 'Waiting for driver...';
    }
  }

  getStatusColor(): string {
    switch (this.rideStatus) {
      case 'CONFIRMED':
        return 'text-blue-600';
      case 'PICKINGUP':
        return 'text-yellow-600';
      case 'ONGOING':
        return 'text-green-600';
      case 'FINISHED':
        return 'text-gray-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  }


  onCancelRide(): void {
    if (confirm('Are you sure you want to cancel this ride?')) {
      this.cancelRide.emit();
    }
  }
}
