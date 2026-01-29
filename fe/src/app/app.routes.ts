import { Routes } from '@angular/router';
import { DriverComponent } from './features/driver/driver.component';
import { DriverProfileComponent } from './features/driver/driver-profile.component';
import { DriverWalletComponent } from './features/driver/driver-wallet.component';
import { DriverVehicleComponent } from './features/driver/driver-vehicle.component';
import { Login } from './features/auth/login/login.component';
import { Welcome } from './features/welcome/welcome.component';
import { Register } from './features/auth/register/register.component';
import { Profile } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { UserBookingComponent } from './features/userBooking/userBooking';
import { AddressSaved } from './features/profile/address-saved/address-saved.component';
import { PaymentMethods } from './features/profile/payment-methods/payment-methods.component';
import { ProfileEdit } from './features/profile/profile-edit/profile-edit.component';
import { TravelHistoryComponent } from './features/profile/travel-history/travel-history.component';
import { PrivacyPolicyComponent } from './features/profile/privacy-policy/privacy-policy.component';
import { ReportIssueComponent } from './features/report-issue/report-issue.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
export const routes: Routes = [
  // { path: '', redirectTo: 'driver', pathMatch: 'full' },

  { path: 'driver', component: DriverComponent },
  // { path: 'driver/active-ride', component: DriverActiveRideComponent },
  { path: 'driver-profile', component: DriverProfileComponent },
  { path: 'driver-wallet', component: DriverWalletComponent },
  { path: 'driver-vehicle', component: DriverVehicleComponent },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      { path: '', loadComponent: () => import('./features/admin/admin-home/admin-home.component').then(m => m.AdminHomeComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent) }
    ]
  },

  { path: 'login', component: Login },
  { path: 'welcome', component: Welcome },
  { path: 'register', component: Register },

  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'userBooking', component: UserBookingComponent },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },

  {
    path: 'profile/edit',
    component: ProfileEdit,
    canActivate: [authGuard],
  },
  {
    path: 'profile/addresses',
    component: AddressSaved,
    canActivate: [authGuard],
  },
  {
    path: 'profile/payment',
    component: PaymentMethods,
    canActivate: [authGuard],
  },
  {
    path: 'profile/travel-history',
    component: TravelHistoryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile/privacy-policy',
    component: PrivacyPolicyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'report-issue',
    component: ReportIssueComponent,
    canActivate: [authGuard],
  },

  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' },
];
