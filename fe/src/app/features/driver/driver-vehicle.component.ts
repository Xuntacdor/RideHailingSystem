import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { AuthService } from '../../core/services/auth.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { VehicleStatus } from '../../core/models/api-response.model';



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
    vehicleNumber: '',
    vehicleBrand: '',
    vehicleColor: '',
    licenseNumber: ''        
  };


  goBack() {
    this.location.back();
  }

 resetForm() {
    this.newVehicle = {
      vehicleType: undefined,
      vehicleNumber: '',
      vehicleBrand: '',
      vehicleColor: '',
      licenseNumber: ''   
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
    if (!this.driverId) {
      alert('Chưa xác định được tài xế');
      return;
    }

    const {
      vehicleType,
      vehicleNumber,
      vehicleBrand,
      vehicleColor,
      licenseNumber
    } = this.newVehicle;

    if (!vehicleType || !vehicleNumber || !vehicleBrand || !licenseNumber) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const payload = {
      driverId: this.driverId,
      vehicleType,
      vehicleNumber,
      vehicleBrand,
      vehicleColor,
      licenseNumber,
      status: VehicleStatus.PENDING,
      imageUrl: null
    };

    this.vehicleService.registerVehicle(payload).subscribe({
      next: (res) => {
        this.vehicles.push(res.results);
        this.resetForm();
      },
      error: (err) => {
        alert(err.error?.message || 'Đăng ký xe thất bại');
      }
    });
  }


}
