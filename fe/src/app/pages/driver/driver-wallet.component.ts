import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-driver-wallet',
  imports: [CommonModule],
  templateUrl: './driver-wallet.component.html',
  styleUrls: ['./driver-wallet.component.css']
})
export class DriverWalletComponent {
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
}
