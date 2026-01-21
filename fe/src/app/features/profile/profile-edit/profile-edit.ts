import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth';
import { UserRequest } from '../../../core/models/api-response.model';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.html',
})
export class ProfileEdit implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  editForm: FormGroup;
  userId: string = '';
  isDriver: boolean = false;
  isSubmitting = signal(false);

  constructor() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      email: [{ value: '', disabled: true }], // Email không cho sửa
      cccd: [''] // Chỉ dùng cho Driver
    });
  }

  ngOnInit() {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      this.userId = currentUser.id;
      this.isDriver = currentUser.role === 'DRIVER';


      this.editForm.patchValue({
        name: currentUser.name,
        phoneNumber: currentUser.phoneNumber,
        email: currentUser.email,
        cccd: currentUser.cccd
      });


      if (this.isDriver) {
        this.editForm.get('cccd')?.setValidators([Validators.required]);
      } else {
        this.editForm.get('cccd')?.clearValidators();
      }
      this.editForm.get('cccd')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);


    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.toastService.show('Phiên đăng nhập hết hạn.');
      this.router.navigate(['/login']);
      return;
    }

    const formValues = this.editForm.getRawValue();


    const updateData: UserRequest = {
      name: formValues.name,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,


      userName: currentUser.userName,
      role: currentUser.role,


      cccd: this.isDriver ? formValues.cccd : undefined,


      password: 'NO_CHANGE_PASSWORD_123',


      imageUrl: currentUser.imageUrl,
      accountType: currentUser.accountType
    };

    console.log('Sending Update Payload:', updateData);

    this.userService.updateUserProfile(this.userId, updateData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastService.show('Cập nhật thành công!');

        // Cập nhật lại Signal để UI toàn app thay đổi
        if (res.results) {
          this.authService.currentUser.set(res.results);
        }

        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Update Failed:', err);
        const msg = err.error?.message || 'Lỗi cập nhật hồ sơ.';
        this.toastService.show(msg);
      }
    });
  }
}