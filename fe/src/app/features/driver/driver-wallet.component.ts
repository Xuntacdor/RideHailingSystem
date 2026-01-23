import { Component } from '@angular/core';
import { CommonModule,Location } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-driver-wallet',
  imports: [CommonModule],
  templateUrl: './driver-wallet.component.html',
  styleUrls: ['./driver-wallet.component.css']
})
export class DriverWalletComponent {

  constructor(private location: Location) {}

  balance = 1250;

  transactions = [
    {
      trip: 'Chuyến đi #1234',
      date: '18/01/2026',
      amount: 250
    },
    {
      trip: 'Chuyến đi #1233',
      date: '17/01/2026',
      amount: 180
    }
  ];

  goBack() {
    this.location.back();
  }
}
