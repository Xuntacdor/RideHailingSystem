import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-5 py-4 bg-white z-0 ">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {{ getInitials() }}
        </div>
        <div>
          <div class="text-sm text-gray-600 flex items-center gap-1">
            <span>👋</span>
            <span>{{ greeting }}</span>
          </div>
          <div class="font-bold text-gray-900">{{ userName }}</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserHeaderComponent {
  @Input() userName: string = '';
  @Output() gridToggle = new EventEmitter<void>();

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Hello there';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getInitials(): string {
    return this.userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onGridToggle(): void {
    this.gridToggle.emit();
  }
}
