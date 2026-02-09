import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges, DoCheck, IterableDiffer, IterableDiffers, ChangeDetectorRef } from '@angular/core';
import { Map as TrackAsiaMap, Marker, NavigationControl, GeolocateControl, Popup, LngLatBounds } from 'trackasia-gl';
import { TrackAsiaService } from '../../../core/services/trackasia.service';
import { Coordinate, Driver } from '../../../models/models';

@Component({
    selector: 'app-map',
    standalone: true,
    template: `<div #mapContainer class="w-full h-full"></div>`,
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
      ::ng-deep .maplibregl-marker {
      position: absolute !important;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    @Input() origin: Coordinate | null = null;
    @Input() destination: Coordinate | null = null;
    @Input() drivers: Driver[] = [];
    @Input() routeGeometry: any = null;
    @Input() isSettingOrigin = false;
    @Input() isSettingDestination = false;
    @Input() activeDriver: Driver | null = null;
    @Input() driverRoute: any = null;
    @Input() userLocation: Coordinate | null = null;
    @Input() showUserMarker = false;

    @Output() userLocationDetected = new EventEmitter<{ lng: number; lat: number }>();
    @Output() mapReady = new EventEmitter<void>();
    @Output() tokenInvalid = new EventEmitter<void>();
    @Output() boundsChange = new EventEmitter<LngLatBounds>();
    @Output() mapMove = new EventEmitter<{
        center: { lat: number; lng: number };
        zoom: number;
        bounds: { north: number; south: number; east: number; west: number };
    }>();
    @Output() driverClick = new EventEmitter<Driver>();

    map: TrackAsiaMap | undefined;
    private originMarker: Marker | null = null;
    private driversDiffer: IterableDiffer<Driver> | null = null;
    private destinationMarker: Marker | null = null;
    private userMarker: Marker | null = null;
    private driverMarkers: { [driverId: string]: Marker } = {};
    private activeDriverMarker: Marker | null = null;
    private geolocateControl: GeolocateControl | null = null;
    private animationDuration = 1000;
    private markerAnimations = new Map<Marker, number>();

    private userInteracted = false;
    private interactionTimeout: any;

    constructor(
        private trackAsiaService: TrackAsiaService,
        private differs: IterableDiffers,
        private cdr: ChangeDetectorRef
    ) { }
    // private userLocation: { lng: number; lat: number } | null = null; // Removed duplicate

    private animateMarkerTo(marker: Marker, targetLng: number, targetLat: number, duration: number = this.animationDuration): void {
        if (this.markerAnimations.has(marker)) {
            cancelAnimationFrame(this.markerAnimations.get(marker)!);
            this.markerAnimations.delete(marker);
        }

        const startPos = marker.getLngLat();
        const startLng = startPos.lng;
        const startLat = startPos.lat;

        const threshold = 0.000001; // ~0.1 meter
        if (Math.abs(targetLng - startLng) < threshold && Math.abs(targetLat - startLat) < threshold) {
            return;
        }

        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentLng = startLng + (targetLng - startLng) * easeProgress;
            const currentLat = startLat + (targetLat - startLat) * easeProgress;

            marker.setLngLat([currentLng, currentLat]);

            if (progress < 1) {
                this.markerAnimations.set(marker, requestAnimationFrame(animate));
            } else {
                this.markerAnimations.delete(marker);
            }
        };

        this.markerAnimations.set(marker, requestAnimationFrame(animate));
    }


    ngAfterViewInit(): void {
        setTimeout(() => {
            if (typeof window !== 'undefined' && this.mapContainer) {

                this.getUserLocationThenInitMap();
            }
        }, 100);
    }

    ngDoCheck(): void {
        if (this.driversDiffer && this.drivers && this.map) {
            const changes = this.driversDiffer.diff(this.drivers);
            if (changes) {
                console.log('✅ Drivers changed detected by ngDoCheck');
                this.updateDriverMarkers();
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['origin'] && this.origin && this.map) {
            const prev = changes['origin'].previousValue;
            const curr = changes['origin'].currentValue;

            if (!prev || prev.lng !== curr.lng || prev.lat !== curr.lat) {
                this.placeOriginMarker(curr.lng, curr.lat, curr.name || 'Origin');
            }
        }

        if (changes['destination'] && this.destination && this.map) {
            const prev = changes['destination'].previousValue;
            const curr = changes['destination'].currentValue;

            if (!prev || prev.lng !== curr.lng || prev.lat !== curr.lat) {
                this.placeDestinationMarker(curr.lng, curr.lat, curr.name || 'Destination');
            }
        }

        if (changes['drivers'] && this.drivers && this.map) {
            const prev = changes['drivers'].previousValue as Driver[] | undefined;
            const curr = changes['drivers'].currentValue as Driver[];

            const hasPositionChange = !prev || prev.length !== curr.length ||
                curr.some((driver, index) => {
                    const prevDriver = prev.find(d => d.id === driver.id);
                    return !prevDriver ||
                        prevDriver.lng !== driver.lng ||
                        prevDriver.lat !== driver.lat;
                });

            if (hasPositionChange) {
                this.updateDriverMarkers();
            }
        }

        if (changes['drivers'] && this.drivers && !this.driversDiffer) {
            this.driversDiffer = this.differs.find(this.drivers).create((index, item) => item.id);
        }

        if (changes['routeGeometry'] && this.map) {
            if (this.routeGeometry) {
                this.displayRoute(this.routeGeometry);
            } else {
                this.clearRoute();
            }
        }

        if (changes['activeDriver'] && this.map) {
            console.log('🗺️ [MAP] activeDriver changed:', {
                hasActiveDriver: !!this.activeDriver,
                position: this.activeDriver ? `${this.activeDriver.lat.toFixed(6)}, ${this.activeDriver.lng.toFixed(6)}` : 'null',
                icon: this.activeDriver?.icon,
                id: this.activeDriver?.id
            });

            if (this.activeDriver) {
                this.updateActiveDriverMarker(this.activeDriver);
            } else {
                this.removeActiveDriverMarker();
            }
        }

        if (changes['driverRoute'] && this.map) {
            if (this.driverRoute) {
                const isFirstLoad = !changes['driverRoute'].previousValue;
                const shouldFit = isFirstLoad && !this.userInteracted;
                this.displayDriverRoute(this.driverRoute, shouldFit);
            } else {
                this.clearDriverRoute();
            }
        }

        if (changes['isSettingOrigin'] || changes['isSettingDestination']) {
            this.updateCursor();
        }

        if (changes['showUserMarker'] || changes['userLocation']) {
            if (this.showUserMarker && this.userLocation) {
                this.updateUserMarker(this.userLocation);
            } else {
                this.removeUserMarker();
            }
        }
    }




    private resetInteractionTimeout(): void {
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
        }
        // Auto-reset after 30 seconds of inactivity
        this.interactionTimeout = setTimeout(() => {
            this.userInteracted = false;
        }, 30000);
    }

    private getUserLocationThenInitMap(): void {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {

                    this.userLocation = {
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    };
                    console.log('Got user location:', this.userLocation);

                    this.userLocationDetected.emit(this.userLocation);

                    this.initializeMap();
                },
                (error) => {
                    console.warn('Geolocation error:', error.message);
                    this.userLocation = { lng: 108.2022, lat: 16.0544 };
                    this.initializeMap();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.warn('Geolocation not supported');
            this.userLocation = { lng: 111.2022, lat: 16.0544 };
            this.initializeMap();
        }
    }

    private initializeMap(): void {
        if (!this.mapContainer?.nativeElement || !this.userLocation) {
            console.error('Map container or user location not found');
            return;
        }

        try {
            this.geolocateControl = new GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserLocation: true
            });

            this.map = new TrackAsiaMap({
                container: this.mapContainer.nativeElement,
                style: this.trackAsiaService.getStyleUrl('streets'),
                center: [this.userLocation.lng, this.userLocation.lat],
                zoom: 15,
                pitch: 0,
                bearing: 0,
                attributionControl: false,

            });

            // this.map.addControl(new NavigationControl(), 'top-right');
            this.map.addControl(this.geolocateControl, 'top-right');

            // Track user zoom
            this.map.on('zoomstart', (e) => {
                if (e.originalEvent) { // Only user-triggered events
                    this.userInteracted = true;
                    this.resetInteractionTimeout();
                }
            });

            // Track user pan/move
            this.map.on('movestart', (e) => {
                if (e.originalEvent) {
                    this.userInteracted = true;
                    this.resetInteractionTimeout();
                }
            });

            this.map.on('load', () => {
                console.log('Map loaded successfully at user location');
                this.mapReady.emit();
                this.geolocateControl!.trigger();

                if (this.origin) {
                    this.placeOriginMarker(this.origin.lng, this.origin.lat, this.origin.name || 'Origin');
                }
                if (this.destination) {
                    this.placeDestinationMarker(this.destination.lng, this.destination.lat, this.destination.name || 'Destination');
                }
                if (this.routeGeometry) {
                    this.displayRoute(this.routeGeometry);
                }
                if (this.activeDriver) {
                    this.updateActiveDriverMarker(this.activeDriver);
                }
                if (this.driverRoute) {
                    this.displayDriverRoute(this.driverRoute);
                }

                if (this.drivers.length > 0) {
                    this.updateDriverMarkers();
                }

                this.map!.on('moveend', () => {
                    if (this.map) {
                        this.boundsChange.emit(this.map.getBounds());
                        this.emitMapState();
                    }
                });

            });

            this.map.on('error', (e: any) => {
                console.error('Map error:', e);
                if (e.error?.message?.includes('401') || e.error?.message?.includes('403')) {
                    this.tokenInvalid.emit();
                }
            });

        } catch (error) {
            console.error('Failed to initialize map:', error);
            this.tokenInvalid.emit();
        }
    }

    private updateCursor(): void {
        if (this.map) {
            this.map.getCanvas().style.cursor = (this.isSettingOrigin || this.isSettingDestination) ? 'crosshair' : '';
        }
    }

    placeOriginMarker(lng: number, lat: number, label: string): void {
        if (this.originMarker) {
            this.animateMarkerTo(this.originMarker, lng, lat);
            this.originMarker.getPopup()?.setText(`📍 ${label}`);
        } else {
            // Tạo marker mới nếu chưa tồn tại
            // this.originMarker = new Marker({ color: '#00b14f', })
            //     .setLngLat([lng, lat])
            //     .setPopup(new Popup({ offset: 25 }).setText(`📍 ${label}`))
            //     .addTo(this.map!);
        }
    }

    placeDestinationMarker(lng: number, lat: number, label: string): void {
        if (this.destinationMarker) {
            this.animateMarkerTo(this.destinationMarker, lng, lat);
            this.destinationMarker.getPopup()?.setText(`🎯 ${label}`);
        } else {
            this.destinationMarker = new Marker({ color: '#dc2626' })
                .setLngLat([lng, lat])
                .setPopup(new Popup({ offset: 25 }).setText(`🎯 ${label}`))
                .addTo(this.map!);
        }
    }

    private emitMapState(): void {
        if (!this.map) return;
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        const bounds = this.map.getBounds();

        this.mapMove.emit({
            center: { lat: center.lat, lng: center.lng },
            zoom: zoom,
            bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            }
        });
    }

    private updateDriverMarkers(): void {
        const currentDriverIds = new Set(this.drivers.map(d => d.id));

        for (const driverId of Object.keys(this.driverMarkers)) {
            if (!currentDriverIds.has(driverId)) {
                this.driverMarkers[driverId].remove();
                delete this.driverMarkers[driverId];
            }
        }

        this.drivers.forEach(driver => {
            const existingMarker = this.driverMarkers[driver.id];

            if (existingMarker) {
                this.animateMarkerTo(existingMarker, driver.lng, driver.lat);
            } else {
                const el = document.createElement('div');
                el.className = 'driver-marker';
                el.innerHTML = driver.icon;
                el.style.fontSize = '24px';
                el.style.cursor = 'pointer';

                el.addEventListener('click', () => {
                    this.driverClick.emit(driver);
                });

                const marker = new Marker({ element: el })
                    .setLngLat([driver.lng, driver.lat])
                    .addTo(this.map!);

                this.driverMarkers[driver.id] = marker;
            }
        });
    }

    displayRoute(geometry: any): void {
        if (!this.map || !geometry) return;

        const sourceId = 'route';
        const layerId = 'route-layer';

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
                    'line-color': '#22c55e',
                    'line-width': 5,
                    'line-opacity': 0.8
                }
            });
        }
        const coordinates = geometry.coordinates;
        const bounds = new LngLatBounds();
        coordinates.forEach((coord: number[]) => {
            bounds.extend(coord as [number, number]);
        });
        this.map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 15
        });
    }

    clearRoute(): void {
        if (!this.map) return;

        const sourceId = 'route';
        const layerId = 'route-layer';

        if (this.map.getLayer(layerId)) {
            this.map.removeLayer(layerId);
        }

        if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId);
        }
    }

    removeRoute(): void {
        if (this.map?.getLayer('route')) {
            this.map.removeLayer('route');
        }

        if (this.map?.getSource('route')) {
            this.map.removeSource('route');
        }
    }

    private updateUserMarker(coords: Coordinate): void {
        if (!this.map) return;

        // Remove existing marker if it exists
        if (this.userMarker) {
            this.userMarker.remove();
        }

        const el = document.createElement('div');
        el.className = 'user-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.background = '#3b82f6'; // Blue for user
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

        this.userMarker = new Marker(el)
            .setLngLat([coords.lng, coords.lat])
            .addTo(this.map);
    }

    private removeUserMarker(): void {
        if (this.userMarker) {
            this.userMarker.remove();
            this.userMarker = null;
        }
    }

    flyTo(lng: number, lat: number, zoom: number = 15): void {
        this.map?.flyTo({ center: [lng, lat], zoom });
    }

    clearMarkers(): void {
        this.originMarker?.remove();
        this.destinationMarker?.remove();
        this.originMarker = null;
        this.destinationMarker = null;
    }

    private updateActiveDriverMarker(driver: Driver): void {
        const timestamp = new Date().toLocaleTimeString();

        if (this.activeDriverMarker) {
            console.log(`[${timestamp}] 🚗 [MAP] Animating driver marker to:`, {
                from: this.activeDriverMarker.getLngLat(),
                to: `${driver.lat.toFixed(6)}, ${driver.lng.toFixed(6)}`,
                icon: driver.icon
            });
            this.animateMarkerTo(this.activeDriverMarker, driver.lng, driver.lat);
            this.cdr.detectChanges();
        } else {
            console.log(`[${timestamp}] 🆕 [MAP] Creating new driver marker at:`, {
                position: `${driver.lat.toFixed(6)}, ${driver.lng.toFixed(6)}`,
                icon: driver.icon
            });

            const el = document.createElement('div');
            el.className = 'active-driver-marker';
            el.innerHTML = driver.icon;
            el.style.fontSize = '32px';
            el.style.cursor = 'pointer';
            el.style.filter = 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.8))';

            this.activeDriverMarker = new Marker({ element: el })
                .setLngLat([driver.lng, driver.lat])
                .setPopup(new Popup({ offset: 25 }).setHTML(`
                  <div style="text-align: center;">
                    <div style="font-size: 24px;">${driver.icon}</div>
                    <div style="font-weight: bold; color: #2563eb;">Your Driver</div>
                    <div style="font-size: 12px;">⭐ ${driver.rating}</div>
                  </div>
                `))
                .addTo(this.map!);

            console.log('✅ [MAP] Active driver marker added to map');
            this.cdr.detectChanges();
        }
    }

    private removeActiveDriverMarker(): void {
        if (this.activeDriverMarker) {
            this.activeDriverMarker.remove();
            this.activeDriverMarker = null;
        }
    }

    displayDriverRoute(geometry: any, fitBounds: boolean = false): void {
        if (!this.map || !geometry) return;

        const sourceId = 'driver-route';
        const layerId = 'driver-route-layer';

        if (this.map.getSource(sourceId)) {
            // Only update data, preserve viewport
            (this.map.getSource(sourceId) as any).setData(geometry);
        } else {
            // Create new source and layer
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
                    'line-color': '#2563eb',  // Blue for driver route
                    'line-width': 5,
                    'line-opacity': 0.8
                }
            });
        }


        // Only fit on first load AND if user hasn't interacted
        if (fitBounds && !this.userInteracted) {
            const coordinates = geometry.coordinates;
            const bounds = new LngLatBounds();
            coordinates.forEach((coord: number[]) => {
                bounds.extend(coord as [number, number]);
            });
            this.map.fitBounds(bounds, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 },
                maxZoom: 14
            });
        }
    }

    clearDriverRoute(): void {
        if (!this.map) return;

        const sourceId = 'driver-route';
        const layerId = 'driver-route-layer';

        if (this.map.getLayer(layerId)) {
            this.map.removeLayer(layerId);
        }

        if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId);
        }
    }

    ngOnDestroy(): void {
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
        }
        this.markerAnimations.forEach(id => cancelAnimationFrame(id));
        this.markerAnimations.clear();
        this.originMarker?.remove();
        this.destinationMarker?.remove();
        this.removeActiveDriverMarker();
        Object.values(this.driverMarkers).forEach(marker => marker.remove());
        this.removeRoute();
        this.clearDriverRoute();
        this.map?.remove();
    }
}
