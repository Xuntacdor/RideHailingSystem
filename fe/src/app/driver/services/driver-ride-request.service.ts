import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface RideRequestNotification {
    rideRequestId: string;
    customerId: string;
    customerName: string;
    startLocation: string;
    endLocation: string;
    startAddress?: string;
    endAddress?: string;
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;
    distance: number;
    fare: number;
    vehicleType: string;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class DriverRideRequestService {
    private stompClient: RxStomp;
        protected wsUrl : string = environment.wsUrl!;
    
    constructor() {

        this.stompClient = new RxStomp();
        this.stompClient.configure({
            webSocketFactory: () => {
                return new SockJS(this.wsUrl);
            },
            heartbeatIncoming: 0,
            heartbeatOutgoing: 25000,
            reconnectDelay: 5000,
        });

        // Add connection status listeners
        this.stompClient.connected$.subscribe(() => {
        });

        this.stompClient.connectionState$.subscribe((state) => {
        });

        // IMPORTANT: Activate immediately like customer service
        this.stompClient.activate();
    }

    disconnect(): void {
        this.stompClient.deactivate();
    }

    subscribeToRideRequests(driverId: string): Observable<any> {

        return this.stompClient
            .watch(`/topic/driver/${driverId}`)
            .pipe(
                map((message) => {

                    try {
                        const parsed = JSON.parse(message.body);
                        return parsed;
                    } catch (error) {
                        throw error;
                    }
                })
            );
    }

    sendDriverResponse(rideRequestId: string, driverId: string, accepted: boolean): void {
        this.stompClient.publish({
            destination: '/app/driver/response',
            body: JSON.stringify({
                rideRequestId,
                driverId,
                accepted
            })
        });
    }
}
