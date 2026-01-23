import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service'; // Chỉnh lại đường dẫn import cho đúng với project của bạn
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-20px) scale(0.9)', opacity: 0 }),
        animate(
          '350ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ transform: 'translateY(0) scale(1)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px) scale(0.9)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
