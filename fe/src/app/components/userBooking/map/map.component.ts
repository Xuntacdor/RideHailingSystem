import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Map, Marker, NavigationControl, GeolocateControl, Popup, LngLatBounds } from 'trackasia-gl';
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

    @Output() userLocationDetected = new EventEmitter<{ lng: number; lat: number }>();
    @Output() mapReady = new EventEmitter<void>();
    @Output() tokenInvalid = new EventEmitter<void>();

    map: Map | undefined;
    private originMarker: Marker | null = null;
    private destinationMarker: Marker | null = null;
    private driverMarkers: { [driverId: string]: Marker } = {};
    private activeDriverMarker: Marker | null = null; 
    private geolocateControl: GeolocateControl | null = null;
    private animationDuration = 1000;

    constructor(private trackAsiaService: TrackAsiaService) { }
    private userLocation: { lng: number; lat: number } | null = null;

    private animateMarkerTo(marker: Marker, targetLng: number, targetLat: number, duration: number = this.animationDuration): void {
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
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }


    ngAfterViewInit(): void {
        setTimeout(() => {
            if (typeof window !== 'undefined' && this.mapContainer) {

                this.getUserLocationThenInitMap();
            }
        }, 100);
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

        if (changes['routeGeometry'] && this.map) {
            if (this.routeGeometry) {
                this.displayRoute(this.routeGeometry);
            } else {
                this.clearRoute();
            }
        }

        if (changes['activeDriver'] && this.map) {
            if (this.activeDriver) {
                this.updateActiveDriverMarker(this.activeDriver);
            } else {
                this.removeActiveDriverMarker();
            }
        }

        if (changes['driverRoute'] && this.map) {
            if (this.driverRoute) {
                this.displayDriverRoute(this.driverRoute);
            } else {
                this.clearDriverRoute();
            }
        }

        if (changes['isSettingOrigin'] || changes['isSettingDestination']) {
            this.updateCursor();
        }
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
                // Options
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

            this.map = new Map({
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

            this.map.on('load', () => {
                console.log('Map loaded successfully at user location');
                this.mapReady.emit();
                this.geolocateControl!.trigger();

                if (this.drivers.length > 0) {
                    this.updateDriverMarkers();
                }
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

                const marker = new Marker({ element: el })
                    .setLngLat([driver.lng, driver.lat])
                    .setPopup(new Popup({ offset: 25 }).setHTML(`
          <div style="text-align: center;">
            <div style="font-size: 20px;">${driver.icon}</div>
            <div style="font-weight: bold;">${driver.name}</div>
            <div style="font-size: 12px;">⭐ ${driver.rating}</div>
          </div>
        `))
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
            padding: { top: 0, bottom: 500, left: 50, right: 50 },
            maxZoom: 12
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
        if (this.activeDriverMarker) {
            this.animateMarkerTo(this.activeDriverMarker, driver.lng, driver.lat);
        } else {
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

            console.log('Active driver marker created');
        }
    }

    private removeActiveDriverMarker(): void {
        if (this.activeDriverMarker) {
            this.activeDriverMarker.remove();
            this.activeDriverMarker = null;
        }
    }

    displayDriverRoute(geometry: any): void {
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
                    'line-color': '#2563eb',  // Blue for driver route
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
            padding: { top: 50, bottom: 300, left: 50, right: 50 },
            maxZoom: 15
        });
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
        this.originMarker?.remove();
        this.destinationMarker?.remove();
        this.removeActiveDriverMarker();
        Object.values(this.driverMarkers).forEach(marker => marker.remove());
        this.removeRoute();
        this.clearDriverRoute();
        this.map?.remove();
    }
}
