import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.css']
})
export class DriverProfileComponent {

  driverAvatar = 'assets/images/avatar.png';
  driverName = 'Zakariya Yoder';
  driverPhone = '+91 12345 67890';

  totalEarning = '10,559.99';
  totalTrips = 504;
  totalLoginHours = 289;

  constructor(private router: Router) {}

  goToWallet() {
    this.router.navigate(['/driver-wallet']);
  }

  goToVehicle() {
    this.router.navigate(['/driver-vehicle']);
  }


  logout() {
    this.router.navigate(['/driver']);
  }
}
