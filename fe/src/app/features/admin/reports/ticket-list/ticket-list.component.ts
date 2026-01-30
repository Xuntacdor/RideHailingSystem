import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Filter, RefreshCw, MoreVertical, Plus } from 'lucide-angular';
import { SupportTicketService } from '../../../../core/services/support-ticket.service';
import { TicketStatus, TICKET_STATUS_COLORS } from '../support.model';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, DatePipe],
  template: `
    <div class="h-full flex flex-col space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Support Tickets</h1>
          <p class="text-gray-500 mt-1">Manage and resolve customer support requests</p>
        </div>
        <button (click)="loadTickets()" class="p-2 ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2">
            <lucide-icon name="refresh-cw" [size]="20" [class.animate-spin]="ticketService.loading()"></lucide-icon>
            <span class="text-sm font-medium">Refresh</span>
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Open Tickets</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ ticketService.openTicketsCount() }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <lucide-icon name="alert-circle" [size]="24"></lucide-icon>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Resolved</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ ticketService.resolvedTicketsCount() }}</p>
            </div>
             <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <lucide-icon name="check-circle" [size]="24"></lucide-icon>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Total Tickets</p>
                 <p class="text-2xl font-bold text-gray-900 mt-1">{{ ticketService.tickets().length }}</p>
            </div>
             <div class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                 <lucide-icon name="inbox" [size]="24"></lucide-icon>
            </div>
        </div>
      </div>

      <!-- Filters & Actions -->
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            *ngFor="let status of statuses"
            (click)="filterStatus(status)"
            [class.bg-gray-900]="currentStatus === status"
            [class.text-white]="currentStatus === status"
            [class.bg-white]="currentStatus !== status"
            [class.text-gray-600]="currentStatus !== status"
            class="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:border-gray-300 transition-all whitespace-nowrap">
            {{ formatStatus(status) }}
          </button>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th class="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let ticket of ticketService.tickets()" 
                  (click)="openTicket(ticket.id)"
                  class="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      {{ ticket.title.charAt(0) | uppercase }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{{ ticket.title }}</p>
                      <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ ticket.description }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <p class="text-sm font-medium text-gray-900">{{ ticket.userName || 'Unknown' }}</p>
                  <p class="text-xs text-gray-500">ID: {{ ticket.userId.substring(0,8) }}...</p>
                </td>
                <td class="py-4 px-6">
                  <span [class]="getStatusClass(ticket.status) + ' px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5'">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ formatStatus(ticket.status) }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center gap-2">
                     <span *ngIf="ticket.assignedAgentName" class="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{{ ticket.assignedAgentName }}</span>
                     <span *ngIf="!ticket.assignedAgentName" class="text-sm text-gray-400 italic">Unassigned</span>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <p class="text-sm text-gray-500">{{ ticket.createdAt | date:'MMM d, y, h:mm a' }}</p>
                </td>
                <td class="py-4 px-6 text-right">
                  <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" (click)="$event.stopPropagation(); openTicket(ticket.id)">
                    <lucide-icon name="chevron-right" [size]="20"></lucide-icon>
                  </button>
                </td>
              </tr>
              
              <tr *ngIf="ticketService.tickets().length === 0 && !ticketService.loading()">
                <td colspan="6" class="py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                         <lucide-icon name="inbox" [size]="32"></lucide-icon>
                    </div>
                    <p class="text-lg font-medium text-gray-900">No tickets found</p>
                    <p class="text-sm text-gray-500">There are no tickets with {{currentStatus}} status currently.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TicketListComponent implements OnInit {
  ticketService = inject(SupportTicketService);
  router = inject(Router);

  statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED];
  currentStatus: TicketStatus = TicketStatus.OPEN;

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.loadTickets(this.currentStatus);
  }

  filterStatus(status: TicketStatus): void {
    this.currentStatus = status;
    this.loadTickets();
  }

  openTicket(id: string): void {
    this.router.navigate(['/admin/reports', id]);
  }

  getStatusClass(status: string): string {
    return TICKET_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}
