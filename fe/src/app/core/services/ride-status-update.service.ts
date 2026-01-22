import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RideStatusUpdate {
    type: string;
    rideId: string;
    status: string;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class RideStatusUpdateService {
    private stompClient: RxStomp;

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

    subscribeToRideStatusUpdates(customerId: string): Observable<RideStatusUpdate> {
        return this.stompClient
            .watch(`/topic/customer/${customerId}`)
            .pipe(
                map((message) => JSON.parse(message.body))
            );
    }

    disconnect(): void {
        this.stompClient.deactivate();
    }
}
