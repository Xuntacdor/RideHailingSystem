import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SupportTicketService } from '../../../../core/services/support-ticket.service';
import { TicketStatus, TICKET_STATUS_COLORS } from '../support.model';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ticket-workspace',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, DatePipe],
  template: `
    <div class="h-full flex flex-col space-y-6" *ngIf="ticketService.selectedTicket() as ticket">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <lucide-icon name="arrow-left" [size]="24"></lucide-icon>
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-800">Tweet #{{ ticket.id.substring(0, 8) }}</h1>
              <span [class]="getStatusClass(ticket.status) + ' px-3 py-1 rounded-full text-xs font-medium'">
                {{ formatStatus(ticket.status) }}
              </span>
            </div>
            <p class="text-gray-500 mt-1 flex items-center gap-2">
              <lucide-icon name="clock" [size]="14"></lucide-icon>
              Created on {{ ticket.createdAt | date:'medium' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
           <div class="relative">
              <select 
                [ngModel]="ticket.status" 
                (ngModelChange)="updateStatus($event)"
                class="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                <option *ngFor="let status of statuses" [value]="status">{{ formatStatus(status) }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
              </div>
           </div>
           
           <button 
             *ngIf="ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED'"
             (click)="resolveTicket()"
             class="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-green-200 transition-all flex items-center gap-2">
             <lucide-icon name="check" [size]="18"></lucide-icon>
             Resolve Ticket
           </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6 flex flex-col">
          <!-- Ticket Details -->
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
               {{ ticket.title }}
            </h2>
            <div class="prose max-w-none text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
              {{ ticket.description }}
            </div>
          </div>
          
          <!-- Activity/Notes Placeholder (Future Feature) -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 opacity-50 pointer-events-none relative overflow-hidden">
             <div class="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                 <p class="text-gray-500 font-medium">Activity Log & Comments (Coming Soon)</p>
             </div>
             <h3 class="font-bold text-gray-800 mb-4">Activity Log</h3>
             <div class="space-y-4">
                 <div class="flex gap-4">
                     <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                     <div class="space-y-2 w-full">
                         <div class="h-4 bg-gray-100 rounded w-1/4"></div>
                         <div class="h-20 bg-gray-50 rounded w-full"></div>
                     </div>
                 </div>
             </div>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
          <!-- User Info -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Customer Details</h3>
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {{ ticket.userName?.charAt(0) || 'U' }}
              </div>
              <div>
                <p class="font-bold text-gray-900">{{ ticket.userName || 'Unknown User' }}</p>
                <p class="text-sm text-gray-500">ID: {{ ticket.userId.substring(0,8) }}</p>
              </div>
            </div>
            
            <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm text-gray-600">
                    <lucide-icon name="mail" [size]="16" class="text-gray-400"></lucide-icon>
                    <span>user&#64;example.com</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600">
                    <lucide-icon name="phone" [size]="16" class="text-gray-400"></lucide-icon>
                    <span>+1234567890</span>
                </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-100">
                <button class="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors">
                    View Customer Profile
                </button>
            </div>
          </div>

          <!-- Assignment -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Assignment</h3>
             
             <div class="bg-gray-50 p-4 rounded-xl mb-4">
                 <p class="text-xs text-gray-500 mb-1">Assigned Agent</p>
                 <div class="flex items-center gap-2">
                     <div class="w-2 h-2 rounded-full bg-green-500"></div>
                     <p class="font-medium text-gray-900">{{ ticket.assignedAgentName || 'Unassigned' }}</p>
                 </div>
             </div>
             
             <div class="space-y-3">
                 <label class="block text-sm font-medium text-gray-700">Reassign Ticket</label>
                 <input type="text" placeholder="Enter Agent ID" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                 <button class="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors">
                     Assign
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="ticketService.loading()" class="h-full flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
            <lucide-icon name="loader-2" [size]="32" class="animate-spin text-blue-600"></lucide-icon>
            <p class="text-gray-500 font-medium">Loading ticket details...</p>
        </div>
    </div>
  `
})
export class TicketWorkspaceComponent implements OnInit {
  ticketService = inject(SupportTicketService);
  route = inject(ActivatedRoute);
  location = inject(Location);

  statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketService.getTicketById(id);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  updateStatus(status: TicketStatus): void {
    const ticket = this.ticketService.selectedTicket();
    if (ticket) {
      this.ticketService.updateStatus(ticket.id, status).subscribe();
    }
  }

  resolveTicket(): void {
    const ticket = this.ticketService.selectedTicket();
    if (ticket) {
      this.ticketService.resolveTicket(ticket.id).subscribe();
    }
  }

  getStatusClass(status: string): string {
    return TICKET_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}
