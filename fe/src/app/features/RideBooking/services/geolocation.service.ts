import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Location } from '../models';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    private currentLocationSubject = new BehaviorSubject<Location | null>(null);
    public currentLocation$ = this.currentLocationSubject.asObservable();

    private watchId: number | null = null;

    constructor() {
        this.initializeLocation();
    }

    /**
     * Initialize and get current location
     */
    private initializeLocation(): void {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocationSubject.next({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Default to Ho Chi Minh City if geolocation fails
                    this.currentLocationSubject.next({
                        lat: 10.762622,
                        lng: 106.660172
                    });
                }
            );
        } else {
            // Default location if geolocation is not available
            this.currentLocationSubject.next({
                lat: 10.762622,
                lng: 106.660172
            });
        }
    }

    /**
     * Get current location once
     */
    getCurrentLocation(): Observable<Location | null> {
        return this.currentLocation$;
    }

    /**
     * Start watching location changes
     */
    startWatchingLocation(): void {
        if ('geolocation' in navigator && this.watchId === null) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.currentLocationSubject.next({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation watch error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
    }

    /**
     * Stop watching location changes
     */
    stopWatchingLocation(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    /**
     * Calculate distance between two points (in meters)
     */
    calculateDistance(point1: Location, point2: Location): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI / 180;
        const φ2 = point2.lat * Math.PI / 180;
        const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
        const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
}
