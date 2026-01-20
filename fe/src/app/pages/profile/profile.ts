import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../core/models/api-response.model';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService); // Đổi thành public để HTML dùng được
  private userService = inject(UserService);

  currentUser = signal<UserResponse | null>(null);

  // --- PHẦN BẠN ĐANG THIẾU DỮ LIỆU ---
  menuSections = [
    {
      title: 'Tài khoản của tôi',
      items: [
        { name: 'Chỉnh sửa hồ sơ', icon: 'user', link: '/profile/edit' },
        { name: 'Địa chỉ đã lưu', icon: 'location', link: '/addresses' },
        { name: 'Phương thức thanh toán', icon: 'wallet', link: '/payment-methods' },
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

  ngOnInit(): void {
    this.fetchUserData();
  }

  fetchUserData(): void {
    // 1. Nếu đã có thông tin trong Signal (vừa login xong), dùng luôn
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.currentUser.set(currentUser);
      // Nếu muốn chắc chắn dữ liệu mới nhất, có thể gọi API update lại ở đây (dùng ID)
      return;
    }

    // 2. Nếu Signal rỗng (do F5), phục hồi từ Token
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // 'sub' trong token của bạn là User ID (UUID)
        const userId = decoded.sub;

        if (userId) {
          // SỬA LỖI Ở ĐÂY: Gọi API getUserById thay vì getUserByEmail
          this.userService.getUserById(userId).subscribe({
            next: (response) => {
              if (response.results) {
                this.currentUser.set(response.results);
                // Cập nhật lại vào AuthService để dùng chung cho toàn app
                this.authService.currentUser.set(response.results);
              }
            },
            error: (err) => {
              console.error('Lỗi fetch user:', err);
              // Token không hợp lệ hoặc user không tồn tại -> Logout
              this.logout();
            },
          });
        }
      } catch (e) {
        console.error('Lỗi decode token:', e);
        this.logout();
      }
    } else {
      // Không có token -> Về trang login
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
