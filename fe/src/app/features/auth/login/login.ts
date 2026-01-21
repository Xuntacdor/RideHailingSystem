import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { LoginRequest } from '../../../core/models';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly ChevronLeft = ChevronLeft;

  loginForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor() {
    // Initialize login form
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

    this.authService.loginUser(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isSubmitting.set(false);

        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isSubmitting.set(false);

        if (error.status === 401) {
          this.errorMessage.set('Invalid email or password');
        } else if (error.status === 0) {
          this.errorMessage.set('Unable to connect to server. Please try again.');
        } else {
          this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
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
