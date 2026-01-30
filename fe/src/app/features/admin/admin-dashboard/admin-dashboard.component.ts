import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar.component';
import { HeaderComponent } from './components/header.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    RouterOutlet
  ],

  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent {

}
