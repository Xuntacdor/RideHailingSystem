import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RideService } from '../../../core/services/ride.service';
import { AuthService } from '../../../core/services/auth.service';
import { RideResponse } from '../../../core/models/api-response.model';
import { TrackAsiaService } from '../../../core/services/trackasia.service';
import { forkJoin, of, from } from 'rxjs';

@Component({
  selector: 'app-travel-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './travel-history.component.html',
  styleUrls: ['./travel-history.component.css']
})
export class TravelHistoryComponent implements OnInit {
  private rideService = inject(RideService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);
  private trackAsiaService = inject(TrackAsiaService);

  // Extended RideResponse with geocoded addresses
  rides = signal<(RideResponse & { startAddress?: string; endAddress?: string })[]>([]);
  filteredRides = signal<(RideResponse & { startAddress?: string; endAddress?: string })[]>([]);
  isLoading = signal(true);
  selectedFilter = signal<'all' | 'completed' | 'cancelled'>('all');

  ngOnInit() {
    this.loadTravelHistory();
  }

  loadTravelHistory() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.rideService.getRidesByCustomer(user.id).subscribe({
      next: (rides) => {
        // Sort by start time, newest first
        const sortedRides = rides.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

        // Geocode all rides in parallel
        const geocodeRequests = sortedRides.map(ride => {
          // Create observables for start and end addresses
          // TrackAsiaService.reverseGeocode returns Promise, so we use 'from' to convert to Observable
          const startGeocode$ = ride.startLongitude && ride.startLatitude
            ? from(this.trackAsiaService.reverseGeocode(ride.startLongitude, ride.startLatitude))
            : of(this.formatCoordinates(ride.startLatitude, ride.startLongitude));

          const endGeocode$ = ride.endLongitude && ride.endLatitude
            ? from(this.trackAsiaService.reverseGeocode(ride.endLongitude, ride.endLatitude))
            : of(this.formatCoordinates(ride.endLatitude, ride.endLongitude));

          // Combine both geocoding requests
          return forkJoin({
            startAddress: startGeocode$,
            endAddress: endGeocode$,
            ride: of(ride)
          });
        });

        // Wait for all geocoding to complete
        if (geocodeRequests.length > 0) {
          forkJoin(geocodeRequests).subscribe({
            next: (results) => {
              const ridesWithAddresses = results.map(result => ({
                ...result.ride,
                startAddress: result.startAddress,
                endAddress: result.endAddress
              }));

              this.rides.set(ridesWithAddresses);
              this.applyFilter();
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error('Geocoding error:', err);
              // Fallback: use rides without addresses
              this.rides.set(sortedRides);
              this.applyFilter();
              this.isLoading.set(false);
            }
          });
        } else {
          this.rides.set(sortedRides);
          this.applyFilter();
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading travel history:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilter() {
    const filter = this.selectedFilter();
    const allRides = this.rides();

    if (filter === 'all') {
      this.filteredRides.set(allRides);
    } else if (filter === 'completed') {
      this.filteredRides.set(allRides.filter(r => r.status === 'FINISHED'));
    } else if (filter === 'cancelled') {
      this.filteredRides.set(allRides.filter(r => r.status === 'CANCELLED'));
    }
  }

  setFilter(filter: 'all' | 'completed' | 'cancelled') {
    this.selectedFilter.set(filter);
    this.applyFilter();
  }

  formatDate(timestamp?: number): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay, ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua, ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ', ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  formatCoordinates(lat?: number, lng?: number): string {
    if (!lat || !lng) return 'Không có tọa độ';
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  formatFare(fare: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fare);
  }

  getVehicleIcon(vehicleType: string): string {
    switch (vehicleType) {
      case 'MOTORBIKE': return '🏍️';
      case 'CAR': return '🚗';
      case 'CAR_7_SEATS': return '🚙';
      default: return '🚗';
    }
  }

  getVehicleName(vehicleType: string): string {
    switch (vehicleType) {
      case 'MOTORBIKE': return 'Xe máy';
      case 'CAR': return 'Xe 4 chỗ';
      case 'CAR_7_SEATS': return 'Xe 7 chỗ';
      default: return 'Xe';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'FINISHED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'ONGOING': return 'bg-blue-100 text-blue-700';
      case 'CONFIRMED': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'FINISHED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'ONGOING': return 'Đang đi';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PICKINGUP': return 'Đang đón';
      case 'PENDING': return 'Chờ xác nhận';
      default: return status;
    }
  }

  goBack() {
    this.location.back();
  }
}
