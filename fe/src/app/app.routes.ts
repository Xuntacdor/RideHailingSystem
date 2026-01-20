import { Routes } from '@angular/router';
import { DriverComponent } from '../driver/driver.component';
import { DriverProfileComponent } from '../driver/driver-profile.component';

import { Login } from './pages/auth/login/login';
import { Welcome } from './pages/welcome/welcome';
import { Register } from './pages/auth/register/register';
import { Profile } from './pages/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { userBooking } from './pages/userBooking/userBooking';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'welcome', component: Welcome },
  { path: 'register', component: Register, canActivate: [publicGuard] },

  { path: 'driver', component: DriverComponent },
  { path: 'driver-profile', component: DriverProfileComponent },

  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'userBooking', component: userBooking },

  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' },
];
