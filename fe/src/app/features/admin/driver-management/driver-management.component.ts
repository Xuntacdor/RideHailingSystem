import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { MapComponent } from '../../../components/userBooking/map/map.component';
import { DriverService } from '../../../core/services/driver.service';
import { Driver, VehicleType } from '../../../models/models';
import { RideService } from '../../../core/services/ride.service';
import { RideResponse } from '../../../core/models/api-response.model';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string; // Made optional to match usage
  phoneNumber: string;
  avatar?: string;
}

@Component({
  selector: 'app-driver-management',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, MapComponent],
  template: `
<div class="bg-white rounded-[20px] p-6 shadow-sm">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <h3 class="text-xl font-bold text-gray-900">Quản lý Tài xế</h3>
    </div>
  </div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
    <div class="lg:col-span-2 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
      <div class="w-full h-full rounded-lg flex items-center justify-center text-white font-semibold text-lg">
        <app-map 
          [drivers]="availableDrivers"
          (mapMove)="onMapMove($event)"
          (driverClick)="onDriverClick($event)">
        </app-map>
      </div>
    </div>

    <div class="space-y-4">
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">Thông tin Tài xế</h4>
        </div>
        
        <div *ngIf="selectedDriver; else noDriverSelected" class="space-y-4">
          <div class="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl mr-4 flex-shrink-0">
              {{ getDriverInitials(selectedDriver.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 text-lg truncate">{{ selectedDriver.name }}</p>
              <p class="text-sm text-gray-500 truncate">{{ selectedDriver.user?.phoneNumber }}</p>
              <div class="flex items-center text-xs text-gray-500 mt-1">
                ★★★★☆ {{ selectedDriver.rating }}
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Trạng thái</span>
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                [ngClass]="{
                  'bg-green-100 text-green-700': selectedDriver.driverStatus === 'ACTIVE',
                  'bg-yellow-100 text-yellow-700': selectedDriver.driverStatus === 'BUSY',
                  'bg-gray-100 text-gray-700': selectedDriver.driverStatus === 'OFFLINE'
                }">
                {{ selectedDriver.driverStatus }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Loại xe</span>
              <span class="text-sm font-medium text-gray-900">
                {{ selectedDriver.vehicleType === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy' }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Biển số xe</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedDriver.licenseNumber }}</span>
            </div>

            <div class="border-t pt-3">
              <span class="text-sm text-gray-600">Địa chỉ</span>
              <p class="text-sm text-gray-900 mt-1">{{ selectedDriver.address }}</p>
            </div>

            <div class="border-t pt-3">
              <span class="text-sm text-gray-600">Email</span>
              <p class="text-sm text-gray-900 mt-1">{{ selectedDriver.user?.email }}</p>
            </div>

            <div class="border-t pt-3">
              <span class="text-sm text-gray-600">Vị trí</span>
              <p class="text-xs text-gray-500 mt-1">
                Lat: {{ selectedDriver.lat?.toFixed(6) }}, Lng: {{ selectedDriver.lng?.toFixed(6) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Giao Chuyến
            </button>
            <button (click)="viewHistory()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Xem Lịch sử
            </button>
          </div>
        </div>

        <ng-template #noDriverSelected>
          <div class="text-center py-8 text-gray-500">
            <p class="text-sm">Nhấn vào biểu tượng tài xế để xem chi tiết</p>
          </div>
        </ng-template>
      </div>
    </div>
  </div>
</div>


<div *ngIf="showHistoryModal" class="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
    <div class="p-6 border-b flex justify-between items-center bg-white rounded-t-xl sticky top-0 z-10">
      <h3 class="text-xl font-bold text-gray-900">Lịch sử Chuyến Đi - {{selectedDriver?.name}}</h3>
      <button (click)="closeHistory()" class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
      <div *ngIf="isLoadingHistory" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
      
      <div *ngIf="!isLoadingHistory && rideHistory.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500">
          <thead class="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0">
            <tr>
              <th class="px-6 py-4 rounded-tl-lg font-semibold">Ngày</th>
              <th class="px-6 py-4 font-semibold">Điểm đón</th>
              <th class="px-6 py-4 font-semibold">Điểm đến</th>
              <th class="px-6 py-4 font-semibold">Cước phí</th>
              <th class="px-6 py-4 rounded-tr-lg font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let ride of rideHistory" class="bg-white hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ formatDate(ride.startTime) }}</td>
              <td class="px-6 py-4 max-w-[200px] truncate" title="{{ride.startLocation}}">{{ ride.startLocation }}</td>
              <td class="px-6 py-4 max-w-[200px] truncate" title="{{ride.endLocation}}">{{ ride.endLocation }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ ride.fare | currency:'VND' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 text-xs font-semibold rounded-full border" 
                  [ngClass]="{
                    'bg-green-100 text-green-700 border-green-200': ride.status === 'COMPLETED',
                    'bg-red-100 text-red-700 border-red-200': ride.status === 'CANCELLED',
                    'bg-blue-100 text-blue-700 border-blue-200': ride.status === 'ON_RIDE',
                    'bg-yellow-100 text-yellow-700 border-yellow-200': ride.status === 'PENDING'
                  }">
                  {{ ride.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!isLoadingHistory && rideHistory.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <div class="text-gray-400 mb-2">
           <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <p class="text-gray-500 font-medium">Không tìm thấy lịch sử chuyến đi cho tài xế này.</p>
      </div>
    </div>
  </div>
</div>
  `
})
export class DriverManagementComponent implements OnInit {

  private driverService = inject(DriverService);
  private rideService = inject(RideService);
  private cdr = inject(ChangeDetectorRef);

  availableDrivers: Driver[] = [];
  selectedDriver: Driver | null = null;

  showHistoryModal = false;
  rideHistory: RideResponse[] = [];
  isLoadingHistory = false;

  ngOnInit() { }

  onMapMove(event: any) {
    this.driverService.getDriversByLocation(event.center.lat, event.center.lng, event.zoom)
      .subscribe({
        next: (res) => {
          if (res.results) {
            this.availableDrivers = res.results.map(d => ({
              id: d.id,
              name: d.user.name,
              vehicleType: d.vehicleType === 'CAR' ? VehicleType.CAR : VehicleType.MOTORBIKE,
              lng: d.longitude || 0,
              lat: d.latitude || 0,
              rating: d.rating,
              icon: d.vehicleType === 'CAR' ? '🚗' : '🏍️',
              user: d.user,
              driverStatus: d.driverStatus,
              licenseNumber: d.licenseNumber,
              address: d.address,
              avatarUrl: d.avatarUrl
            }));
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Failed to fetch drivers:', err);
        }
      });
  }

  onDriverClick(driver: Driver) {
    this.selectedDriver = driver;
  }

  getDriverInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'BUSY':
        return 'yellow';
      case 'OFFLINE':
        return 'gray';
      default:
        return 'gray';
    }
  }

  viewHistory() {
    if (!this.selectedDriver) return;

    this.showHistoryModal = true;
    this.isLoadingHistory = true;
    this.rideHistory = [];

    // Assuming fetch by Driver ID
    this.rideService.getRidesByDriver(this.selectedDriver.id).subscribe({
      next: (rides) => {
        this.rideHistory = rides;
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch ride history:', err);
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeHistory() {
    this.showHistoryModal = false;
    this.rideHistory = [];
  }

  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  }
}
