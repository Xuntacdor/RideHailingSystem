import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DriverPosUpdateService {
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

    subscribeToDriverPositionUpdates(driverId: string): Observable<any> {
        return this.stompClient.watch(`/topic/driver/${driverId}/updatePos`);
    }

    sendDriverLocation(driverId: string, lat: number, lng: number): void {
        this.stompClient.publish({
            destination: '/app/driver/updatePos',
            body: JSON.stringify({ driverId, lat, lng })
        });
    }

}
