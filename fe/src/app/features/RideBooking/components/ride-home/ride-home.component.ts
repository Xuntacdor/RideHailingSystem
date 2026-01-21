import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleType, Location, Vehicle, VehicleOption } from '../../models';
import { VehicleService } from '../../services/vehicle.service';
import { GeolocationService } from '../../services/geolocation.service';
import { TrackAsiaService } from '../../services/trackasia.service';
import { Subject, takeUntil } from 'rxjs';

declare var maplibregl: any;

@Component({
    selector: 'app-ride-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ride-home.component.html',
    styleUrls: ['./ride-home.component.css']
})
export class RideHomeComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private map: any;
    private markers: Map<string, any> = new Map();
    private userMarker: any;

    userName = 'Shahid';
    userLocation: Location | null = null;
    currentAddress = 'Queens, NY 113';
    selectedVehicleType: VehicleType = VehicleType.CAR;

    vehicleOptions: VehicleOption[] = [
        {
            type: VehicleType.CAR,
            name: 'Cars',
            description: 'Ride with favorite car',
            icon: '🚗'
        },
        {
            type: VehicleType.SCOOTER,
            name: 'Scooters',
            description: 'Ride with favorite scooter',
            icon: '🛵'
        }
    ];

    vehicles: Vehicle[] = [];

    VehicleType = VehicleType;

    constructor(
        private vehicleService: VehicleService,
        private geolocationService: GeolocationService,
        private trackAsiaService: TrackAsiaService
    ) { }

    ngOnInit(): void {
        this.initializeLocation();
        this.subscribeToVehicles();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.geolocationService.stopWatchingLocation();
    }

    private initializeLocation(): void {
        this.geolocationService.getCurrentLocation()
            .pipe(takeUntil(this.destroy$))
            .subscribe(async location => {
                if (location) {
                    this.userLocation = location;
                    await this.updateAddressFromLocation(location);
                    this.initializeMap(location);
                    this.vehicleService.getVehiclesNearLocation(location).subscribe();
                }
            });

        this.geolocationService.startWatchingLocation();
    }

    private async updateAddressFromLocation(location: Location): Promise<void> {
        const address = await this.trackAsiaService.reverseGeocode(location.lng, location.lat);
        this.currentAddress = address;
    }

    private subscribeToVehicles(): void {
        this.vehicleService.vehicles$
            .pipe(takeUntil(this.destroy$))
            .subscribe(vehicles => {
                this.vehicles = vehicles;
                this.updateVehicleMarkers(vehicles);
            });

        this.vehicleService.startVehicleTracking();
    }

    private initializeMap(center: Location): void {
        if (this.map) return;

        this.map = new maplibregl.Map({
            container: 'map',
            style: this.trackAsiaService.getStyleUrl('streets'),
            center: [center.lng, center.lat],
            zoom: 14,
            attributionControl: false
        });

        this.map.on('load', () => {
            this.addUserMarker(center);
        });
    }

    private addUserMarker(location: Location): void {
        if (this.userMarker) {
            this.userMarker.setLngLat([location.lng, location.lat]);
        } else {
            const el = document.createElement('div');
            el.className = 'user-marker';
            el.innerHTML = `
                <div class="user-marker-pulse"></div>
                <div class="user-marker-dot"></div>
            `;

            this.userMarker = new maplibregl.Marker({ element: el })
                .setLngLat([location.lng, location.lat])
                .addTo(this.map);
        }
    }

    private updateVehicleMarkers(vehicles: Vehicle[]): void {
        if (!this.map) return;

        // Remove markers for vehicles that no longer exist
        this.markers.forEach((marker, id) => {
            if (!vehicles.find(v => v.id === id)) {
                marker.remove();
                this.markers.delete(id);
            }
        });

        // Add or update markers for current vehicles
        vehicles.forEach(vehicle => {
            if (this.markers.has(vehicle.id)) {
                // Update existing marker
                const marker = this.markers.get(vehicle.id);
                marker.setLngLat([vehicle.location.lng, vehicle.location.lat]);
            } else {
                // Create new marker
                const el = document.createElement('div');
                el.className = `vehicle-marker vehicle-${vehicle.type.toLowerCase()} ${vehicle.available ? 'available' : 'unavailable'}`;
                el.innerHTML = this.getVehicleIcon(vehicle.type);

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([vehicle.location.lng, vehicle.location.lat])
                    .addTo(this.map);

                this.markers.set(vehicle.id, marker);
            }
        });
    }

    private getVehicleIcon(type: VehicleType): string {
        const icons = {
            [VehicleType.CAR]: '🚗',
            [VehicleType.SCOOTER]: '🛵',
            [VehicleType.BIKE]: '🚲'
        };
        return `<div class="vehicle-icon">${icons[type]}</div>`;
    }

    selectVehicleType(type: VehicleType): void {
        this.selectedVehicleType = type;
    }

    onSearchClick(): void {
        // Navigate to search/destination selection
        console.log('Navigate to destination selection');
    }
}
