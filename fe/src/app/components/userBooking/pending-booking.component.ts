import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindingDriverModalComponent } from './finding-driver-modal/finding-driver-modal.component';

@Component({
    selector: 'app-pending-booking',
    standalone: true,
    imports: [CommonModule, FindingDriverModalComponent],
    template: `
    <app-finding-driver-modal
      (cancelSearch)="onCancel()"
    ></app-finding-driver-modal>
  `
})
export class PendingBookingComponent {
    @Output() cancelBooking = new EventEmitter<void>();

    onCancel() {
        this.cancelBooking.emit();
    }
}
