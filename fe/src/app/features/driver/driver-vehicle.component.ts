import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { AuthService } from '../../core/services/auth.service';
import { Vehicle } from '../../models/vehicle.model';



@Component({
  selector: 'app-driver-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-vehicle.component.html',
  styleUrls: ['./driver-vehicle.component.css']
})
export class DriverVehicleComponent {
  driverId: string | null = null;

  constructor(
    private location: Location,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {}

  showAddForm = false;
  showVehicleType = false;

  vehicles: Vehicle[] = [];

  newVehicle: Partial<Vehicle> = {
    vehicleType: undefined, 
    licensePlate: '',
    vehicleBrand: '',
    vehicleColor: '',
  };

  goBack() {
    this.location.back();
  }

  resetForm() {
    this.newVehicle = {
      vehicleType: undefined, 
      licensePlate: '',
      vehicleBrand: '',
      vehicleColor: '',
    };
    this.showAddForm = false;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;

    if (!this.showAddForm) {
      this.showVehicleType = false;
    }
  }
  

  ngOnInit() {
    this.driverId = this.authService.getUserId();
    console.log('Driver ID:', this.driverId);

    if (!this.driverId) {
      console.error('Driver chưa đăng nhập');
      return;
    }

    this.vehicleService.getVehiclesByDriverIdHardcode(this.driverId!)
      .subscribe({
        next: (res) => {
          console.log('Vehicle response:', res);
          this.vehicles = res.results;
        },
        error: (err) => {
          console.error('Load vehicle error:', err);
        }
      });
  }


  toggleVehicleType() {
    this.showVehicleType = !this.showVehicleType;
  }

  selectVehicleType(type: 'CAR' | 'MOTORBIKE') {
    this.newVehicle.vehicleType = type;
    this.showVehicleType = false;
  }

  getVehicleTypeLabel(type: string) {
    return type === 'MOTORBIKE' ? 'Xe máy' : 'Ô tô';
  }

  addVehicle() {
    if (!this.newVehicle.vehicleType || !this.newVehicle.licensePlate) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const payload = {
      vehicleType: this.newVehicle.vehicleType as 'CAR' | 'MOTORBIKE',
      licensePlate: this.newVehicle.licensePlate,
      vehicleBrand: this.newVehicle.vehicleBrand,
      vehicleColor: this.newVehicle.vehicleColor,
      imageUrl: null

    };

    this.vehicleService.registerVehicle(payload).subscribe({

      next: (res: any) => {
        this.vehicles.push(res.results);
        this.resetForm();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Đăng ký xe thất bại');
      }
    });
  }

}
