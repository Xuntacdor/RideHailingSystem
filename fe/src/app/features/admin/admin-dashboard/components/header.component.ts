import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [LucideAngularModule, DatePipe],
    template: `
    <header class="bg-white border-b border-gray-100 px-8 py-4">
      <div class="flex items-center justify-between">
        <!-- Date Display -->
        <div class="text-gray-900 font-medium">
          {{ currentDate() | date: 'dd EEE MMMM' }}
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-2xl mx-8">
          <div class="relative">
            <lucide-icon 
              name="search" 
              [size]="20" 
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            ></lucide-icon>
            <input
              type="text"
              placeholder="Search for something..."
              class="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-4">
          <!-- Notification Bell -->
          <button class="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <lucide-icon name="bell" [size]="22" class="text-gray-600"></lucide-icon>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- Settings -->
          <button class="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <lucide-icon name="settings" [size]="22" class="text-gray-600"></lucide-icon>
          </button>

          <!-- User Profile -->
          <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900">{{ userName() }}</p>
              <p class="text-xs text-gray-500">Administrator</p>
            </div>
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
              {{ userInitials() }}
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
    currentDate = signal(new Date());
    userName = signal('Danielle Campbell');
    userInitials = signal('DC');
}
