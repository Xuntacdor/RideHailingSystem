import { Routes } from '@angular/router';
import { DriverComponent } from '../driver/driver.component';
import { DriverProfileComponent } from '../driver/driver-profile.component';

import { Login } from './pages/auth/login/login';
import { Welcome } from './pages/welcome/welcome';
import { Register } from './pages/auth/register/register';
import { Profile } from './pages/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { AddressSaved } from './pages/profile/address-saved/address-saved';
import { PaymentMethods } from './pages/profile/payment-methods/payment-methods';
import { ProfileEdit } from './pages/profile/profile-edit/profile-edit';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'welcome', component: Welcome },
  { path: 'register', component: Register, canActivate: [publicGuard] },

  { path: 'driver', component: DriverComponent },
  { path: 'driver-profile', component: DriverProfileComponent },

  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard] // Đảm bảo đã login mới vào được
  },

  // Các Route con (Child Routes hoặc Sibling Routes)
  // Cách 1: Route ngang hàng (dễ làm nhất cho UI mobile app)
  {
    path: 'profile/edit',
    component: ProfileEdit,
    canActivate: [authGuard]
  },
  {
    path: 'profile/addresses',
    component: AddressSaved,
    canActivate: [authGuard]
  },
  {
    path: 'profile/payment',
    component: PaymentMethods,
    canActivate: [authGuard]
  },

  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' },
];
