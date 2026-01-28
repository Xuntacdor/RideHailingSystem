import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, ReviewRequest } from '../../../core/services/review.service';

export interface RideCompletionData {
  rideId: string;
  driverId: string;
  customerId: string;
  rating?: number;
  comment?: string;
  // driverName: string;
  // driverAvatar?: string;
  // fare: number;
}

@Component({
  selector: 'app-rate-driver-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isVisible" 
         class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
         (click)="onOverlayClick($event)">
      <div class="bg-white rounded-3xl p-8 max-w-[500px] w-[90%] shadow-2xl animate-slideUp">
        
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Chuyến đi hoàn thành!</h2>
          <p class="text-gray-600">Cảm ơn bạn đã sử dụng dịch vụ</p>
        </div>

        <!-- Driver Info 
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <img [src]="rideData?.driverAvatar || 'assets/images/default-avatar.png'" 
                 [alt]="rideData?.driverName"
                 class="w-full h-full object-cover">
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-lg">{{ rideData?.driverName }}</h3>
            <p class="text-gray-600 text-sm">Tài xế của bạn</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(rideData?.fare || 0) }}</p>
            <p class="text-xs text-gray-500">Tổng cước phí</p>
          </div>
        </div> -->

        <!-- Rating Section -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-3 text-center">
            Đánh giá tài xế
          </label>
          <div class="flex justify-center gap-2 mb-4">
            <button *ngFor="let star of [1, 2, 3, 4, 5]"
                    (click)="setRating(star)"
                    class="transition-all duration-200 hover:scale-110 focus:outline-none">
              <svg class="w-12 h-12" 
                   [class.text-yellow-400]="star <= rating()" 
                   [class.text-gray-300]="star > rating()"
                   [class.fill-yellow-400]="star <= rating()"
                   [class.fill-gray-300]="star > rating()"
                   xmlns="http://www.w3.org/2000/svg" 
                   viewBox="0 0 24 24" 
                   stroke="currentColor"
                   stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" 
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
          </div>
          <p class="text-center text-sm text-gray-600" *ngIf="rating() > 0">
            {{ getRatingText() }}
          </p>
        </div>

        <!-- Comment Section -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Nhận xét (không bắt buộc)
          </label>
          <textarea
            [(ngModel)]="comment"
            placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
            [disabled]="isSubmitting()">
          </textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button 
            (click)="skipReview()"
            [disabled]="isSubmitting()"
            class="flex-1 py-3.5 px-6 border-2 border-gray-300 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Bỏ qua
          </button>
          <button 
            (click)="submitReview()"
            [disabled]="rating() === 0 || isSubmitting()"
            class="flex-1 py-3.5 px-6 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none">
            {{ isSubmitting() ? 'Đang gửi...' : 'Gửi đánh giá' }}
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

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.4s ease-out;
    }
  `]
})
export class RateDriverModalComponent {
  @Input() rideData: RideCompletionData | null = null;
  @Input() isVisible = false;

  @Output() close$ = new EventEmitter<void>();
  @Output() reviewSubmitted$ = new EventEmitter<void>();

  private reviewService = inject(ReviewService);

  rating = signal(0);
  comment = '';
  isSubmitting = signal(false);

  setRating(star: number): void {
    this.rating.set(star);
  }

  getRatingText(): string {
    const texts: Record<number, string> = {
      1: 'Rất không hài lòng',
      2: 'Không hài lòng',
      3: 'Bình thường',
      4: 'Hài lòng',
      5: 'Rất hài lòng'
    };
    return texts[this.rating()] || '';
  }

  submitReview(): void {
    if (!this.rideData || this.rating() === 0 || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const reviewRequest: ReviewRequest = {
      rideId: this.rideData.rideId,
      reviewerId: this.rideData.customerId,
      revieweeId: this.rideData.driverId,
      rating: this.rating(),
      comment: this.comment.trim() || undefined
    };

    this.reviewService.createReview(reviewRequest).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.reviewSubmitted$.emit();
        this.close();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
      }
    });
  }

  skipReview(): void {
    this.close();
  }

  close(): void {
    this.rating.set(0);
    this.comment = '';
    this.isSubmitting.set(false);
    this.close$.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bg-black/60')) {
      this.skipReview();
    }
  }
}
