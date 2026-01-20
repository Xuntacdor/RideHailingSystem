import { Routes } from '@angular/router';
import { DriverComponent } from '../driver/driver.component';
import { DriverProfileComponent } from '../driver/driver-profile.component';

export const routes: Routes = [
  { path: '', component: DriverComponent },
  { path: 'driver', component: DriverComponent },
  { path: 'driver-profile', component: DriverProfileComponent },
  { path: '', redirectTo: 'driver', pathMatch: 'full' }
];
