import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchResult } from '../../../models/models';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-5 pb-4">
      <!-- Destination Input -->
      <div class="relative group">

        <input
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          (keypress)="onKeyPress($event)"
          (focus)="onDestinationFocus()"
          (blur)="onBlur()"
          [placeholder]="placeholder"
      class="w-full pl-5 pr-24 h-14 bg-gray-50 border border-gray-100 rounded-2xl 
            text-gray-900 placeholder-gray-400 font-medium
            focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
            shadow-sm hover:shadow-md focus:shadow-lg
            transition-all duration-300 text-lg"

        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          @if (searchQuery) {
            <button
              (click)="clearSearch()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              title="Clear">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          }
          
          <button
            type="button"
            (click)="submitSearch()"
            class="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            title="Search Route">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Suggestions Dropdown -->
      @if (isFocused && (showSavedLocations || (showSuggestions && suggestions.length > 0))) {
        <div class="mt-4 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-80 overflow-y-auto transform origin-top animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Saved/Recent Locations -->
          @if (showSavedLocations && savedLocations.length > 0) {
            <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Locations</div>
            @for (location of savedLocations; track location.place_id || $index) {
              <button
                (mousedown)="selectSuggestion(location)"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-4 group">
                <div class="p-2 bg-gray-100 rounded-full text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  @if (location.type === 'home') {
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                  } @else if (location.type === 'airport') {
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate">{{ location.name }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ location.address }}</div>
                </div>
              </button>
            }
          }

          <!-- Search Results -->
          @if (!showSavedLocations && suggestions.length > 0) {
            @for (suggestion of suggestions; track suggestion.place_id || $index) {
              <button
                (mousedown)="selectSuggestion(suggestion)"
                class="w-full px-4 py-3.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-all flex items-start gap-3 group">
                <div class="mt-1 p-1.5 bg-gray-100 rounded-full text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-base font-medium text-gray-900 group-hover:text-blue-700">{{ suggestion.display }}</div>
                </div>
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LocationSearchComponent {
  @Input() placeholder: string = 'Where are you going?';
  @Input() suggestions: SearchResult[] = [];
  @Input() showSuggestions: boolean = false;

  @Input() savedLocations: Array<{
    place_id?: string;
    name: string;
    address: string;
    type?: 'home' | 'work' | 'airport' | 'recent';
    lng: number;
    lat: number;
  }> = [];

  @Output() searchChanged = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<SearchResult>();
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() clearRoute = new EventEmitter<void>();

  searchQuery: string = '';
  isFocused: boolean = false;

  get showSavedLocations(): boolean {
    return this.isFocused &&
      this.searchQuery.trim().length === 0 &&
      this.savedLocations.length > 0;
  }

  onDestinationFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    // Delay to allow click on suggestion
    setTimeout(() => {
      this.isFocused = false;
    }, 200);
  }

  onSearchChange(): void {
    this.searchChanged.emit(this.searchQuery);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchSubmitted.emit(this.searchQuery);
    }
  }

  selectSuggestion(suggestion: any): void {
    this.searchQuery = suggestion.display || suggestion.name;
    this.suggestionSelected.emit(suggestion);
    this.isFocused = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchChanged.emit('');
    this.clearRoute.emit();
  }

  submitSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchSubmitted.emit(this.searchQuery);
    }
  }
}
