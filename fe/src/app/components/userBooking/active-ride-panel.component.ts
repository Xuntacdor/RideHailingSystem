import { CommonModule } from "@angular/common";
import { BookedRideInfoComponent } from "./booked-ride-info/booked-ride-info.component";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Coordinate } from "../../models/models";

// components/active-ride-panel/active-ride-panel.component.ts
@Component({
    selector: 'app-active-ride-panel',
    standalone: true,
    imports: [CommonModule, BookedRideInfoComponent],
    template: `
    <div class="absolute bottom-0 left-0 right-0 z-30 p-4 pt-2">
      <div class="bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col gap-1">
        <app-booked-ride-info 
          [driverData]="driverData" 
          [rideStatus]="rideStatus"
          [driverLocation]="driverLocation" 
          [destination]="destination" 
          (cancelRide)="cancelRide.emit()">
        </app-booked-ride-info>
      </div>
    </div>
  `
})
export class ActiveRidePanelComponent {
    @Input() driverData: any;
    @Input() rideStatus!: string;
    @Input() driverLocation: { lat: number; lng: number } | null = null;
    @Input() destination: Coordinate | null = null;

    @Output() cancelRide = new EventEmitter<void>();
}
