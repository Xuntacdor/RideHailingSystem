import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupportTicketService } from '../../core/services/support-ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-report-issue',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './report-issue.component.html',
    styleUrls: ['./report-issue.component.css']
})
export class ReportIssueComponent implements OnInit {
    private fb = inject(FormBuilder);
    private supportTicketService = inject(SupportTicketService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private location = inject(Location);
    private toastService = inject(ToastService);

    reportForm!: FormGroup;
    isSubmitting = signal(false);

    issueCategories = [
        { value: 'payment', label: '💳 Vấn đề thanh toán', icon: 'wallet' },
        { value: 'driver', label: '👨‍✈️ Vấn đề với tài xế', icon: 'person' },
        { value: 'ride', label: '🚗 Vấn đề chuyến đi', icon: 'car' },
        { value: 'app', label: '📱 Lỗi ứng dụng', icon: 'bug' },
        { value: 'safety', label: '🛡️ An toàn', icon: 'shield' },
        { value: 'other', label: '📝 Khác', icon: 'help' }
    ];

    ngOnInit() {
        this.reportForm = this.fb.group({
            category: ['', Validators.required],
            title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
            description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]]
        });
    }

    onSubmit() {
        if (this.reportForm.invalid) {
            this.reportForm.markAllAsTouched();
            return;
        }

        const user = this.authService.currentUser();
        if (!user) {
            this.toastService.show('Vui lòng đăng nhập để báo cáo sự cố');
            this.router.navigate(['/login']);
            return;
        }

        this.isSubmitting.set(true);

        const formValue = this.reportForm.value;
        const categoryLabel = this.issueCategories.find(c => c.value === formValue.category)?.label || formValue.category;

        const request = {
            userId: user.id,
            title: `[${categoryLabel}] ${formValue.title}`,
            description: formValue.description
        };

        this.supportTicketService.createTicket(request).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                this.toastService.show('Báo cáo đã được gửi thành công!');
                this.reportForm.reset();
                setTimeout(() => {
                    this.goBack();
                }, 1500);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                console.error('Error submitting report:', err);
                this.toastService.show('Không thể gửi báo cáo. Vui lòng thử lại.');
            }
        });
    }

    goBack() {
        this.location.back();
    }
}
