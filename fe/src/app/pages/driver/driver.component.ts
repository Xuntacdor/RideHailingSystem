import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MapComponent } from '../../components/userBooking/map/map.component';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, MapComponent], // ⭐ thêm MapComponent
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent {

  isOnline = false;
  driverAvatar = 'assets/avatar.png';
  // 👇 data cho map
  origin = null;
  destination = null;
  drivers = [];

  constructor(private router: Router) {}

  toggleOnline() {
    this.isOnline = !this.isOnline;
  }

  goToProfile() {
    this.router.navigate(['/driver-profile']);
  }

  onMapReady() {
    console.log('Map ready');
  }

  onUserLocationDetected(location: { lng: number; lat: number }) {
    console.log('Driver location:', location);
  }
}
