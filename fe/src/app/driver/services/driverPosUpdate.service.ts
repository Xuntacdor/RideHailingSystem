import { Injectable, OnDestroy } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable, BehaviorSubject, filter, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DriverPosUpdateService implements OnDestroy {
    private stompClient: RxStomp;
    private currentLocation: { lat: number; lng: number } | null = null;
    private locationSubject = new BehaviorSubject<{ lat: number; lng: number } | null>(null);
    public location$ = this.locationSubject.asObservable();

    private watchId: number | null = null;
    private isWatching = false;
    driverStatus: 'Matching' | 'Resting' = 'Resting';

    constructor() {
        this.stompClient = new RxStomp();
        this.stompClient.configure({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            heartbeatIncoming: 0,
            heartbeatOutgoing: 25000,
            reconnectDelay: 5000,
            // debug: (str) => {
            //     console.log('STOMP Debug:', str);
            // }
        });

        this.stompClient.connectionState$.subscribe((state) => {
            console.log('WebSocket State:', RxStompState[state]);
        });

        this.stompClient.activate();
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
        ).then(() => {});
    }

    subscribeToDriverPositionUpdates(driverId: string): Observable<any> {
        return this.stompClient.watch(`/topic/driver/${driverId}/updatePos`);
    }


    async getApproximateLocation(): Promise<{ lat: number; lng: number }> {
        if (this.isWatching && this.currentLocation) {
            console.log('Using cached location from watchPosition');
            return Promise.resolve(this.currentLocation);
        }

        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    if (!this.isWatching) {
                        this.currentLocation = location;
                        this.locationSubject.next(location);
                    }
                    
                    resolve(location);
                },
                (error) => {
                    console.error('getCurrentPosition error:', error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }


    startWatchingLocation(): void {
        if (this.isWatching) {
            console.log('Already watching location');
            return;
        }

        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.currentLocation = location;
                this.locationSubject.next(location);
                console.log('Location updated via watchPosition:', location);
            },
            (error) => {
                console.error('watchPosition error:', error.message);
            },
            {
                enableHighAccuracy: true, 
                timeout: 10000,
                maximumAge: 5000 
            }
        );

        this.isWatching = true;
        console.log('Started watching location');
    }


    stopWatchingLocation(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
            console.log('Stopped watching location');
        }
    }


    async sendDriverLocation(driverId: string): Promise<void> {
        try {
            await this.waitForConnection();

            const location = await this.getApproximateLocation();

            if (!this.stompClient.connected()) {
                throw new Error('WebSocket disconnected');
            }

            this.stompClient.publish({
                destination: '/app/driver/updatePos',
                body: JSON.stringify({
                    driverId,
                    lat: location.lat,
                    lng: location.lng,
                    timestamp: new Date().toISOString()
                })
            });

            console.log('Location sent successfully:', location);

        } catch (error) {
            console.error('Error sending location:', error);
            throw error; 
        }
    }

    ngOnDestroy(): void {
        console.log('DriverPosUpdateService destroying');
        this.stopWatchingLocation();
        this.stompClient.deactivate();
        this.locationSubject.complete();
    }
}
