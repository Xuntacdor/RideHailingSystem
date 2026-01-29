import { Component, signal } from '@angular/core';
import { StatCardComponent } from '../admin-dashboard/components/stat-card.component';
import { ActiveRideComponent } from '../admin-dashboard/components/active-ride.component';
import { BookingTableComponent } from '../admin-dashboard/components/booking-table.component';
import { StatData } from '../admin.model';

@Component({
    selector: 'app-admin-home',
    standalone: true,
    imports: [
        StatCardComponent,
        ActiveRideComponent,
        BookingTableComponent,
    ],
    template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        @for (stat of stats(); track stat.title) {
        <app-stat-card [title]="stat.title" [value]="stat.value" [changePercentage]="stat.changePercentage"
            [icon]="stat.icon" [subtitle]="stat.subtitle || ''" />
        }
    </div>

    <div class="mb-6">
        <app-active-ride />
    </div>

    <app-booking-table />
  `,
})
export class AdminHomeComponent {
    stats = signal<StatData[]>([
        {
            title: 'Revenue',
            value: '$50,101',
            changePercentage: 12,
            icon: 'dollar-sign',
            subtitle: 'Total earnings this month',
        },
        {
            title: 'Booking',
            value: '92/100',
            changePercentage: -10,
            icon: 'calendar-check',
            subtitle: 'Active bookings',
        },
        {
            title: 'Taxis',
            value: '1540/1800',
            changePercentage: 8,
            icon: 'car',
            subtitle: 'Available vehicles',
        },
        {
            title: 'Canceled',
            value: '20',
            changePercentage: 6,
            icon: 'x-circle',
            subtitle: 'This week',
        },
    ]);
}
