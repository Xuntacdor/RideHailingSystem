import { Injectable, OnDestroy } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable, BehaviorSubject, filter, firstValueFrom, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LocationData {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class DriverPosUpdateService implements OnDestroy {
    private stompClient: RxStomp;

    protected wsUrl: string = environment.wsUrl!;

    private currentLocation: LocationData | null = null;
    private locationSubject = new BehaviorSubject<{ lat: number; lng: number } | null>(null);
    public location$ = this.locationSubject.asObservable();

    driverStatus: 'Matching' | 'Resting' = 'Resting';

    // Auto-update tracking
    private locationUpdateSubscription: Subscription | null = null;
    private locationUpdateInterval: any = null;
    private lastSentLocation: { lat: number; lng: number } | null = null;

    private readonly MIN_DISTANCE_METERS = 10;

    constructor() {
        this.stompClient = new RxStomp();
        this.stompClient.configure({
            webSocketFactory: () => new SockJS(this.wsUrl),
            heartbeatIncoming: 0,
            heartbeatOutgoing: 3000,
            reconnectDelay: 5000,
        });

        this.stompClient.connectionState$.subscribe((state) => {
            console.log('WebSocket State:', RxStompState[state]);
        });

        this.stompClient.activate();
    }


    setCurrentLocation(location: { lat: number; lng: number }): void {
        this.currentLocation = {
            lat: location.lat,
            lng: location.lng,
            accuracy: undefined,
            timestamp: Date.now()
        };
        this.locationSubject.next(location);
    }

    setDriverStatus(status: 'Matching' | 'Resting') {
        this.driverStatus = status;
    }

    private async waitForConnection(): Promise<void> {
        if (this.stompClient.connected()) {
            return Promise.resolve();
        }

        return firstValueFrom(
            this.stompClient.connectionState$.pipe(
                filter(state => state === RxStompState.OPEN)
            )
        ).then(() => { });
    }

    subscribeToDriverPositionUpdates(driverId: string): Observable<any> {
        return this.stompClient.watch(`/topic/driver/${driverId}/updatePos`);
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }


    async getApproximateLocation(): Promise<{ lat: number; lng: number }> {
        if (!this.currentLocation) {
            throw new Error('❌ No location available. Map must emit location first via setCurrentLocation()');
        }

        console.log('✅ Using location from map:', this.currentLocation);
        return {
            lat: this.currentLocation.lat,
            lng: this.currentLocation.lng
        };
    }

    startAutoLocationUpdate(driverId: string): void {

        this.sendDriverLocation(driverId)
            .then(() => { })
            .catch(err => { });

        this.locationUpdateSubscription = this.location$.pipe(
            filter(loc => loc !== null),
            throttleTime(5000)
        ).subscribe(async (location) => {
            if (!location) return;

            if (this.lastSentLocation) {
                const distance = this.calculateDistance(
                    this.lastSentLocation.lat,
                    this.lastSentLocation.lng,
                    location.lat,
                    location.lng
                );


                if (distance < this.MIN_DISTANCE_METERS) {
                    return;
                }
            }

            try {
                await this.sendDriverLocation(driverId);
                this.lastSentLocation = location;
            } catch (error) {
                console.error('Failed to auto-send:', error);
            }
        });

        this.locationUpdateInterval = setInterval(async () => {
            const timestamp = new Date().toLocaleTimeString();
            try {
                await this.sendDriverLocation(driverId);
            } catch (error) {
            }
        }, 3000);

    }


    stopAutoLocationUpdate(): void {
        if (this.locationUpdateSubscription) {
            this.locationUpdateSubscription.unsubscribe();
            this.locationUpdateSubscription = null;
        }

        if (this.locationUpdateInterval) {
            clearInterval(this.locationUpdateInterval);
            this.locationUpdateInterval = null;
        }

        this.lastSentLocation = null;
    }


    async sendDriverLocation(driverId: string): Promise<void> {
        try {
            await this.waitForConnection();

            const location = await this.getApproximateLocation();

            if (!this.stompClient.connected()) {
                throw new Error('WebSocket disconnected');
            }

            const payload = {
                driverId,
                lat: location.lat,
                lng: location.lng,
                timestamp: new Date().toISOString()
            };

            this.stompClient.publish({
                destination: '/app/driver/updatePos',
                body: JSON.stringify(payload)
            });

        } catch (error) {
            console.error('Error sending location:', error);
            throw error;
        }
    }

    ngOnDestroy(): void {
        this.stopAutoLocationUpdate();
        this.stompClient.deactivate();
        this.locationSubject.complete();
    }
}