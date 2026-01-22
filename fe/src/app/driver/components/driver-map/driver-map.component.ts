import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Map, Marker, GeolocateControl, LngLatBounds } from 'trackasia-gl';
import { TrackAsiaService } from '../../../core/services/trackasia.service';
import { ActiveRide, NavigationInfo } from '../../models/active-ride.model';

@Component({
    selector: 'app-driver-map',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #mapContainer class="w-full h-full"></div>
    
    <!-- Navigation Info Overlay -->
    <div *ngIf="activeRide && navigationInfo" 
         class="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-[400px]">
      <div class="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <div class="flex justify-between items-center mb-3">
          <h3 class="m-0 text-lg font-semibold text-gray-900">
            {{ navigationState === 'TO_PICKUP' ? '🚗 Đến điểm đón' : '🎯 Đến đích' }}
          </h3>
          <span class="text-xl font-bold text-green-500">{{ formatDuration(navigationInfo.duration) }}</span>
        </div>
        <div class="border-t border-gray-200 pt-3">
          <p class="text-base font-medium text-gray-600 mb-2">{{ formatDistance(navigationInfo.distance) }}</p>
          <p class="text-sm text-gray-500 m-0">{{ navigationInfo.instruction }}</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }
  `]
})
export class DriverMapComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    @Input() activeRide: ActiveRide | null = null;
    @Input() navigationState: 'TO_PICKUP' | 'TO_DESTINATION' | null = null;

    @Output() positionUpdate = new EventEmitter<{ lat: number, lng: number }>();
    @Output() arrivedAtPickup = new EventEmitter<void>();
    @Output() arrivedAtDestination = new EventEmitter<void>();

    map: Map | undefined;
    navigationInfo: NavigationInfo | null = null;

    private currentPositionMarker: Marker | null = null;
    private pickupMarker: Marker | null = null;
    private destinationMarker: Marker | null = null;
    private watchId: number | null = null;
    private currentPosition: { lat: number, lng: number } | null = null;

    constructor(private trackAsiaService: TrackAsiaService) { }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initializeMap();
        }, 100);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['activeRide'] && this.activeRide && this.map) {
            this.updateMapForActiveRide();
        }

        if (changes['navigationState'] && this.navigationState && this.map) {
            this.updateRouteForNavigationState();
        }
    }

    private initializeMap(): void {
        if (!this.mapContainer?.nativeElement) {
            console.error('Map container not found');
            return;
        }

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                this.createMap();
                this.startGPSTracking();
            },
            (error) => {
                console.warn('Geolocation error:', error);
                // Default to Da Nang
                this.currentPosition = { lat: 16.0544, lng: 108.2022 };
                this.createMap();
                this.startGPSTracking();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }

    private createMap(): void {
        if (!this.currentPosition) return;

        try {
            const geolocateControl = new GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserLocation: false // We'll use custom marker
            });

            this.map = new Map({
                container: this.mapContainer.nativeElement,
                style: this.trackAsiaService.getStyleUrl('streets'),
                center: [this.currentPosition.lng, this.currentPosition.lat],
                zoom: 15,
                pitch: 0,
                bearing: 0,
                attributionControl: false
            });

            this.map.addControl(geolocateControl, 'top-right');

            this.map.on('load', () => {
                console.log('Driver map loaded');

                // Add current position marker
                this.updateCurrentPositionMarker(this.currentPosition!.lng, this.currentPosition!.lat);

                // If we have active ride, show route
                if (this.activeRide) {
                    this.updateMapForActiveRide();
                }
            });

        } catch (error) {
            console.error('Failed to initialize map:', error);
        }
    }

    private startGPSTracking(): void {
        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    this.currentPosition = newPosition;
                    this.updateCurrentPositionMarker(newPosition.lng, newPosition.lat);
                    this.positionUpdate.emit(newPosition);

                    // Check if arrived at destination
                    if (this.activeRide) {
                        this.checkArrival();
                    }
                },
                (error) => {
                    console.error('GPS tracking error:', error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 1000,
                    timeout: 5000
                }
            );
        }
    }

    private updateCurrentPositionMarker(lng: number, lat: number): void {
        if (!this.map) return;

        if (this.currentPositionMarker) {
            this.currentPositionMarker.setLngLat([lng, lat]);
        } else {
            const el = document.createElement('div');
            el.innerHTML = '🚗';
            el.style.fontSize = '32px';

            this.currentPositionMarker = new Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(this.map);
        }
    }

    private updateMapForActiveRide(): void {
        if (!this.activeRide || !this.map || !this.currentPosition) return;

        // Add pickup marker
        this.addPickupMarker(this.activeRide.pickupLng, this.activeRide.pickupLat);

        // Show destination marker if available
        if (this.activeRide.destinationLat && this.activeRide.destinationLng) {
            this.addDestinationMarker(this.activeRide.destinationLng, this.activeRide.destinationLat);
        }

        // Calculate and display route based on navigation state
        this.updateRouteForNavigationState();
    }

    private async updateRouteForNavigationState(): Promise<void> {
        if (!this.activeRide || !this.currentPosition || !this.map) return;

        let targetLng: number;
        let targetLat: number;

        if (this.navigationState === 'TO_PICKUP') {
            targetLng = this.activeRide.pickupLng;
            targetLat = this.activeRide.pickupLat;
        } else if (this.navigationState === 'TO_DESTINATION' &&
            this.activeRide.destinationLat &&
            this.activeRide.destinationLng) {
            targetLng = this.activeRide.destinationLng;
            targetLat = this.activeRide.destinationLat;
        } else {
            return;
        }

        try {
            const route = await this.trackAsiaService.getDirections(
                this.currentPosition.lng,
                this.currentPosition.lat,
                targetLng,
                targetLat
            );

            if (route) {
                this.displayRoute(route.geometry);
                this.navigationInfo = {
                    distance: route.distance,
                    duration: route.duration,
                    instruction: this.navigationState === 'TO_PICKUP'
                        ? 'Đang đến đón khách'
                        : 'Đang đến đích'
                };
                this.fitMapToRoute(route.geometry);
            }
        } catch (error) {
            console.error('Error getting route:', error);
        }
    }

    private addPickupMarker(lng: number, lat: number): void {
        if (!this.map) return;

        if (this.pickupMarker) {
            this.pickupMarker.remove();
        }

        const el = document.createElement('div');
        el.innerHTML = '📍';
        el.style.fontSize = '32px';

        this.pickupMarker = new Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(this.map);
    }

    private addDestinationMarker(lng: number, lat: number): void {
        if (!this.map) return;

        if (this.destinationMarker) {
            this.destinationMarker.remove();
        }

        const el = document.createElement('div');
        el.innerHTML = '🎯';
        el.style.fontSize = '32px';

        this.destinationMarker = new Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(this.map);
    }

    private displayRoute(geometry: any): void {
        if (!this.map || !geometry) return;

        const sourceId = 'driver-route';
        const layerId = 'driver-route-layer';

        if (this.map.getSource(sourceId)) {
            (this.map.getSource(sourceId) as any).setData(geometry);
        } else {
            this.map.addSource(sourceId, {
                type: 'geojson',
                data: geometry
            });

            this.map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 6,
                    'line-opacity': 0.8
                }
            });
        }
    }

    private fitMapToRoute(geometry: any): void {
        if (!this.map || !geometry) return;

        const coordinates = geometry.coordinates;
        const bounds = new LngLatBounds();

        coordinates.forEach((coord: number[]) => {
            bounds.extend(coord as [number, number]);
        });

        this.map.fitBounds(bounds, {
            padding: { top: 100, bottom: 300, left: 50, right: 50 },
            maxZoom: 16
        });
    }

    private checkArrival(): void {
        if (!this.currentPosition || !this.activeRide) return;

        const ARRIVAL_THRESHOLD = 50; // 50 meters

        if (this.navigationState === 'TO_PICKUP') {
            const distance = this.calculateDistance(
                this.currentPosition.lat,
                this.currentPosition.lng,
                this.activeRide.pickupLat,
                this.activeRide.pickupLng
            );

            if (distance < ARRIVAL_THRESHOLD) {
                this.arrivedAtPickup.emit();
            }
        } else if (this.navigationState === 'TO_DESTINATION' &&
            this.activeRide.destinationLat &&
            this.activeRide.destinationLng) {
            const distance = this.calculateDistance(
                this.currentPosition.lat,
                this.currentPosition.lng,
                this.activeRide.destinationLat,
                this.activeRide.destinationLng
            );

            if (distance < ARRIVAL_THRESHOLD) {
                this.arrivedAtDestination.emit();
            }
        }
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    formatDistance(meters: number): string {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    }

    formatDuration(seconds: number): string {
        const minutes = Math.ceil(seconds / 60);
        if (minutes < 60) {
            return `${minutes} phút`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}p`;
    }

    ngOnDestroy(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
        }

        this.currentPositionMarker?.remove();
        this.pickupMarker?.remove();
        this.destinationMarker?.remove();
        this.map?.remove();
    }
}
