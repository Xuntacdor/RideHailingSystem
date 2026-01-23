import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import {
  LoginRequest,
  RegisterRequest,
  AuthenticationResponse,
  UserResponse,
  ApiResponse,
  jwtPayload,
} from '../models/api-response.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService {
  isLoggedIn = signal<boolean>(this.hasToken());
  currentUser = signal<UserResponse | null>(null);

  constructor(private router: Router, protected override http: HttpClient) {
    super(http);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }


  /**
   * Login user
   * POST /api/auth/login
   */
  loginUser(credentials: LoginRequest): Observable<ApiResponse<AuthenticationResponse>> {
    return this.post<ApiResponse<AuthenticationResponse>>('/auth/login', credentials).pipe(
      tap((response) => {
        if (response.results.token) {
          this.setToken(response.results.token);

          this.isLoggedIn.set(true);
        }
      })
    );
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  registerUser(userData: RegisterRequest): Observable<ApiResponse<UserResponse>> {
    return this.post<ApiResponse<UserResponse>>('/auth/register', userData);
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.isLoggedIn.set(true);
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId || decoded.sub || decoded.id;
    } catch (error) {
      return null;
    }
  }
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decoded = jwtDecode<jwtPayload>(token);
      return decoded.scope;
    }
    return null;
  }

  getUserInfo(): jwtPayload | null {
    const token = this.getToken();
    if (token) {
      const decoded = jwtDecode<jwtPayload>(token);
      return {
        userId: decoded.userId,
        name: decoded.name,
        imageUrl: decoded.imageUrl,
        scope: decoded.scope,
        driverId: decoded.driverId, // Include driverId if present
        sub: decoded.sub,
        exp: decoded.exp,
        iat: decoded.iat
      };
    }
    return null;
  }

}
