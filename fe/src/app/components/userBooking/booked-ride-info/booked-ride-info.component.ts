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
  <div class="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 transition-all hover:shadow-2xl">
    <div class="flex items-center gap-4">
      <!-- Avatar w/ Status Ring -->
      <div class="relative">
        <div class="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 to-purple-500">
          <img 
            [src]="driverData?.avatarUrl || 'assets/default-avatar.png'" 
            class="w-full h-full rounded-full object-cover border-2 border-white"
            [alt]="driverData?.name"
          />
        </div>
        <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
          <div class="w-3 h-3 rounded-full animate-pulse" 
               [ngClass]="{
                 'bg-blue-500': rideStatus === 'CONFIRMED',
                 'bg-yellow-500': rideStatus === 'PICKINGUP',
                 'bg-green-500': rideStatus === 'ONGOING',
                 'bg-gray-500': rideStatus === 'FINISHED'
               }">
          </div>
        </div>
      </div>

      <!-- Driver & Vehicle Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-0.5">
          <h3 class="font-bold text-gray-900 truncate pr-2">{{ driverData?.name }}</h3>
          <div class="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-yellow-500">
              <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-bold text-gray-700">{{ driverData?.rating || 4.5 }}</span>
          </div>
        </div>
        
        <p class="text-xs text-gray-500 truncate mb-1">
          {{ driverData?.vehicleModel }} 
        </p>
        <span class="font-semibold text-gray-900">{{ driverData?.vehiclePlate }}</span>
        
        <p class="text-xs font-semibold uppercase tracking-wide" [class]="getStatusColor()">
          {{ getStatusText() }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center border-l border-gray-100 pl-3 ml-1">
        <!-- Cancel Button (Mini) -->
        <button (click)="onCancelRide()" 
                class="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Hủy chuyến">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
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
        return 'Tài xế đã nhận chuyến';
      case 'PICKINGUP':
        return 'Tài xế đang đến';
      case 'ONGOING':
        return 'Đang di chuyển';
      case 'FINISHED':
        return 'Chuyến đi hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy chuyến';
      default:
        return 'Đang tìm tài xế...';
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
    if (confirm('Bạn có chắc chắn muốn hủy chuyến đi này không?')) {
      this.cancelRide.emit();
    }
  }
}
