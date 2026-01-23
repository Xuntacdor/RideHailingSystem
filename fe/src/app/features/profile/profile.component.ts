import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/api-response.model';
import { jwtDecode } from 'jwt-decode';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class Profile implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService); // Đổi thành public để HTML dùng được
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  currentUser = signal<UserResponse | null>(null);

  // --- PHẦN BẠN ĐANG THIẾU DỮ LIỆU ---
  menuSections = [
    {
      title: 'Tài khoản của tôi',
      items: [
        { name: 'Chỉnh sửa hồ sơ', icon: 'user', link: '/profile/edit' },
        { name: 'Địa chỉ đã lưu', icon: 'location', link: '/profile/addresses' },
        { name: 'Phương thức thanh toán', icon: 'wallet', link: '/profile/payment-methods' },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        { name: 'Trung tâm trợ giúp', icon: 'help', link: '/help-center' },
        { name: 'Báo cáo sự cố', icon: 'report', link: '/report-issue' },
      ],
    },
    {
      title: 'Khác',
      items: [
        { name: 'Điều khoản & Chính sách', icon: 'document', link: '/terms' },
        { name: 'Về chúng tôi', icon: 'info', link: '/about-us' },
      ],
    },
  ];
  // ------------------------------------
  // Thêm method này
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const user = this.currentUser();

    if (file && user) {
      // Validate sơ bộ client-side (tùy chọn)
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        this.toastService.show('File quá lớn!');
        return;
      }

      this.userService.uploadAvatar(user.id, file).subscribe({
        next: (response) => {
          if (response.results) {
            const updatedUser = { ...response.results };
            updatedUser.imageUrl = updatedUser.imageUrl + '?t=' + new Date().getTime();

            this.currentUser.set(updatedUser);
            this.authService.currentUser.set(updatedUser);
            this.toastService.show('Cập nhật ảnh đại diện thành công!');
          }
        },
        error: (err) => {
          console.error('Upload lỗi:', err);
          this.toastService.show('Có lỗi xảy ra khi upload ảnh.');
        },
      });
    }
  }
  ngOnInit(): void {
    this.fetchUserData();
  }

  fetchUserData(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.currentUser.set(currentUser);
      return;
    }

    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        const userId = decoded.sub;

        if (userId) {
          this.userService.getUserById(userId).subscribe({
            next: (response) => {
              if (response.results) {
                this.currentUser.set(response.results);
                this.authService.currentUser.set(response.results);
              }
            },
            error: (err) => {
              console.error('Lỗi fetch user:', err);
              this.logout();
            },
          });
        }
      } catch (e) {
        console.error('Lỗi decode token:', e);
        this.logout();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
