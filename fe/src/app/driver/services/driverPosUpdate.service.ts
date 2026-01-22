import { Injectable, Input } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DriverPosUpdateService {
    private stompClient: RxStomp;
    private currentLocation: { lat: number; lng: number } | null = null;
    private watchId: number | null = null;
    @Input() driverStatus: 'Matching' | 'Resting' = 'Resting';

    constructor() {
        this.stompClient = new RxStomp();
        this.stompClient.configure({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            heartbeatIncoming: 0,
            heartbeatOutgoing: 25000,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log(str);
            }
        });
        this.stompClient.activate();
    }

    subscribeToDriverPositionUpdates(driverId: string): Observable<any> {
        return this.stompClient.watch(`/topic/driver/${driverId}/updatePos`);
    }

    getApproximateLocation(): Promise<{ lat: number; lng: number }> {
        console.log('📱 Getting approximate location');

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('📍 Approximate location:', location);
                    resolve(location);
                },
                (error) => reject(error),
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 30000
                }
            );
        });
    }

    private getLatAndLng(): Promise<{ lat: number; lng: number }> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation doesnt suppo');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.currentLocation = location;
                    resolve(location);
                },
                (error) => {
                    reject(`Can't get location: ${error.message}`);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    startWatchingLocation(): void {
        if (!navigator.geolocation) {
            console.error('Geolocation không được hỗ trợ');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Location updated:', this.currentLocation);
            },
            (error) => {
                console.error('Error watching location:', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 2000
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
            let location;
            if (this.driverStatus == 'Matching') {
                location = await this.getLatAndLng();
            } else {
                location = await this.getApproximateLocation();
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

            console.log('Sent location:', location);
        } catch (error) {
            console.error('Error sending location:', error);
        }
    }

}
