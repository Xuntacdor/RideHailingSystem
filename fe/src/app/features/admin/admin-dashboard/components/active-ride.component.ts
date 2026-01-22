import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

interface CarDetails {
    name: string;
    image: string;
    mileage: string;
    seats: number;
    type: string;
}

interface RoutePoint {
    label: string;
    location: string;
    time: string;
    isStart?: boolean;
    isEnd?: boolean;
}

@Component({
    selector: 'app-active-ride',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Car Details Card -->
      <div class="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Car Details</h3>
        
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-4">
          <div class="text-center mb-4">
            <div class="text-6xl mb-2">🚗</div>
            <h4 class="font-semibold text-gray-900">{{ carDetails().name }}</h4>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mt-4">
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <lucide-icon name="gauge" [size]="16"></lucide-icon>
              </div>
              <p class="text-xs text-gray-500">Mileage</p>
              <p class="text-sm font-semibold text-gray-900">{{ carDetails().mileage }}</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <lucide-icon name="users" [size]="16"></lucide-icon>
              </div>
              <p class="text-xs text-gray-500">Seat</p>
              <p class="text-sm font-semibold text-gray-900">{{ carDetails().seats }}</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <lucide-icon name="car" [size]="16"></lucide-icon>
              </div>
              <p class="text-xs text-gray-500">Type</p>
              <p class="text-sm font-semibold text-gray-900">{{ carDetails().type }}</p>
            </div>
          </div>
        </div>

        <!-- Map Placeholder -->
        <div class="bg-gray-100 rounded-xl h-32 flex items-center justify-center">
          <div class="text-center text-gray-400">
            <lucide-icon name="map" [size]="32" class="mx-auto mb-2"></lucide-icon>
            <p class="text-sm">Map View</p>
          </div>
        </div>
      </div>

      <!-- Route Timeline Card -->
      <div class="bg-white rounded-[20px] p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Route Timeline</h3>
        
        <div class="space-y-4">
          @for (point of routePoints(); track point.location; let isLast = $last) {
            <div class="flex gap-4">
              <!-- Timeline Indicator -->
              <div class="flex flex-col items-center">
                @if (point.isStart) {
                  <div class="w-4 h-4 rounded-full bg-green-500 border-4 border-green-100"></div>
                } @else if (point.isEnd) {
                  <div class="w-4 h-4 rounded-full bg-red-500 border-4 border-red-100"></div>
                } @else {
                  <div class="w-3 h-3 rounded-full bg-gray-300"></div>
                }
                @if (!isLast) {
                  <div class="w-0.5 h-12 bg-gray-200 my-1"></div>
                }
              </div>

              <!-- Location Info -->
              <div class="flex-1 pb-4">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-semibold text-gray-900 uppercase">{{ point.label }}</span>
                  <span class="text-xs text-gray-400">{{ point.time }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ point.location }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Service Location -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">Service Location</h4>
          <div class="space-y-2">
            @for (passenger of passengers(); track passenger.id) {
              <label class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div class="flex items-center gap-3">
                  <input type="radio" name="passenger" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm text-gray-700">{{ passenger.name }}</span>
                </div>
                <span class="text-xs text-gray-400">{{ passenger.distance }}</span>
              </label>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ActiveRideComponent {
    carDetails = signal<CarDetails>({
        name: 'White Volvo V54',
        image: '',
        mileage: '20k',
        seats: 4,
        type: 'Sedan',
    });

    routePoints = signal<RoutePoint[]>([
        { label: 'Start', location: 'JFK International Airport', time: '10:30 AM', isStart: true },
        { label: 'Stop 1', location: 'Times Square, Manhattan', time: '11:00 AM' },
        { label: 'Stop 2', location: 'Central Park West', time: '11:20 AM' },
        { label: 'End', location: 'Statue of Liberty', time: '12:00 PM', isEnd: true },
    ]);

    passengers = signal([
        { id: 1, name: 'Passenger 1', distance: '2.3km' },
        { id: 2, name: 'Passenger 2', distance: '4.1km' },
        { id: 3, name: 'Passenger 3', distance: '1.8km' },
    ]);
}
