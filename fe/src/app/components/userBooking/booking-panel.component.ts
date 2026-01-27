
import { LocationSearchComponent } from "./location-search/location-search.component";
import { RouteInfoComponent } from "./route-info/route-info.component";
import { VehicleSelectionComponent } from "./vehicle-selection/vehicle-selection.component";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouteInfo, SearchResult, VehicleType } from "../../models/models";
import { BookingTypeResponse } from "../../core/services/booking-type.service";

@Component({
    selector: 'app-booking-panel',
    standalone: true,
    imports: [
        CommonModule,
        LocationSearchComponent,
        RouteInfoComponent,
        VehicleSelectionComponent
    ],
    template: `
    <div class="absolute bottom-0 left-0 right-0 z-30 p-4 pt-2">
      <div class="bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col gap-1">
        <app-location-search 
          placeholder="Where are you going?" 
          [suggestions]="searchSuggestions"
          [showSuggestions]="showSearchSuggestions" 
          (searchChanged)="searchChanged.emit($event)"
          (suggestionSelected)="suggestionSelected.emit($event)" 
          (searchSubmitted)="searchSubmitted.emit($event)"
          class="w-full pt-5">
        </app-location-search>

        @if (routeInfo) {
          <app-route-info 
            [routeInfo]="routeInfo" 
            (clearRoute)="clearRoute.emit()">
          </app-route-info>

          <app-vehicle-selection 
            [selectedVehicle]="selectedVehicle" 
            [routeInfo]="routeInfo" 
            [bookingTypes]="bookingTypes"
            [isLoading]="isBookingInProgress"
            (vehicleSelected)="vehicleSelected.emit($event)" 
            (bookRideClicked)="bookRide.emit($event)" 
            class="px-6 pb-6">
          </app-vehicle-selection>
        }
      </div>
    </div>
  `
})
export class BookingPanelComponent {
    @Input() searchSuggestions: SearchResult[] = [];
    @Input() showSearchSuggestions = false;
    @Input() routeInfo: RouteInfo | null = null;
    @Input() selectedVehicle!: VehicleType;
    @Input() bookingTypes: BookingTypeResponse[] = [];
    @Input() isBookingInProgress = false;

    @Output() searchChanged = new EventEmitter<string>();
    @Output() suggestionSelected = new EventEmitter<SearchResult>();
    @Output() searchSubmitted = new EventEmitter<string>();
    @Output() clearRoute = new EventEmitter<void>();
    @Output() vehicleSelected = new EventEmitter<VehicleType>();
    @Output() bookRide = new EventEmitter<VehicleType>();
}
