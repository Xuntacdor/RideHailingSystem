import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiResponse,
  SupportTicketResponse,
  SupportTicketRequest,
  TicketStatus,
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class SupportTicketService extends ApiService {
  createTicket(request: SupportTicketRequest): Observable<ApiResponse<SupportTicketResponse>> {
    return this.post<ApiResponse<SupportTicketResponse>>('/ticket', request);
  }

  getTicketById(id: string): Observable<ApiResponse<SupportTicketResponse>> {
    return this.get<ApiResponse<SupportTicketResponse>>(`/ticket/${id}`);
  }

  getUserTickets(userId: string): Observable<ApiResponse<SupportTicketResponse[]>> {
    return this.get<ApiResponse<SupportTicketResponse[]>>(`/ticket/user/${userId}`);
  }

  getAgentTickets(agentId: string): Observable<ApiResponse<SupportTicketResponse[]>> {
    return this.get<ApiResponse<SupportTicketResponse[]>>(`/ticket/agent/${agentId}`);
  }

  updateTicketStatus(
    id: string,
    status: TicketStatus
  ): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(
      `/ticket/${id}/status?status=${status}`,
      {}
    );
  }

  reassignTicket(id: string, agentId: string): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(
      `/ticket/${id}/reassign?agentId=${agentId}`,
      {}
    );
  }

  resolveTicket(id: string): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(`/ticket/${id}/resolve`, {});
  }

  getTicketsByStatus(status: TicketStatus): Observable<ApiResponse<SupportTicketResponse[]>> {
    return this.get<ApiResponse<SupportTicketResponse[]>>(`/ticket/status/${status}`);
  }
}
