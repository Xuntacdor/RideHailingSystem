import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule, ArrowDown,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  XCircle,
  MoreHorizontal
} from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

// Interfaces for our data
interface KpiCard {
  title: string;
  value: string;
  trend: number;
  icon: string;
  changeLabel: string;
  trendUp: boolean;
}

interface Ride {
  id: string;
  user: string;
  driver: string;
  from: string;
  to: string;
  price: number;
  status: 'COMPLETED' | 'CANCELLED' | 'ONGOING';
  date: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p class="text-gray-500 mt-1">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <lucide-icon name="download" [size]="18"></lucide-icon>
            Export Report
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
            <lucide-icon name="refresh-cw" [size]="18"></lucide-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (card of kpiCards(); track card.title) {
          <div class="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                <lucide-icon [name]="card.icon" [size]="24"></lucide-icon>
              </div>
              <div class="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full" 
                [class.bg-green-50]="card.trendUp" 
                [class.text-green-600]="card.trendUp"
                [class.bg-red-50]="!card.trendUp"
                [class.text-red-600]="!card.trendUp">
                <lucide-icon [name]="card.trendUp ? 'trending-up' : 'trending-down'" [size]="14"></lucide-icon>
                {{ card.trend }}%
              </div>
            </div>
            <div>
              <p class="text-gray-500 text-sm font-medium mb-1">{{ card.title }}</p>
              <h3 class="text-3xl font-bold text-gray-900 tracking-tight">{{ card.value }}</h3>
              <p class="text-gray-400 text-xs mt-2">{{ card.changeLabel }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Trend (Line Chart) -->
        <div class="lg:col-span-2 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Revenue Analytics</h3>
              <p class="text-sm text-gray-500">Income over the last 7 days</p>
            </div>
            <button class="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <lucide-icon name="more-horizontal" [size]="20"></lucide-icon>
            </button>
          </div>
          <div class="h-[300px] w-full">
            <canvas baseChart
              [data]="revenueChartData"
              [options]="revenueChartOptions"
              [type]="'line'">
            </canvas>
          </div>
        </div>

        <!-- Ride Status (Doughnut Chart) -->
        <div class="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Ride Status</h3>
              <p class="text-sm text-gray-500">Distribution of rides</p>
            </div>
            <button class="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <lucide-icon name="more-horizontal" [size]="20"></lucide-icon>
            </button>
          </div>
          <div class="h-[300px] flex items-center justify-center relative">
             <canvas baseChart
              [data]="rideStatusChartData"
              [options]="rideStatusChartOptions"
              [type]="'doughnut'">
            </canvas>
            <!-- Center Text Overlay -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-3xl font-bold text-gray-900">{{ kpiCards()[1].value }}</span>
                <span class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Rides</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Rides Table -->
      <div class="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
           <div>
              <h3 class="text-lg font-bold text-gray-900">Recent Rides</h3>
              <p class="text-sm text-gray-500">Latest transaction details</p>
            </div>
            <button class="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View All
            </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ride ID</th>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Driver</th>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (ride of recentRides(); track ride.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6 text-sm font-medium text-gray-900">#{{ ride.id }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {{ ride.user.charAt(0) }}
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ ride.user }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xs font-bold">
                         {{ ride.driver.charAt(0) }}
                      </div>
                       <span class="text-sm font-medium text-gray-900">{{ ride.driver }}</span>
                    </div>
                  </td>
                   <td class="py-4 px-6">
                    <div class="flex flex-col max-w-[200px]">
                      <span class="text-xs text-gray-500 truncate" title="{{ ride.from }}">{{ ride.from }}</span>
                      <lucide-icon name="arrow-down" [size]="12" class="text-gray-300 my-0.5"></lucide-icon>
                      <span class="text-xs font-medium text-gray-900 truncate" title="{{ ride.to }}">{{ ride.to }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-sm font-bold text-gray-900">\${{ ride.price.toFixed(2) }}</td>
                  <td class="py-4 px-6">
                    <span class="px-3 py-1 text-xs font-bold rounded-full border"
                      [class.bg-green-50]="ride.status === 'COMPLETED'"
                      [class.text-green-700]="ride.status === 'COMPLETED'"
                      [class.border-green-200]="ride.status === 'COMPLETED'"
                      [class.bg-red-50]="ride.status === 'CANCELLED'"
                      [class.text-red-700]="ride.status === 'CANCELLED'"
                      [class.border-red-200]="ride.status === 'CANCELLED'"
                      [class.bg-blue-50]="ride.status === 'ONGOING'"
                      [class.text-blue-700]="ride.status === 'ONGOING'"
                      [class.border-blue-200]="ride.status === 'ONGOING'">
                      {{ ride.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-500">{{ ride.date }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminHomeComponent implements OnInit {

  // Signals for Data
  kpiCards = signal<KpiCard[]>([]);
  recentRides = signal<Ride[]>([]);
  constructor() {
    Chart.register(...registerables)
  }
  // Chart Data
  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [1200, 1900, 1500, 2200, 2800, 3500, 4100],
        label: 'Revenue ($)',
        fill: true,
        tension: 0.4,
        borderColor: '#2563eb', // blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2563eb',
      }
    ]
  };

  public revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false, drawTicks: false },
        ticks: { font: { size: 12 }, color: '#6b7280' }
      },
      y: {
        border: { display: false, dash: [4, 4] },
        grid: { color: '#f3f4f6', },
        ticks: {
          callback: (value) => '$' + value,
          font: { size: 12 },
          color: '#6b7280',
          maxTicksLimit: 5
        }
      }
    }
  };

  public rideStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Completed', 'Cancelled', 'Ongoing'],
    datasets: [
      {
        data: [850, 42, 348],
        backgroundColor: [
          '#10b981', // emerald-500
          '#ef4444', // red-500
          '#3b82f6', // blue-500
        ],
        hoverBackgroundColor: [
          '#059669',
          '#dc2626',
          '#2563eb',
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  public rideStatusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Thinner ring
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, family: 'inherit' },
          color: '#4b5563'
        }
      }
    }
  };

  ngOnInit() {
    this.loadMockData();
  }

  private loadMockData() {
    // Simulate API call
    this.kpiCards.set([
      {
        title: 'Total Revenue',
        value: '$12,500',
        trend: 12.5,
        trendUp: true,
        icon: 'dollar-sign',
        changeLabel: 'vs. last week'
      },
      {
        title: 'Total Rides',
        value: '1,240',
        trend: 8.2,
        trendUp: true,
        icon: 'car',
        changeLabel: 'vs. last week'
      },
      {
        title: 'Active Drivers',
        value: '85',
        trend: -2.4,
        trendUp: false,
        icon: 'users',
        changeLabel: 'vs. last hour'
      },
      {
        title: 'Cancel Rate',
        value: '4.2%',
        trend: -0.5,
        trendUp: true, // Lower cancel rate is good (green)
        icon: 'x-circle',
        changeLabel: 'vs. last week'
      }
    ]);

    this.recentRides.set([
      {
        id: '9821',
        user: 'Alex Johnson',
        driver: 'Mike Smith',
        from: 'Central Station',
        to: 'Airport Terminal 2',
        price: 24.50,
        status: 'COMPLETED',
        date: '2 mins ago'
      },
      {
        id: '9820',
        user: 'Sarah Williams',
        driver: 'John Doe',
        from: 'Grand Hotel',
        to: 'City Mall',
        price: 12.00,
        status: 'ONGOING',
        date: '5 mins ago'
      },
      {
        id: '9819',
        user: 'Michael Brown',
        driver: 'Emily Davis',
        from: 'Tech Park',
        to: 'Downtown',
        price: 0,
        status: 'CANCELLED',
        date: '15 mins ago'
      },
      {
        id: '9818',
        user: 'Emma Wilson',
        driver: 'Chris Evans',
        from: 'University',
        to: 'Library',
        price: 8.50,
        status: 'COMPLETED',
        date: '22 mins ago'
      },
      {
        id: '9817',
        user: 'Daniel Miller',
        driver: 'Robert Wilson',
        from: 'Stadium',
        to: 'Train Station',
        price: 15.75,
        status: 'COMPLETED',
        date: '30 mins ago'
      }
    ]);
  }
}
