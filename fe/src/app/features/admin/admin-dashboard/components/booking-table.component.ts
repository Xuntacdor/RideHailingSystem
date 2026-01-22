import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

interface Booking {
    id: number;
    carNo: string;
    driver: {
        name: string;
        avatar: string;
    };
    location: string;
    earning: string;
    status: 'active' | 'inactive';
    rating: number;
}

@Component({
    selector: 'app-booking-table',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
    <div class="bg-white rounded-[20px] p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        <button class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          View All
          <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">No.</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Car No.</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Driver</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Earning</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody>
            @for (booking of bookings(); track booking.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4 text-sm text-gray-600">{{ booking.id }}</td>
                <td class="py-4 px-4 text-sm font-medium text-gray-900">{{ booking.carNo }}</td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {{ getInitials(booking.driver.name) }}
                    </div>
                    <span class="text-sm text-gray-900">{{ booking.driver.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-sm text-gray-600">{{ booking.location }}</td>
                <td class="py-4 px-4 text-sm font-semibold text-gray-900">{{ booking.earning }}</td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-2 h-2 rounded-full"
                      [class.bg-green-500]="booking.status === 'active'"
                      [class.bg-red-500]="booking.status === 'inactive'"
                    ></div>
                    <span class="text-sm text-gray-600 capitalize">{{ booking.status }}</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-1">
                    <lucide-icon name="star" [size]="14" class="text-yellow-400 fill-yellow-400"></lucide-icon>
                    <span class="text-sm font-medium text-gray-900">{{ booking.rating }}</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class BookingTableComponent {
    bookings = signal<Booking[]>([
        {
            id: 1,
            carNo: 'NYC-4521',
            driver: { name: 'John Smith', avatar: '' },
            location: 'Manhattan, NY',
            earning: '$125.00',
            status: 'active',
            rating: 4.8,
        },
        {
            id: 2,
            carNo: 'NYC-7832',
            driver: { name: 'Sarah Johnson', avatar: '' },
            location: 'Brooklyn, NY',
            earning: '$98.50',
            status: 'active',
            rating: 4.9,
        },
        {
            id: 3,
            carNo: 'NYC-2341',
            driver: { name: 'Michael Brown', avatar: '' },
            location: 'Queens, NY',
            earning: '$156.00',
            status: 'inactive',
            rating: 4.7,
        },
        {
            id: 4,
            carNo: 'NYC-9876',
            driver: { name: 'Emily Davis', avatar: '' },
            location: 'Bronx, NY',
            earning: '$87.25',
            status: 'active',
            rating: 5.0,
        },
        {
            id: 5,
            carNo: 'NYC-5543',
            driver: { name: 'David Wilson', avatar: '' },
            location: 'Staten Island, NY',
            earning: '$112.75',
            status: 'active',
            rating: 4.6,
        },
    ]);

    getInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }
}
