import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-finding-driver-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <!-- Main Card -->
      <div class="relative w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-3xl animate-slide-up">
        
        <!-- Background Gradient/Pattern -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_70%)]"></div>

        <div class="relative flex flex-col items-center p-8 text-center">
          
          <!-- Radar/Ripple Animation -->
          <div class="relative flex items-center justify-center w-32 h-32 mb-6">
            <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-pulse delay-75"></div>
            <div class="relative flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <!-- Orbiting Dot -->
            <div class="absolute inset-0 animate-spin-slow">
              <div class="absolute -top-1 left-1/2 w-3 h-3 -ml-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            </div>
          </div>

          <!-- Text Content -->
          <h3 class="mb-2 text-2xl font-bold text-gray-800">Đang tìm tài xế ở gần đây</h3>
          <p class="mb-8 text-gray-500">
            Chúng tôi đang liên hệ với các tài xế gần bạn...<br>
            <span class="text-sm">Quá trình này thường mất chưa đến một phút.</span>
          </p>

          <!-- Cancel Button -->
          <button 
            (click)="onCancel()"
            class="w-full py-4 font-semibold text-gray-700 transition-colors bg-gray-100 rounded-2xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
            Cancel Request
          </button>
        </div>

        <!-- Bottom Progress Bar (Indeterminate) -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div class="h-full bg-blue-500 animate-progress opacity-80"></div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes progress {
      0% { width: 0%; margin-left: 0; }
      50% { width: 70%; margin-left: 30%; }
      100% { width: 0%; margin-left: 100%; }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    .animate-slide-up {
      animation: slide-up 0.4s ease-out forwards;
    }
    .animate-progress {
      animation: progress 2s infinite ease-in-out;
    }
    .animate-spin-slow {
      animation: spin 3s linear infinite;
    }
  `]
})
export class FindingDriverModalComponent {
    @Output() cancelSearch = new EventEmitter<void>();

    onCancel() {
        this.cancelSearch.emit();
    }
}
