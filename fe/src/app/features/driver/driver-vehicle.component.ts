import { Component } from '@angular/core';
import { CommonModule,Location } from '@angular/common';

@Component({
  selector: 'app-driver-vehicle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-vehicle.component.html',
  styleUrls: ['./driver-vehicle.component.css']
})
export class DriverVehicleComponent {

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
