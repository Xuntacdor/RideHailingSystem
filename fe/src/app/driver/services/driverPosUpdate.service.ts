import { Injectable, Input } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DriverPosUpdateService {
    private stompClient: RxStomp;
    private currentLocation: { lat: number; lng: number } | null = null;
    private locationSubject = new BehaviorSubject<{ lat: number; lng: number } | null>(null);
    public location$ = this.locationSubject.asObservable();

    private watchId: number | null = null;
    driverStatus: 'Matching' | 'Resting' = 'Resting';

    setDriverStatus(status: 'Matching' | 'Resting') {
        this.driverStatus = status;
    }

    constructor() {
        this.stompClient = new RxStomp();
        this.stompClient.configure({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            heartbeatIncoming: 0,
            heartbeatOutgoing: 25000,
            reconnectDelay: 5000,
            // debug: (str) => {
            //     console.log(str);
            // }
        });
        this.stompClient.activate();
    }

    subscribeToDriverPositionUpdates(driverId: string): Observable<any> {
        return this.stompClient.watch(`/topic/driver/${driverId}/updatePos`);
    }

    getApproximateLocation(): Promise<{ lat: number; lng: number }> {
        // Use cached location if strictly watching
        if (this.watchId !== null && this.currentLocation) {
            return Promise.resolve(this.currentLocation);
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    // Update current location locally just in case
                    this.currentLocation = location;
                    resolve(location);
                },
                (error) => reject(error),
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    // private getLatAndLng(): Promise<{ lat: number; lng: number }> {
    //     return new Promise((resolve, reject) => {
    //         if (!navigator.geolocation) {
    //             reject('Geolocation doesnt suppo');
    //             return;
    //         }

    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 const location = {
    //                     lat: position.coords.latitude,
    //                     lng: position.coords.longitude
    //                 };
    //                 this.currentLocation = location;
    //                 this.locationSubject.next(location);
    //                 resolve(location);
    //             },
    //             (error) => {
    //                 reject(`Can't get location: ${error.message}`);
    //             },
    //             {
    //                 enableHighAccuracy: false,
    //                 timeout: 10000,
    //                 maximumAge: 30000
    //             }
    //         );
    //     });
    // }

    startWatchingLocation(): void {
        if (!navigator.geolocation) {
            console.error('Geolocation không được hỗ trợ');
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
                console.log('Location updated:', this.currentLocation);
            },
            (error) => {
                console.error('Error watching location:', error.message);
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 10000
            }
        );
    }

    stopWatchingLocation(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    async sendDriverLocation(driverId: string): Promise<void> {
        try {
            let location = await this.getApproximateLocation();


            this.stompClient.publish({
                destination: '/app/driver/updatePos',
                body: JSON.stringify({
                    driverId,
                    lat: location.lat,
                    lng: location.lng,
                    timestamp: new Date().toISOString()
                })
            });

        } catch (error) {
            console.error('Error sending location:', error);
        }
    }

}
