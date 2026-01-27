import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RideNotification {
  type: 'RIDE_ACCEPTED' | 'RIDE_STATUS_UPDATE' | 'NO_DRIVER_AVAILABLE' | 'RIDE_CANCELLED';
  rideId?: string;
  driverId?: string;
  status?: string;
  message?: string;
  rideRequestId?: string;
  timestamp?: number;
  cancelledBy?: string;
  driverData?: {
    name: string;
    avatarUrl: string;
    rating: number;
    vehicleModel: string;
    vehiclePlate: string;
    phoneNumber: string;
  };
}

@Component({
  selector: 'app-customer-notification-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" 
         class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
         (click)="onOverlayClick($event)">
      <div class="bg-white rounded-3xl p-8 max-w-[450px] w-[90%] shadow-2xl animate-slideUp">

        <!-- RIDE ACCEPTED - Driver Assigned -->
        <div *ngIf="notification?.type === 'RIDE_ACCEPTED'" class="text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 animate-scaleIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold mb-4 text-gray-800">Tài xế đã được phân công!</h2>

          <div *ngIf="notification?.driverData" class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-5 my-6 text-left">
            <div class="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-lg">
              <img [src]="notification?.driverData?.avatarUrl || 'assets/default-avatar.png'" 
                   [alt]="notification?.driverData?.name || 'Driver'"
                   class="w-full h-full object-cover">
            </div>

            <div class="text-center">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ notification?.driverData?.name }}</h3>
              <div class="flex items-center justify-center gap-1 mb-2">
                <span class="text-lg">⭐</span>
                <span class="text-base font-semibold text-gray-800">{{ notification?.driverData?.rating || 'N/A' }}</span>
              </div>
              <p class="text-sm text-gray-600 mb-1">{{ notification?.driverData?.vehicleModel }} • {{ notification?.driverData?.vehiclePlate }}</p>
              <p *ngIf="notification?.driverData?.phoneNumber" class="text-sm text-blue-500 font-medium">📞 {{ notification?.driverData?.phoneNumber }}</p>
            </div>
          </div>

          <p class="text-base text-green-500 font-semibold mb-6">Tài xế đang đến!</p>

          <button class="w-full py-3.5 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.4)]"
                  (click)="close()">Đã hiểu!</button>
        </div>

        <!-- RIDE STATUS UPDATE -->
        <div *ngIf="notification?.type === 'RIDE_STATUS_UPDATE'" class="text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn"
               [ngClass]="{
                 'bg-gradient-to-br from-indigo-500 to-purple-600': getStatusIconClass(notification?.status) === 'success',
                 'bg-gradient-to-br from-blue-500 to-blue-600': getStatusIconClass(notification?.status) === 'info',
                 'bg-gradient-to-br from-amber-500 to-amber-600': getStatusIconClass(notification?.status) === 'warning',
                 'bg-gradient-to-br from-red-500 to-red-600': getStatusIconClass(notification?.status) === 'error'
               }">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getStatusIconPath(notification?.status)" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold mb-4 text-gray-800">{{ getStatusTitle(notification?.status) }}</h2>
          <p class="text-base text-gray-600 mb-6 leading-relaxed">{{ getStatusMessage(notification?.status) }}</p>

          <button class="w-full py-3.5 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.4)]"
                  (click)="close()">Đồng ý</button>
        </div>

        <!-- NO DRIVER AVAILABLE -->
        <div *ngIf="notification?.type === 'NO_DRIVER_AVAILABLE'" class="text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 animate-scaleIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold mb-4 text-gray-800">Không tìm thấy tài xế</h2>
          <p class="text-base text-gray-600 mb-6 leading-relaxed">Rất tiếc, chúng tôi không tìm thấy tài xế nào gần đây.</p>

          <div class="flex gap-3">
            <button class="flex-1 py-3.5 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 mt-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(59,130,246,0.4)]"
                    (click)="onRetry()">Thử lại</button>
            <button class="flex-1 py-3.5 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 mt-2 bg-gradient-to-br from-red-500 to-red-600 text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)]"
                    (click)="close()">Hủy</button>
          </div>
        </div>


        <!-- RIDE CANCELLED -->
        <div *ngIf="notification?.type === 'RIDE_CANCELLED'" class="text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 animate-scaleIn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold mb-4 text-gray-800">Chuyến đi đã bị hủy</h2>
          <p class="text-base text-gray-600 mb-6 leading-relaxed">{{ notification?.message || 'Chuyến đi này đã bị hủy.' }}</p>

          <button class="w-full py-3.5 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-gray-500 to-gray-600 text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(107,114,128,0.4)]"
                  (click)="close()">Đồng ý</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.4s ease-out;
    }

    .animate-scaleIn {
      animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @media (max-width: 640px) {
      .max-w-\[450px\] {
        max-width: 95%;
      }
    }
  `]
})
export class CustomerNotificationModalComponent {
  @Input() notification: RideNotification | null = null;
  @Input() isVisible = false;

  @Output() close$ = new EventEmitter<void>();
  @Output() retry$ = new EventEmitter<void>();
  @Output() cancel$ = new EventEmitter<void>();

  close(): void {
    this.close$.emit();
  }

  onRetry(): void {
    this.retry$.emit();
  }

  onCancel(): void {
    this.cancel$.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  getStatusTitle(status?: string): string {
    const titles: Record<string, string> = {
      'CONFIRMED': 'Đã xác nhận chuyến đi!',
      'PICKINGUP': 'Tài xế đang đến',
      'ONGOING': 'Đang trong chuyến đi',
      'FINISHED': 'Chuyến đi hoàn thành',
      'REJECTED': 'Chuyến đi bị hủy'
    };
    return titles[status || ''] || 'Cập nhật trạng thái';
  }

  getStatusMessage(status?: string): string {
    const messages: Record<string, string> = {
      'CONFIRMED': 'Chuyến đi của bạn đã được xác nhận. Tài xế sẽ đến ngay.',
      'PICKINGUP': 'Tài xế đang di chuyển đến điểm đón của bạn.',
      'ONGOING': 'Chuyến đi đã bắt đầu. Chúc bạn có một chuyến đi vui vẻ!',
      'FINISHED': 'Bạn đã đến nơi. Cảm ơn bạn đã sử dụng dịch vụ!',
      'REJECTED': 'Chuyến đi của bạn đã bị hủy.'
    };
    return messages[status || ''] || 'Trạng thái chuyến đi của bạn đã được cập nhật.';
  }

  getStatusIconClass(status?: string): string {
    const classes: Record<string, string> = {
      'CONFIRMED': 'success',
      'PICKINGUP': 'info',
      'ONGOING': 'info',
      'FINISHED': 'success',
      'REJECTED': 'error'
    };
    return classes[status || ''] || 'info';
  }

  getStatusIconPath(status?: string): string {
    const paths: Record<string, string> = {
      'CONFIRMED': 'M5 13l4 4L19 7',
      'PICKINGUP': 'M13 10V3L4 14h7v7l9-11h-7z',
      'ONGOING': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'FINISHED': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'REJECTED': 'M6 18L18 6M6 6l12 12'
    };
    return paths[status || ''] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
}