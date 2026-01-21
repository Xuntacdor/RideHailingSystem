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

  selectedRole: 'USER' | 'DRIVER' | null = null;
  registerForm!: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    // Để trống, form sẽ được khởi tạo sau khi chọn role
  }

  // Hàm được gọi khi người dùng chọn vai trò
  selectRole(role: 'USER' | 'DRIVER'): void {
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
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Lấy dữ liệu thô từ form
    const formData = this.registerForm.value;

    // --- MAP DỮ LIỆU CHO KHỚP BACKEND ---
    const registerRequest: RegisterRequest = {
      // 1. Gộp Họ + Tên thành 'name'
      name: `${formData.firstName} ${formData.lastName}`.trim(),

      // 2. Lấy Email làm UserName (Lưu ý: Backend yêu cầu min 6 ký tự)
      // Nếu email ngắn quá (ví dụ a@b.c) sẽ bị lỗi. Nhưng thường email > 6.
      userName: formData.email,

      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,

      // 3. Gửi Role (Bắt buộc)
      role: this.selectedRole!, // Dấu ! khẳng định không null

      // 4. Gửi CCCD nếu là Driver
      cccd: this.selectedRole === 'DRIVER' ? formData.cccd : undefined,

      // 5. Mặc định
      accountType: 'NORMAL'
    };

    console.log('Dữ liệu gửi đi:', registerRequest); // F12 xem log này

    this.authService.registerUser(registerRequest).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error(err);
        // Hiển thị lỗi từ backend trả về (ví dụ: USERNAME_INVALID)
        this.errorMessage.set(err.error?.message || 'Đăng ký thất bại');
      }
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
