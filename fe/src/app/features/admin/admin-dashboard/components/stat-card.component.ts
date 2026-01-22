import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="bg-white rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-4">
        <div class="p-3 rounded-xl bg-gray-50">
          <lucide-icon [name]="icon()" [size]="24" class="text-gray-700"></lucide-icon>
        </div>
        <div class="flex items-center gap-1 text-sm">
          <lucide-icon 
            [name]="changePercentage() >= 0 ? 'trending-up' : 'trending-down'" 
            [size]="16" 
            [class]="changePercentage() >= 0 ? 'text-green-500' : 'text-red-500'"
          ></lucide-icon>
          <span [class]="changePercentage() >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ changePercentage() >= 0 ? '+' : '' }}{{ changePercentage() }}%
          </span>
        </div>
      </div>
      <div class="space-y-1">
        <p class="text-gray-500 text-sm">{{ title() }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value() }}</p>
        @if (subtitle()) {
          <p class="text-xs text-gray-400">{{ subtitle() }}</p>
        }
      </div>
    </div>
  `,
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string>();
  changePercentage = input.required<number>();
  icon = input.required<string>();
  subtitle = input<string>('');
}
