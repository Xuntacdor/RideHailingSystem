import { Component, signal } from '@angular/core';
import { SidebarComponent } from './components/sidebar.component';
import { HeaderComponent } from './components/header.component';
import { StatCardComponent } from './components/stat-card.component';
import { ActiveRideComponent } from './components/active-ride.component';
import { BookingTableComponent } from './components/booking-table.component';
import { StatData } from '../admin.model';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    StatCardComponent,
    ActiveRideComponent,
    BookingTableComponent,
  ],

  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent {
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