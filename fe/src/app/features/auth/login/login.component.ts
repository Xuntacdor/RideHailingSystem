import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';
import { UserService } from '../../../core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class Login {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly ChevronLeft = ChevronLeft;
  private destroyRef = inject(DestroyRef);

  loginForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  back() {
    this.router.navigate(['/welcome']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService
      .loginUser(credentials)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((response) => {
          console.log('✅ Login response:', response);
          const userId = this.authService.getUserId();
          console.log('🔑 User ID from token:', userId);

          // Verify token was saved
          const savedToken = localStorage.getItem('auth_token');
          console.log('💾 Token saved in localStorage:', savedToken ? 'Yes (' + savedToken.substring(0, 20) + '...)' : 'No');

          if (!userId) {
            return throwError(() => new Error('Token invalid: Cannot get user id'));
          }
          console.log('📡 Fetching user data for ID:', userId);
          return this.userService.getUserById(userId);
        }),

        catchError((error) => {
          console.error('❌ Error in login chain:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            headers: error.headers,
            url: error.url
          });

          // Log the raw response if available
          if (error.error) {
            console.error('Raw error body:', error.error);
            console.error('Error body type:', typeof error.error);
          }

          this.isSubmitting.set(false);

          // Handle JSON parsing errors (when backend returns empty body or invalid JSON)
          if (error.message && error.message.includes('parsing')) {
            console.error('🔥 JSON Parsing Error - Backend returned invalid/empty response!');

            // Check if it's an authentication error (401 with empty body)
            if (error.status === 401) {
              this.errorMessage.set('Session expired or invalid. Please login again.');
              // Clear token and redirect to login
              localStorage.removeItem('auth_token');
              this.authService.isLoggedIn.set(false);
            } else if (error.status === 200) {
              // Status 200 but parsing failed - backend issue
              this.errorMessage.set('Server response error. Please contact support.');
            } else {
              this.errorMessage.set('Server error. Please try again later.');
            }
            return EMPTY;
          }

          if (error.message && error.message.includes('Token invalid')) {
            this.errorMessage.set(error.message);
          } else if (error.status === 401) {
            this.errorMessage.set('Invalid email or password');
          } else if (error.status === 0) {
            this.errorMessage.set('Unable to connect to server. Please try again.');
          } else {
            this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
          }

          return EMPTY;
        })
      )
      .subscribe({
        next: (userResponse) => {
          console.log('👤 User data received:', userResponse);
          this.isSubmitting.set(false);

          const role = userResponse.results.role;
          console.log('🎭 User role:', role);

          if (role === 'DRIVER') {
            this.router.navigate(['/driver']);
          } else if (role === 'CUSTOMER' || role === 'USER') {
            this.router.navigate(['/userBooking']);
          } else if (role === 'ADMIN' || role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/welcome']);
          }
        },
      });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
