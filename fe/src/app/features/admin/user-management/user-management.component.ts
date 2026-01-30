import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: string;
    phoneNumber: string;
    avatar?: string;
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="bg-white rounded-[20px] p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <h3 class="text-xl font-bold text-gray-900">User Management</h3>
            <span class="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">{{ users().length }} Users</span>
        </div>
        
        <button 
          (click)="openModal()"
          class="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <lucide-icon name="plus" [size]="18"></lucide-icon>
          Create Supporter
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="relative">
          <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" [size]="20"></lucide-icon>
          <input 
            type="text" 
            [(ngModel)]="searchKeyword" 
            (keyup.enter)="onSearch()"
            placeholder="Search by name or email..." 
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          >
        </div>
        
        <div>
           <select 
            [(ngModel)]="selectedRole" 
            (change)="onSearch()"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DRIVER">Driver</option>
            <option value="USER">User</option>
            <option value="SUPPORTER">Supporter</option>
          </select>
        </div>

        <div>
          <button 
            (click)="onSearch()"
            class="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            Search
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 text-left">
              <th class="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th class="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th class="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-all group">
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shadow-inner">
                      {{ getInitials(user.name) }}
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900">{{ user.name }}</div>
                        <div class="text-xs text-gray-500">ID: {{ user.id.substring(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4">
                    <span 
                        class="px-3 py-1 text-xs font-semibold rounded-full border"
                        [class.bg-purple-50]="user.role === 'SUPPORTER'"
                        [class.text-purple-700]="user.role === 'SUPPORTER'"
                        [class.border-purple-200]="user.role === 'SUPPORTER'"
                        [class.bg-blue-50]="user.role === 'USER'"
                        [class.text-blue-700]="user.role === 'USER'"
                        [class.border-blue-200]="user.role === 'USER'"
                        [class.bg-amber-50]="user.role === 'DRIVER'"
                        [class.text-amber-700]="user.role === 'DRIVER'"
                        [class.border-amber-200]="user.role === 'DRIVER'"
                        [class.bg-red-50]="user.role === 'ADMIN'"
                        [class.text-red-700]="user.role === 'ADMIN'"
                        [class.border-red-200]="user.role === 'ADMIN'"
                    >
                        {{ user.role }}
                    </span>
                </td>
                <td class="py-4 px-4">
                    <div class="flex flex-col text-sm">
                        <span class="text-gray-900">{{ user.email }}</span>
                        <span class="text-gray-500">{{ user.phoneNumber }}</span>
                    </div>
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-2 h-2 rounded-full"
                      [class.bg-green-500]="user.status === 'ACTIVE'"
                      [class.bg-gray-300]="user.status !== 'ACTIVE'"
                    ></div>
                    <span class="text-sm font-medium text-gray-700 capitalize">{{ user.status?.toLowerCase() || 'Offline' }}</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-right">
                  <button class="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg">
                    <lucide-icon name="more-horizontal" [size]="18"></lucide-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    
      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && users().length === 0) {
        <div class="text-center py-12">
            <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon name="users" class="text-gray-400" [size]="32"></lucide-icon>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">No users found</h3>
            <p class="text-gray-500 mt-1">Get started by creating a new user.</p>
        </div>
      }
    </div>

    <!-- Create Supporter Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>

        <!-- Modal Content -->
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                    <h3 class="text-lg font-bold text-gray-900">Add New Supporter</h3>
                    <p class="text-sm text-gray-500">Create account for support staff</p>
                </div>
                <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                    <lucide-icon name="x" [size]="20"></lucide-icon>
                </button>
            </div>

            <!-- Body -->
            <form [formGroup]="supporterForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
                
                <!-- Name -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" formControlName="name" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Alice Support">
                    @if (supporterForm.get('name')?.touched && supporterForm.get('name')?.invalid) {
                        <p class="text-xs text-red-500 mt-1">Name is required</p>
                    }
                </div>

                <!-- Username & Phone in grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                        <input type="text" formControlName="userName" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="alice.sup">
                        @if (supporterForm.get('userName')?.touched && supporterForm.get('userName')?.invalid) {
                            <p class="text-xs text-red-500 mt-1">Min 6 chars</p>
                        }
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                        <input type="text" formControlName="phoneNumber" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="090123...">
                        @if (supporterForm.get('phoneNumber')?.touched && supporterForm.get('phoneNumber')?.invalid) {
                            <p class="text-xs text-red-500 mt-1">Required</p>
                        }
                    </div>
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input type="email" formControlName="email" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="alice@example.com">
                    @if (supporterForm.get('email')?.touched && supporterForm.get('email')?.invalid) {
                        <p class="text-xs text-red-500 mt-1">Valid email required</p>
                    }
                </div>

                <!-- Password -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div class="relative">
                        <input [type]="showPassword ? 'text' : 'password'" formControlName="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none pr-10" placeholder="••••••••">
                        <button type="button" (click)="togglePassword()" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="18"></lucide-icon>
                        </button>
                    </div>
                    @if (supporterForm.get('password')?.touched && supporterForm.get('password')?.invalid) {
                        <p class="text-xs text-red-500 mt-1">Min 6 characters</p>
                    }
                </div>

                <!-- Footer Actions -->
                <div class="pt-2 flex gap-3">
                    <button type="button" (click)="closeModal()" class="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" [disabled]="supporterForm.invalid || submitting()" class="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                        @if (submitting()) {
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        }
                        Create Account
                    </button>
                </div>

            </form>
        </div>
      </div>
    }
  `
})
export class UserManagementComponent implements OnInit {
    private userService = inject(UserService);
    private authService = inject(AuthService); // Inject AuthService
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);

    users = signal<User[]>([]);
    loading = signal(false);
    showModal = signal(false);
    submitting = signal(false);
    showPassword = false;

    // Search properties
    searchKeyword = '';
    selectedRole = '';

    supporterForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        userName: ['', [Validators.required, Validators.minLength(6)]],
        phoneNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: ['SUPPORTER'], // Hardcoded role
        accountType: ['SYSTEM']
    });

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);

        // Check if we are searching
        if (this.searchKeyword.trim() || this.selectedRole) {
            this.userService.searchUsers(this.selectedRole, this.searchKeyword).subscribe({
                next: (response: any) => {
                    // API returns ApiResponse<List<UserResponse>>
                    const results = response.results || [];
                    this.users.set(results);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Search failed', err);
                    this.toastService.show('Failed to search users');
                    this.loading.set(false);
                }
            });
        } else {
            // Default pagination
            this.userService.getAllUsers(0, 10).subscribe({
                next: (response: any) => {
                    console.log('Dữ liệu Server trả về:', response);
                    if (response && response.content) {
                        this.users.set(response.content);
                    } else {
                        this.users.set([]);
                    }
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Failed to load users', err);
                    this.loading.set(false);
                }
            });
        }
    }

    onSearch() {
        this.loadUsers();
    }

    getInitials(name: string): string {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    }

    openModal() {
        this.supporterForm.reset({
            role: 'SUPPORTER',
            accountType: 'SYSTEM'
        });
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        if (this.supporterForm.invalid) {
            this.supporterForm.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const formData = this.supporterForm.value;

        // Use authService.registerUser instead of userService.register
        this.authService.registerUser(formData).subscribe({
            next: (res: any) => { // Added type
                this.toastService.show('Supporter account created successfully!');
                this.submitting.set(false);
                this.closeModal();
                this.loadUsers(); // Refresh list
            },
            error: (err: any) => { // Added type
                console.error('Registration failed', err);
                this.toastService.show(err.error?.message || 'Failed to create account');
                this.submitting.set(false);
            }
        });
    }
}
