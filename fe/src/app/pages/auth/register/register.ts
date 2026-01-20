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
import { AuthService } from '../../../core/services/auth';
import { RegisterRequest } from '../../../core/models';

// Custom validator để kiểm tra mật khẩu trùng khớp
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
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  selectedRole: 'CUSTOMER' | 'DRIVER' | null = null;
  registerForm!: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    // Để trống, form sẽ được khởi tạo sau khi chọn role
  }

  // Hàm được gọi khi người dùng chọn vai trò
  selectRole(role: 'CUSTOMER' | 'DRIVER'): void {
    this.selectedRole = role;
    this.initForm();
  }

  // Khởi tạo form dựa trên vai trò đã chọn
  initForm(): void {
    const formControls: any = {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    };

    // Nếu là DRIVER, thêm trường cccd (Căn cước công dân)
    if (this.selectedRole === 'DRIVER') {
      formControls.cccd = ['', Validators.required];
    }

    this.registerForm = this.fb.group(formControls, { validators: passwordMatcher });
  }

  // Xử lý khi submit form
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Hiển thị lỗi nếu form chưa hợp lệ
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = { ...this.registerForm.value };
    delete formData.confirmPassword; // Xóa trường confirmPassword trước khi gửi đi

    // Prepare registration request
    const registerRequest: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
    };

    console.log('Registration data:', registerRequest);

    // Call AuthService to register user
    this.authService.registerUser(registerRequest).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isSubmitting.set(false);
        this.successMessage.set('Registration successful! Redirecting to login...');

        // Navigate to login page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.isSubmitting.set(false);

        // Set user-friendly error message
        if (error.status === 409) {
          this.errorMessage.set('Email already exists. Please use a different email.');
        } else if (error.status === 0) {
          this.errorMessage.set('Unable to connect to server. Please try again.');
        } else if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('Registration failed. Please try again.');
        }
      },
    });
  }

  // Quay lại bước chọn vai trò
  resetRoleSelection(): void {
    this.selectedRole = null;
    if (this.registerForm) {
      this.registerForm.reset();
    }
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  /**
   * Check if a form field has an error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm?.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  /**
   * Get error message for a field
   */
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

  /**
   * Format field name for display
   */
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
