import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule],   // ⭐ QUAN TRỌNG
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent {

  isOnline = false;

  driverAvatar = 'assets/avatar.jpg'; // ảnh có thể thay đổi

  constructor(private router: Router) {}

  toggleOnline() {
    this.isOnline = !this.isOnline;
  }

  goToProfile() {
    this.router.navigate(['/driver-profile']);
  }
}
