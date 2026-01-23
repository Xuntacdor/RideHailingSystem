import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

export interface DriverRideRequest {
  rideRequestId: string;
  customerId: string;
  customerName: string;
  startLocation: string;
  endLocation: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  distance: number;
  fare: number;
  vehicleType: string;
  timestamp: number;
}

@Component({
  selector: 'app-driver-notification-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" 
         class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn">
      <div class="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] p-8 max-w-[480px] w-[90%] shadow-[0_25px_80px_rgba(0,0,0,0.4)] animate-slideUp overflow-hidden">

        <div class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse-glow pointer-events-none"></div>

        <div class="text-center mb-6 relative z-10">
          <div class="relative w-[100px] h-[100px] rounded-full mx-auto mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)] animate-rotate-timer"
               [style.background]="'conic-gradient(white 0deg, white ' + (getProgress() * 3.6) + 'deg, rgba(255,255,255,0.2) ' + (getProgress() * 3.6) + 'deg, rgba(255,255,255,0.2) 360deg)'">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span class="text-[32px] font-bold text-indigo-500">{{ countdown }}</span>
              </div>
            </div>
          </div>
          <p class="text-white text-[13px] opacity-90">seconds to respond</p>
        </div>

        <!-- Title -->
        <h2 class="text-[28px] font-bold text-white text-center mb-2 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          New Ride Request
        </h2>

        <!-- Customer Name -->
        <p *ngIf="rideRequest?.customerName" 
           class="text-center text-white/90 text-base mb-6 relative z-10">
          {{ rideRequest?.customerName }}
        </p>

        <!-- Ride Details Card -->
        <div class="bg-white rounded-[20px] p-6 mb-6 relative z-10">

          <!-- Pickup Row -->
          <div class="flex gap-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-600 font-semibold uppercase mb-1">Pickup</label>
              <p class="text-[15px] text-gray-800 font-medium leading-snug">{{ rideRequest?.startLocation }}</p>
            </div>
          </div>

          <!-- Separator -->
          <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

          <!-- Destination Row -->
          <div class="flex gap-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-600 font-semibold uppercase mb-1">Destination</label>
              <p class="text-[15px] text-gray-800 font-medium leading-snug">{{ rideRequest?.endLocation }}</p>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-200">
            <div class="text-center">
              <span class="block text-[11px] text-gray-400 font-semibold uppercase mb-1">Distance</span>
              <span class="block text-base text-gray-800 font-bold">{{ formatDistance(rideRequest?.distance) }}</span>
            </div>
            <div class="text-center">
              <span class="block text-[11px] text-gray-400 font-semibold uppercase mb-1">Fare</span>
              <span class="block text-base text-green-500 font-bold">{{ formatFare(rideRequest?.fare) }}</span>
            </div>
            <div class="text-center">
              <span class="block text-[11px] text-gray-400 font-semibold uppercase mb-1">Vehicle</span>
              <span class="block text-base text-gray-800 font-bold">{{ rideRequest?.vehicleType }}</span>
            </div>
          </div>

        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3 relative z-10">
          <button class="flex items-center justify-center gap-2 p-4 border-none rounded-2xl text-base font-bold cursor-pointer transition-all duration-300 bg-white text-green-500 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                  (click)="accept()" 
                  [disabled]="countdown <= 0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Accept
          </button>
          <button class="flex items-center justify-center gap-2 p-4 border-2 border-white rounded-2xl text-base font-bold cursor-pointer transition-all duration-300 bg-red-500/20 text-white hover:bg-red-500/40 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(239,68,68,0.3)]"
                  (click)="reject()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
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
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes pulse-glow {
      0%, 100% { 
        transform: scale(1); 
        opacity: 0.5; 
      }
      50% { 
        transform: scale(1.1); 
        opacity: 0.8; 
      }
    }

    @keyframes rotate-timer {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .animate-pulse-glow {
      animation: pulse-glow 3s ease-in-out infinite;
    }

    .animate-rotate-timer {
      animation: rotate-timer 1s linear infinite;
    }

    @media (max-width: 640px) {
      .max-w-\[480px\] {
        max-width: 95%;
      }

      .grid-cols-3 {
        grid-template-columns: 1fr !important;
        gap: 0.75rem !important;
      }

      .grid-cols-2 {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class DriverNotificationModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() rideRequest: DriverRideRequest | null = null;
  @Input() isVisible = false;
  @Input() timeoutSeconds = 30;

  @Output() accept$ = new EventEmitter<DriverRideRequest>();
  @Output() reject$ = new EventEmitter<DriverRideRequest>();
  @Output() timeout$ = new EventEmitter<DriverRideRequest>();

  countdown = 30;
  private timerSubscription?: Subscription;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isVisible'] && this.isVisible) ||
      (changes['rideRequest'] && this.rideRequest && this.isVisible)) {
      this.stopTimer();
      this.startTimer();
    } else if (changes['isVisible'] && !this.isVisible) {
      this.stopTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.countdown = this.timeoutSeconds;
    this.timerSubscription = interval(1000)
      .pipe(take(this.timeoutSeconds))
      .subscribe(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.onTimeout();
        }
      });
  }

  private stopTimer(): void {
    this.timerSubscription?.unsubscribe();
  }

  accept(): void {
    if (this.rideRequest) {
      this.accept$.emit(this.rideRequest);
    }
  }

  reject(): void {
    if (this.rideRequest) {
      this.reject$.emit(this.rideRequest);
    }
  }

  private onTimeout(): void {
    if (this.rideRequest) {
      this.timeout$.emit(this.rideRequest);
    }
  }

  getProgress(): number {
    return (this.countdown / this.timeoutSeconds) * 100;
  }

  formatDistance(distance?: number): string {
    if (!distance) return 'N/A';
    const km = distance / 1000;
    return `${km.toFixed(1)} km`;
  }

  formatFare(fare?: number): string {
    if (!fare) return 'N/A';
    return `${fare.toLocaleString()} đ`;
  }
}
