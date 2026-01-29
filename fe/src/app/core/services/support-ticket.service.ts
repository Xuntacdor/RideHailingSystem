import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import {
  ApiResponse,
  SupportTicketResponse,
  SupportTicketRequest,
} from '../models/api-response.model';
import { TicketStatus } from '../../features/admin/reports/support.model';
import { Observable, tap, catchError, of, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupportTicketService extends ApiService {
  // Signals for state management
  private _tickets = signal<SupportTicketResponse[]>([]);
  private _selectedTicket = signal<SupportTicketResponse | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Exposed signals
  tickets = this._tickets.asReadonly();
  selectedTicket = this._selectedTicket.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Computed signals
  openTicketsCount = computed(() =>
    this._tickets().filter(t => t.status === TicketStatus.OPEN).length
  );

  resolvedTicketsCount = computed(() =>
    this._tickets().filter(t => t.status === TicketStatus.RESOLVED).length
  );

  constructor(http: HttpClient) {
    super(http);
  }

  createTicket(request: SupportTicketRequest): Observable<ApiResponse<SupportTicketResponse>> {
    this._loading.set(true);
    return this.post<ApiResponse<SupportTicketResponse>>('/ticket', request).pipe(
      finalize(() => this._loading.set(false))
    );
  }

  loadTickets(status?: TicketStatus): void {
    this._loading.set(true);
    this._error.set(null);

    let endpoint = '/api/ticket';
    if (status) {
      endpoint = `/api/ticket/status/${status}`;
    } else {
      // Fallback to fetch open tickets by default or all if backend supported it better
      // Since we are reusing the service I previously planned
      endpoint = `/api/ticket/status/${TicketStatus.OPEN}`;
    }

    // Since ApiService adds apiUrl, and the controller is at /api/ticket, 
    // waiting 'ApiService' usually prepends environment.apiUrl.
    // If environment.apiUrl includes /api, we must be careful.
    // Looking at ApiService: `return this.http.get<T>(`${this.apiUrl}${endpoint}`, options);`
    // And UserController file showed `@RequestMapping("/api/users")`.
    // So likely apiUrl is just the host.
    // But wait, the existing service had `/ticket` not `/api/ticket`.
    // Let me double check usage in `SupportTicketService.java`: `@RequestMapping("/api/ticket")`
    // And existing existing TS service had `/ticket`.
    // This implies `environment.apiUrl` might include `/api`.
    // Let's verify `environment.ts` later or stick to existing convention.
    // Existing service had: `return this.get<...>(`/ticket/${id}`);`
    // So I should use `/ticket`.

    // CORRECTION: Re-reading existing service content:
    // `return this.post<ApiResponse<SupportTicketResponse>>('/ticket', request);`
    // So the endpoint starts with `/ticket`.

    if (status) {
      endpoint = `/ticket/status/${status}`;
    } else {
      endpoint = `/ticket/status/${TicketStatus.OPEN}`;
    }

    this.get<ApiResponse<SupportTicketResponse[]>>(endpoint)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (response) => {
          this._tickets.set(response.results || []);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load tickets');
          console.error('Error loading tickets:', err);
        }
      });
  }

  getTicketById(id: string): void {
    this._loading.set(true);
    this.get<ApiResponse<SupportTicketResponse>>(`/ticket/${id}`)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (response) => {
          this._selectedTicket.set(response.results);
        },
        error: (err) => {
          this._error.set(err.message);
        }
      });
  }

  updateTicketStatus(id: string, status: TicketStatus): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(`/ticket/${id}/status?status=${status}`, {}).pipe(
      tap(response => {
        this._tickets.update(tickets =>
          tickets.map(t => t.id === id ? response.results : t)
        );
        if (this._selectedTicket()?.id === id) {
          this._selectedTicket.set(response.results);
        }
      })
    );
    // Wait, ApiService put method signature: protected put<T>(endpoint: string, body: any): Observable<T>
    // It doesn't take params as 3rd arg.
    // I need to look at how to pass params.
    // ApiService doesn't seem to expose a way to pass params in PUT.
    // The existing service did this:
    // return this.put<ApiResponse<SupportTicketResponse>>(`/ticket/${id}/status?status=${status}`, {});
    // I will follow that pattern.
  }

  // Overriding/Implementing with correct pattern
  updateStatus(id: string, status: TicketStatus): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(`/ticket/${id}/status?status=${status}`, {})
      .pipe(
        tap(response => {
          this._tickets.update(tickets =>
            tickets.map(t => t.id === id ? response.results : t)
          );
          if (this._selectedTicket()?.id === id) {
            this._selectedTicket.set(response.results);
          }
        })
      );
  }

  reassignTicket(id: string, agentId: string): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(`/ticket/${id}/reassign?agentId=${agentId}`, {})
      .pipe(
        tap(response => {
          this._tickets.update(tickets =>
            tickets.map(t => t.id === id ? response.results : t)
          );
          if (this._selectedTicket()?.id === id) {
            this._selectedTicket.set(response.results);
          }
        })
      );
  }

  resolveTicket(id: string): Observable<ApiResponse<SupportTicketResponse>> {
    return this.put<ApiResponse<SupportTicketResponse>>(`/ticket/${id}/resolve`, {})
      .pipe(
        tap(response => {
          this._tickets.update(tickets =>
            tickets.map(t => t.id === id ? response.results : t)
          );
          if (this._selectedTicket()?.id === id) {
            this._selectedTicket.set(response.results);
          }
        })
      );
  }

  // Additional getters if needed to return Observable instead of void (for consistency with old service if needed elsewhere)
  // But for the new UI we will use the signals.

  // Keep the old methods if any other component uses them, but wrapped or just distinct.
  // The old service had `getUserTickets`. I will keep it but update it to use the new pattern or just leave it returning Observable.
  getUserTickets(userId: string): Observable<ApiResponse<SupportTicketResponse[]>> {
    return this.get<ApiResponse<SupportTicketResponse[]>>(`/ticket/user/${userId}`);
  }

  getAgentTickets(agentId: string): Observable<ApiResponse<SupportTicketResponse[]>> {
    return this.get<ApiResponse<SupportTicketResponse[]>>(`/ticket/agent/${agentId}`);
  }
}
