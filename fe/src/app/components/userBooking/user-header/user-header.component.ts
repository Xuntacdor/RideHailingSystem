import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center p-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-100 transition-all duration-500 ease-in-out">
      
      <div class="flex items-center">
        <button 
          type="button"
          (click)="onAvatarClick()"
          class="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-sm active:scale-95 transition-transform cursor-pointer focus:outline-none">
          {{ getInitials() }}
        </button>

        <div 
          [class.max-w-0]="!isExpanded"
          [class.max-w-[200px]]="isExpanded"
          [class.opacity-0]="!isExpanded"
          [class.ml-0]="!isExpanded"
          [class.ml-3]="isExpanded"
          [class.mr-4]="isExpanded"
          class="transition-all duration-700 ease-in-out overflow-hidden whitespace-nowrap"
        >
          <div class="text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <span>👋</span>
            <span>{{ greeting }}</span>
          </div>
          <div class="font-bold text-gray-900 text-sm leading-tight">{{ userName }}</div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: inline-block; /* Quan trọng: để component không chiếm hết chiều ngang */
      margin-top: max(50px, env(safe-area-inset-top)); /* Khoảng cách với mép màn hình */
      margin-left: 16px;
      margin-right: 16px;
    }
  `]
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  @Input() userName: string = '';
  @Output() gridToggle = new EventEmitter<void>();
  @Output() avatarClick = new EventEmitter<void>();

  isExpanded: boolean = true;
  private collapseTimer?: number;

  ngOnInit() {
    this.scheduleCollapse(3000);
  }

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

  onAvatarClick(): void {
    this.clearCollapseTimer();
    if (!this.isExpanded) {
      this.isExpanded = true;
      this.scheduleCollapse(3000);
    }

    console.log('Avatar clicked!');
    this.avatarClick.emit();
  }

  private scheduleCollapse(delay: number): void {
    this.clearCollapseTimer();
    this.collapseTimer = window.setTimeout(() => {
      this.isExpanded = false;
    }, delay);
  }

  private clearCollapseTimer(): void {
    if (this.collapseTimer) {
      clearTimeout(this.collapseTimer);
      this.collapseTimer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearCollapseTimer();
  }
}
