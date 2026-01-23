import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';

export function passwordMatcher(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected ChevronLeft = ChevronLeft;

  selectedRole: 'USER' | 'DRIVER' | null = null;
  registerForm!: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  back() {
    this.router.navigate(['/welcome']);
  }

  ngOnInit(): void {}

  selectRole(role: 'USER' | 'DRIVER'): void {
    this.selectedRole = role;
    this.initForm();
  }

  initForm(): void {
    const formControls: any = {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    };

    if (this.selectedRole === 'DRIVER') {
      formControls.cccd = ['', Validators.required];
    }

    this.registerForm = this.fb.group(formControls, { validators: passwordMatcher });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.registerForm.value;

    const registerRequest: RegisterRequest = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      userName: formData.email,

      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,

      role: this.selectedRole!,

      cccd: this.selectedRole === 'DRIVER' ? formData.cccd : undefined,

      accountType: 'NORMAL',
    };

    console.log('Dữ liệu gửi đi:', registerRequest);

    this.authService.registerUser(registerRequest).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error(err);
        this.errorMessage.set(err.error?.message || 'Đăng ký thất bại');
      },
    });
  }
  resetRoleSelection(): void {
    this.selectedRole = null;
    if (this.registerForm) {
      this.registerForm.reset();
    }
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm?.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm?.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Password must be at least ${minLength} characters`;
    }
    return '';
  }

  private formatFieldName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phoneNumber: 'Phone number',
      password: 'Password',
      confirmPassword: 'Confirm password',
      cccd: 'ID Card Number',
    };
    return fieldNames[fieldName] || fieldName;
  }
}
