import { Routes } from '@angular/router';
import { DriverComponent } from './driver/driver.component';
import { DriverProfileComponent } from './driver/driver-profile.component';
import { DriverWalletComponent } from './driver/driver-wallet.component';

export const routes: Routes = [
  { path: '', redirectTo: 'driver', pathMatch: 'full' },

  { path: 'driver', component: DriverComponent },
  { path: 'driver-profile', component: DriverProfileComponent },
  { path: 'driver-wallet', component: DriverWalletComponent }
];

