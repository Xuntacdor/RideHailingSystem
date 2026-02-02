import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { CouponResponse, CouponRequest, UserResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-coupon-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coupon-management.html',
  styleUrls: ['./coupon-management.css']
})
export class CouponManagementComponent implements OnInit {
  coupons: CouponResponse[] = [];
  users: UserResponse[] = [];
  loading = false;
  showCreateModal = false;
  showAssignModal = false;
  couponForm!: FormGroup;
  editingCouponId: string | null = null;

  // Assignment modal
  selectedCouponForAssignment: CouponResponse | null = null;
  selectedUserId = '';

  couponTypes = ['DEFAULT', 'ACHIEVEMENT', 'ADMIN_CREATED', 'PROMOTIONAL'];
  achievementTypes = ['NEW_USER', 'FIRST_RIDE', 'RIDES_5', 'RIDES_10', 'RIDES_25', 'RIDES_50'];

  constructor(
    private couponService: CouponService,
    private userService: UserService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadCoupons();
    this.loadUsers();
  }

  initializeForm() {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      content: [''],
      discountPercentage: [null, [Validators.min(0), Validators.max(100)]],
      discountAmount: [null, [Validators.min(0)]],
      maxUsageLimit: [null, [Validators.min(1)]],
      usagePerUser: [null, [Validators.min(1)]],
      expirationDate: [''],
      couponType: ['ADMIN_CREATED', Validators.required],
      achievementType: [null]
    });

    // Watch couponType to conditionally require achievementType
    this.couponForm.get('couponType')?.valueChanges.subscribe(type => {
      const achievementControl = this.couponForm.get('achievementType');
      if (type === 'ACHIEVEMENT') {
        achievementControl?.setValidators(Validators.required);
      } else {
        achievementControl?.clearValidators();
        achievementControl?.setValue(null);
      }
      achievementControl?.updateValueAndValidity();
    });

    // Ensure at least one discount type is provided
    this.couponForm.setValidators(this.atLeastOneDiscountValidator.bind(this));
  }

  atLeastOneDiscountValidator(control: any) {
    const percentage = control.get('discountPercentage')?.value;
    const amount = control.get('discountAmount')?.value;
    return percentage || amount ? null : { noDiscount: true };
  }

  loadCoupons() {
    this.loading = true;
    this.couponService.getActiveCoupons().subscribe({
      next: (response) => {
        console.log('API Response for coupons:', response);
        this.coupons = response.results || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load coupons:', error);
        this.toastService.show('Failed to load coupons', 'error');
        this.loading = false;
      }
    });
  }

  loadUsers() {
    this.userService.getAllUsers(0, 1000).subscribe({
      next: (response) => {
        if (response && response.results && response.results.content) {
          this.users = response.results.content;
        }
      },
      error: (error) => {
        console.error('Failed to load users:', error);
      }
    });
  }

  openCreateModal() {
    this.editingCouponId = null;
    this.couponForm.reset({ couponType: 'ADMIN_CREATED' });
    this.showCreateModal = true;
  }

  openEditModal(coupon: CouponResponse) {
    this.editingCouponId = coupon.id;
    this.couponForm.patchValue({
      code: coupon.code,
      content: coupon.content,
      discountPercentage: coupon.discountPercentage,
      discountAmount: coupon.discountAmount,
      maxUsageLimit: coupon.maxUsageLimit,
      usagePerUser: coupon.usagePerUser,
      expirationDate: coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '',
      couponType: coupon.couponType,
      achievementType: coupon.achievementType
    });
    this.showCreateModal = true;
  }

  closeModal() {
    this.showCreateModal = false;
    this.showAssignModal = false;
    this.editingCouponId = null;
    this.selectedCouponForAssignment = null;
    this.selectedUserId = '';
  }

  saveCoupon() {
    if (this.couponForm.invalid) {
      this.toastService.show('Please fill in all required fields correctly', 'error');
      return;
    }

    const formValue = this.couponForm.value;
    const request: CouponRequest = {
      code: formValue.code,
      content: formValue.content || undefined,
      discountPercentage: formValue.discountPercentage || undefined,
      discountAmount: formValue.discountAmount || undefined,
      maxUsageLimit: formValue.maxUsageLimit || undefined,
      usagePerUser: formValue.usagePerUser || undefined,
      expirationDate: formValue.expirationDate ? new Date(formValue.expirationDate).toISOString() : undefined,
      couponType: formValue.couponType,
      achievementType: formValue.achievementType || undefined
    };

    const operation = this.editingCouponId
      ? this.couponService.updateCoupon(this.editingCouponId, request)
      : this.couponService.createCoupon(request);

    operation.subscribe({
      next: () => {
        this.toastService.show(
          this.editingCouponId ? 'Coupon updated successfully' : 'Coupon created successfully', 'success'
        );
        this.closeModal();
        this.loadCoupons();
      },
      error: (error) => {
        console.error('Failed to save coupon:', error);
        this.toastService.show('Failed to save coupon', 'error');
      }
    });
  }

  deactivateCoupon(couponId: string) {
    if (!confirm('Are you sure you want to deactivate this coupon?')) {
      return;
    }

    this.couponService.deactivateCoupon(couponId).subscribe({
      next: () => {
        this.toastService.show('Coupon deactivated successfully', 'success');
        this.loadCoupons();
      },
      error: (error) => {
        console.error('Failed to deactivate coupon:', error);
        this.toastService.show('Failed to deactivate coupon', 'error');
      }
    });
  }

  openAssignModal(coupon: CouponResponse) {
    this.selectedCouponForAssignment = coupon;
    this.selectedUserId = '';
    this.showAssignModal = true;
  }

  assignCoupon() {
    if (!this.selectedUserId || !this.selectedCouponForAssignment) {
      this.toastService.show('Please select a user', 'error');
      return;
    }

    this.couponService.assignCouponToUser(this.selectedUserId, this.selectedCouponForAssignment.id).subscribe({
      next: () => {
        this.toastService.show('Coupon assigned successfully', 'success');
        this.closeModal();
      },
      error: (error) => {
        console.error('Failed to assign coupon:', error);
        this.toastService.show(error.error?.message || 'Failed to assign coupon', 'error');
      }
    });
  }

  getDiscountDisplay(coupon: CouponResponse): string {
    if (coupon.discountPercentage) {
      return `${coupon.discountPercentage}%`;
    } else if (coupon.discountAmount) {
      return `$${coupon.discountAmount}`;
    }
    return 'N/A';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'No expiration';
    return new Date(date).toLocaleDateString();
  }
}
