import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RideRequestNotification {
    rideRequestId: string;
    customerId: string;
    customerName: string;
    startLocation: string;
    endLocation: string;
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

    constructor() {
        console.log('Initializing DriverRideRequestService');

        this.stompClient = new RxStomp();
        this.stompClient.configure({
            webSocketFactory: () => {
                console.log('🌐 [WS] Creating WebSocket connection to: http://localhost:8080/ws');
                return new SockJS('http://localhost:8080/ws');
            },
            heartbeatIncoming: 0,
            heartbeatOutgoing: 25000,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log('🐛 [WS-DEBUG]', str);
            }
        });

        // Add connection status listeners
        this.stompClient.connected$.subscribe(() => {
            console.log('✅ [WS] CONNECTED to WebSocket server');
            console.log('🎉 [WS] Ready to receive ride requests!');
        });

        this.stompClient.connectionState$.subscribe((state) => {
            console.log('🔄 [WS] Connection state changed:', state);
        });

        // IMPORTANT: Activate immediately like customer service
        console.log('🚀 [WS] Activating connection immediately...');
        this.stompClient.activate();
    }

    disconnect(): void {
        console.log('🔌 [WS] Disconnecting...');
        this.stompClient.deactivate();
        console.log('❌ [WS] Disconnected');
    }

    subscribeToRideRequests(driverId: string): Observable<RideRequestNotification> {
        console.log(`📡 [WS] Watching topic: /topic/driver/${driverId}`);

        return this.stompClient
            .watch(`/topic/driver/${driverId}`)
            .pipe(
                map((message) => {
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('📨 [WS] RAW MESSAGE RECEIVED');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('Message object:', message);
                    console.log('Message body (raw):', message.body);
                    console.log('Message headers:', message.headers);

                    try {
                        const parsed = JSON.parse(message.body);
                        console.log('✅ [WS] PARSED DATA:', parsed);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        return parsed;
                    } catch (error) {
                        console.error('❌ [WS] Failed to parse message:', error);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
