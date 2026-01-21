import { Routes } from '@angular/router';
import { DriverComponent } from '../driver/driver.component';
import { DriverProfileComponent } from '../driver/driver-profile.component';

import { Login } from './features/auth/login/login';
import { Welcome } from './features/welcome/welcome';
import { Register } from './features/auth/register/register';
import { Profile } from './features/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { AddressSaved } from './features/profile/address-saved/address-saved';
import { PaymentMethods } from './features/profile/payment-methods/payment-methods';
import { ProfileEdit } from './features/profile/profile-edit/profile-edit';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'welcome', component: Welcome },
  { path: 'register', component: Register, canActivate: [publicGuard] },

  { path: 'driver', component: DriverComponent },
  { path: 'driver-profile', component: DriverProfileComponent },

  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },

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
