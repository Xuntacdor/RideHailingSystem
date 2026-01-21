import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ride-notification',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-bold mb-4">New Ride Request</h2>
                <p>From: {{ ride.from }}</p>
                <p>To: {{ ride.to }}</p>
                <p>Vehicle: {{ ride.vehicleType }}</p>
                <div class="flex justify-end gap-2 mt-4">
                    <p>Driver: {{ ride.driverName }}</p>
                    <p>Car: {{ ride.carName }}</p>
                    <p>Car Number: {{ ride.carNumber }}</p>
                </div>
                <div class="flex justify-center gap-2 mt-4">
                    <button (click)="handleClose()" class="px-4 py-2 bg-red-500 text-white rounded">Close</button>
                </div>
            </div>
        </div>
    `
})
export class RideNotificationComponent {
    @Input() ride: any;

    @Output() onClose = new EventEmitter<any>(); // Emit ride info khi close

    handleClose() {
        this.onClose.emit(this.ride); // Gửi ride data về parent
    }
}
