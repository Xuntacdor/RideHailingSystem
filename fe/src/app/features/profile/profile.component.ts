import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/api-response.model';
import { jwtDecode } from 'jwt-decode';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class Profile implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private location = inject(Location);
  private readonly BACKEND_URL = environment.apiUrl;

  currentUser = signal<UserResponse | null>(null);


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
      title: 'Thông tin & Tiện ích',
      items: [
        { name: 'Lịch sử chuyến đi', icon: 'document', link: '/profile/travel-history' },
        { name: 'Chính sách quyền riêng tư', icon: 'info', link: '/profile/privacy-policy' },
      ],
    },
  ];
  // ------------------------------------
  // Thêm method này
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const user = this.currentUser();

    if (file && user) {
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.show('File quá lớn!');
        return;
      }

      this.userService.uploadAvatar(user.id, file).subscribe({
        next: (response) => {
          if (response.results) {
            const updatedUser = { ...response.results };
            let newImageUrl = response.results.imageUrl;
            if (newImageUrl && !newImageUrl.startsWith('http')) {
              const path = newImageUrl.startsWith('/') ? newImageUrl : `/${newImageUrl}`;
              newImageUrl = `${this.BACKEND_URL}${path}`;
            }
            updatedUser.imageUrl = newImageUrl + '?t=' + new Date().getTime();

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
  goBack(): void {
    this.location.back();
  }
}
