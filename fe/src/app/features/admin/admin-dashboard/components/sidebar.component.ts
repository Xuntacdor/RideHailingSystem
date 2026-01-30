import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface MenuItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, LucideAngularModule],
    template: `
    <aside class="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <lucide-icon name="car-taxi-front" [size]="24" class="text-gray-900"></lucide-icon>
          </div>
          <span class="text-xl font-bold text-gray-900">RapidRides</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-1">
        @for (item of menuItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-gray-100 text-gray-900 font-semibold"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <lucide-icon [name]="item.icon" [size]="20"></lucide-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Logout Button -->
      <div class="p-4 border-t border-gray-100">
        <button class="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full">
          <lucide-icon name="log-out" [size]="20"></lucide-icon>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
    menuItems = signal<MenuItem[]>([
        { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin' },
        { label: 'Booking', icon: 'calendar-check', route: '/admin/booking' },
        { label: 'Schedule', icon: 'calendar-clock', route: '/admin/schedule' },
        { label: 'Driver Management', icon: 'car', route: '/admin/driver' },
        { label: 'User Management', icon: 'users', route: '/admin/users' },
        { label: 'Reports', icon: 'file-text', route: '/admin/reports' },
        { label: 'Settings', icon: 'settings', route: '/admin/settings' },
    ]);
}
