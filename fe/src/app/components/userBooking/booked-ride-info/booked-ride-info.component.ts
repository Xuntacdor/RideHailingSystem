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
  <div class="ride-info-card">
    <div class="card-content">
      <!-- Avatar w/ Status Ring -->
      <div class="avatar-container">
        <div class="avatar-ring">
          <img 
            [src]="driverData?.avatarUrl || 'assets/default-avatar.png'" 
            class="avatar-img"
            [alt]="driverData?.name"
          />
        </div>
        <div class="status-indicator">
          <div class="status-dot" 
               [ngClass]="{
                 'status-confirmed': rideStatus === 'CONFIRMED',
                 'status-pickingup': rideStatus === 'PICKINGUP',
                 'status-ongoing': rideStatus === 'ONGOING',
                 'status-finished': rideStatus === 'FINISHED'
               }">
          </div>
        </div>
      </div>

      <!-- Driver & Vehicle Info -->
      <div class="driver-info">
        <div class="driver-header">
          <h3 class="driver-name">{{ driverData?.name }}</h3>
          <div class="rating-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star-icon">
              <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
            </svg>
            <span class="rating-text">{{ driverData?.rating || 4.5 }}</span>
          </div>
        </div>
        
        <p class="vehicle-model">
          {{ driverData?.vehicleModel }} 
        </p>
        <span class="vehicle-plate">{{ driverData?.vehiclePlate }}</span>
        
        <p class="ride-status" [class]="getStatusColor()">
          {{ getStatusText() }}
        </p>
      </div>

      <!-- Actions -->
      <div class="actions-container">
        <!-- Cancel Button (Mini) - Only show for CONFIRMED and PICKINGUP -->
        <button *ngIf="canCancelRide()" 
                (click)="onCancelRide()" 
                class="cancel-btn"
                title="Hủy chuyến">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="cancel-icon">
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

    /* Mobile-First Card Design */
    .ride-info-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 16px;
      transition: all 0.3s ease;
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Avatar Section */
    .avatar-container {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-ring {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      padding: 2px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: white;
      border-radius: 50%;
      padding: 3px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    .status-confirmed { background: #3b82f6; }
    .status-pickingup { background: #f59e0b; }
    .status-ongoing { background: #10b981; }
    .status-finished { background: #6b7280; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Driver Info Section */
    .driver-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .driver-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 2px;
    }

    .driver-name {
      font-weight: 700;
      font-size: clamp(15px, 3.5vw, 16px);
      color: #1a1a1a;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .rating-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #fef3c7;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid #fde68a;
      flex-shrink: 0;
    }

    .star-icon {
      width: 12px;
      height: 12px;
      color: #f59e0b;
    }

    .rating-text {
      font-size: clamp(11px, 2.5vw, 12px);
      font-weight: 700;
      color: #374151;
    }

    .vehicle-model {
      font-size: clamp(12px, 3vw, 13px);
      color: #6b7280;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vehicle-plate {
      font-weight: 600;
      font-size: clamp(13px, 3vw, 14px);
      color: #1a1a1a;
    }

    .ride-status {
      font-size: clamp(11px, 2.8vw, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 4px 0 0 0;
    }

    /* Status Colors */
    .text-blue-600 { color: #2563eb; }
    .text-yellow-600 { color: #d97706; }
    .text-green-600 { color: #059669; }
    .text-gray-600 { color: #4b5563; }
    .text-red-600 { color: #dc2626; }
    .text-gray-500 { color: #6b7280; }

    /* Actions Section */
    .actions-container {
      display: flex;
      align-items: center;
      padding-left: 12px;
      margin-left: 4px;
      border-left: 1px solid #e5e7eb;
      flex-shrink: 0;
    }

    .cancel-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #fee2e2;
      color: #ef4444;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .cancel-btn:active {
      transform: scale(0.95);
      background: #fecaca;
    }

    .cancel-icon {
      width: 20px;
      height: 20px;
    }

    /* Tablet Optimization */
    @media (min-width: 768px) {
      .ride-info-card {
        padding: 18px;
        border-radius: 20px;
      }

      .card-content {
        gap: 16px;
      }

      .avatar-ring {
        width: 64px;
        height: 64px;
      }

      .status-dot {
        width: 14px;
        height: 14px;
      }

      .driver-info {
        gap: 6px;
      }

      .actions-container {
        padding-left: 16px;
        margin-left: 8px;
      }
    }

    /* Desktop Hover Effects */
    @media (min-width: 1024px) {
      .ride-info-card:hover {
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .cancel-btn:hover {
        background: #fecaca;
        transform: scale(1.05);
      }

      .cancel-btn:active {
        transform: scale(0.95);
      }
    }

    /* Very Small Devices */
    @media (max-width: 360px) {
      .ride-info-card {
        padding: 12px;
      }

      .card-content {
        gap: 10px;
      }

      .avatar-ring {
        width: 48px;
        height: 48px;
      }

      .cancel-btn {
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
      }

      .cancel-icon {
        width: 18px;
        height: 18px;
      }
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

  canCancelRide(): boolean {
    return this.rideStatus === 'CONFIRMED' || this.rideStatus === 'PICKINGUP';
  }

  onCancelRide(): void {
    if (confirm('Bạn có chắc chắn muốn hủy chuyến đi này không?')) {
      this.cancelRide.emit();
    }
  }
}
