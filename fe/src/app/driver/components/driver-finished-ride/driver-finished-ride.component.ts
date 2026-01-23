import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CompletedRideInfo {
  rideId: string;
  customerName?: string;
  // pickupLocation: string;
  // destinationLocation: string;
  distance: number;
  fare: number;
  startTime?: number;
  endTime?: number;
}

@Component({
  selector: 'app-driver-finished-ride',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center z-50 animate-fadeIn">
      <div class="bg-white rounded-3xl p-8 max-w-md w-[90%] shadow-2xl animate-slideUp">
        
        <!-- Success Icon -->
        <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-12 h-12 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 class="text-3xl font-bold text-center mb-2 text-gray-800">Chuyến đi hoàn thành!</h2>
        <p class="text-center text-gray-600 mb-6">Cảm ơn bạn đã hoàn thành chuyến đi</p>

        <div class="bg-gray-50 rounded-2xl p-6 mb-6">
          
          <div class="text-center mb-6 pb-6 border-b border-gray-200">
            <p class="text-sm text-gray-600 mb-2">Thu nhập</p>
            <p class="text-4xl font-bold text-green-600">{{ formatFare(rideInfo?.fare) }}</p>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Khoảng cách</span>
              <span class="font-semibold text-gray-900">{{ formatDistance(rideInfo?.distance) }}</span>
            </div>

            <div class="flex justify-between items-center" *ngIf="getDuration()">
              <span class="text-gray-600">Thời gian</span>
              <span class="font-semibold text-gray-900">{{ getDuration() }}</span>
            </div>

            <div class="flex justify-between items-center" *ngIf="rideInfo?.customerName">
              <span class="text-gray-600">Khách hàng</span>
              <span class="font-semibold text-gray-900">{{ rideInfo?.customerName }}</span>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div class="flex gap-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-green-600 text-lg">📍</span>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 mb-1">Điểm đón</p>
                <p class="text-sm text-gray-800 font-medium"></p>
              </div>
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <p class="text-xs text-gray-500 mb-1">Điểm trả</p>
                <p class="text-sm text-gray-800 font-medium"></p>
              </div>
            </div>
          </div>

        </div>

        <button 
          (click)="onClose()"
          class="w-full py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
          Tiếp tục nhận cuốc
        </button>

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
      from { 
        transform: scale(0) rotate(0deg); 
        opacity: 0;
      }
      to { 
        transform: scale(1) rotate(360deg); 
        opacity: 1;
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .animate-scaleIn {
      animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  `]
})
export class DriverFinishedRideComponent {
  @Input() rideInfo: CompletedRideInfo | null = null;
  @Output() close = new EventEmitter<void>();

  formatFare(fare?: number): string {
    if (!fare) return '0 ₫';
    return fare.toLocaleString('vi-VN') + ' ₫';
  }

  formatDistance(distance?: number): string {
    if (!distance) return 'N/A';
    const km = distance / 1000;
    return `${km.toFixed(1)} km`;
  }

  getDuration(): string | null {
    if (!this.rideInfo?.startTime || !this.rideInfo?.endTime) return null;

    const durationMs = this.rideInfo.endTime - this.rideInfo.startTime;
    const minutes = Math.floor(durationMs / (1000 * 60));

    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
