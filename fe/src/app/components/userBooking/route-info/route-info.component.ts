import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteInfo } from '../../../models/models';

@Component({
  selector: 'app-route-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (routeInfo) {
      <div class="mx-5 mb-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <span class="text-sm font-bold text-gray-700">{{ routeInfo.distance.toFixed(1) }}</span>
            <span class="text-xs text-gray-500">km</span>
          </div>
          <div class="w-px h-4 bg-gray-300"></div>
          <div class="flex items-center gap-1">
            <span class="text-sm font-bold text-gray-700">{{ Math.round(routeInfo.duration) }}</span>
            <span class="text-xs text-gray-500">min</span>
          </div>
        </div>
        <button
          (click)="onClearRoute()"
          class="px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
          Clear
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RouteInfoComponent {
  @Input() routeInfo: RouteInfo | null = null;
  @Output() clearRoute = new EventEmitter<void>();

  showSteps = false;
  Math = Math;

  toggleSteps(): void {
    this.showSteps = !this.showSteps;
  }

  onClearRoute(): void {
    this.clearRoute.emit();
  }
}
