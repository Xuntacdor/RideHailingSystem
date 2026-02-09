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

    // GPS tracking
    private gpsWatchId: number | null = null;

    private readonly MIN_DISTANCE_METERS = 10;

    // Debug logs observable
    private debugLogSubject = new BehaviorSubject<string>('');
    public debugLog$ = this.debugLogSubject.asObservable();

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


    startGPSTracking(): void {
        if (this.gpsWatchId !== null) {
            console.log('⚠️ GPS tracking already started');
            return;
        }

        if (!('geolocation' in navigator)) {
            console.error('❌ Geolocation is not supported by this browser');
            return;
        }

        console.log('🛰️ Starting continuous GPS tracking...');

        this.gpsWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };

                this.currentLocation = newLocation;
                this.locationSubject.next({
                    lat: newLocation.lat,
                    lng: newLocation.lng
                });

                console.log('📍 GPS position updated:', {
                    lat: newLocation.lat.toFixed(6),
                    lng: newLocation.lng.toFixed(6),
                    accuracy: `${newLocation.accuracy.toFixed(0)}m`
                });
            },
            (error) => {
                console.error('❌ GPS tracking error:', error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 5000
            }
        );
    }

    stopGPSTracking(): void {
        if (this.gpsWatchId !== null) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
            this.gpsWatchId = null;
            console.log('🛑 GPS tracking stopped');
        }
    }

    async getApproximateLocation(): Promise<{ lat: number; lng: number }> {
        if (!this.currentLocation) {
            throw new Error('❌ No location available. GPS tracking must be started first via startGPSTracking()');
        }

        console.log('✅ Using live GPS location:', {
            lat: this.currentLocation.lat.toFixed(6),
            lng: this.currentLocation.lng.toFixed(6),
            age: `${Date.now() - this.currentLocation.timestamp}ms ago`
        });

        return {
            lat: this.currentLocation.lat,
            lng: this.currentLocation.lng
        };
    }

    startAutoLocationUpdate(driverId: string): void {
        console.log('🚀 STARTING AUTO GPS UPDATE for driver:', driverId);
        console.log('📡 Will send GPS to backend every 3 seconds');
        this.emitDebugLog('🚀 Auto GPS update started');

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
            console.log(`⏰ [${timestamp}] Auto-update interval triggered (every 3s)`);
            try {
                await this.sendDriverLocation(driverId);
            } catch (error) {
                console.error(`❌ [${timestamp}] Auto-update failed:`, error);
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

            const logMsg = `📤 Sending: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
            console.log('📤 SENDING GPS TO BACKEND:', {
                driverId,
                lat: location.lat.toFixed(6),
                lng: location.lng.toFixed(6),
                time: new Date().toLocaleTimeString(),
                destination: '/app/driver/updatePos'
            });
            this.emitDebugLog(logMsg);

            this.stompClient.publish({
                destination: '/app/driver/updatePos',
                body: JSON.stringify(payload)
            });

            console.log('✅ GPS SENT SUCCESSFULLY to backend');
            this.emitDebugLog('✅ GPS sent successfully');

        } catch (error) {
            console.error('❌ FAILED TO SEND GPS TO BACKEND:', error);
            this.emitDebugLog('❌ Failed to send GPS');
            throw error;
        }
    }

    private emitDebugLog(message: string): void {
        this.debugLogSubject.next(message);
    }

    ngOnDestroy(): void {
        this.stopGPSTracking();
        this.stopAutoLocationUpdate();
        this.stompClient.deactivate();
        this.locationSubject.complete();
        this.debugLogSubject.complete();
    }
}