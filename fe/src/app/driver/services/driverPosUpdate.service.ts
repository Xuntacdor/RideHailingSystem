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

    protected wsUrl : string = environment.wsUrl!;
    
    // Location CHỈ được set từ map component (KHÔNG tự lấy GPS)
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

    /**
     * Set location từ map component
     * Service KHÔNG tự lấy GPS để tránh conflict
     * CHỈ nhận location từ map.component emit
     */
    setCurrentLocation(location: { lat: number; lng: number }): void {
        this.currentLocation = {
            lat: location.lat,
            lng: location.lng,
            accuracy: undefined,
            timestamp: Date.now()
        };
        this.locationSubject.next(location);
        console.log('✅ Location updated from map:', location);
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

    // ✅ Tính khoảng cách giữa 2 điểm (Haversine formula)
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3; // Earth radius in meters
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

    /**
     * ✅ Lấy location hiện tại từ map (KHÔNG call GPS)
     * Throws error nếu chưa có location từ map
     */
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

    /**
     * ✅ Auto-send location khi map update vị trí
     * - Subscribe vào location$ (nhận từ map component)
     * - Chỉ gửi nếu di chuyển > MIN_DISTANCE_METERS (cho location$ stream)
     * - Heartbeat định kỳ 10s: LUÔN gửi để update pos liên tục
     */
    startAutoLocationUpdate(driverId: string): void {
        console.log('🚀 Starting auto location updates for driver:', driverId);
        
        // ✅ Gửi ngay lần đầu
        this.sendDriverLocation(driverId)
            .then(() => console.log('🎯 Initial location sent'))
            .catch(err => console.error('❌ Failed to send initial location:', err));
        
        // ✅ Subscribe vào location$ stream (map component sẽ emit vào đây)
        this.locationUpdateSubscription = this.location$.pipe(
            filter(loc => loc !== null),
            throttleTime(5000) // Tối thiểu 5s giữa các lần gửi
        ).subscribe(async (location) => {
            if (!location) return;
            
            // Kiểm tra khoảng cách so với lần gửi trước
            if (this.lastSentLocation) {
                const distance = this.calculateDistance(
                    this.lastSentLocation.lat,
                    this.lastSentLocation.lng,
                    location.lat,
                    location.lng
                );
                
                console.log(`📏 Distance moved: ${distance.toFixed(2)}m`);
                
                // Chỉ gửi nếu di chuyển > MIN_DISTANCE_METERS
                if (distance < this.MIN_DISTANCE_METERS) {
                    console.log('⏭️ Skip - movement too small');
                    return;
                }
            }
            
            // Gửi location lên server
            try {
                await this.sendDriverLocation(driverId);
                this.lastSentLocation = location;
                console.log('✅ Location auto-sent (movement detected)');
            } catch (error) {
                console.error('❌ Failed to auto-send:', error);
            }
        });
        
        // 💓 Heartbeat: Gửi location định kỳ mỗi 3s (LUÔN gửi để backend update vị trí)
        this.locationUpdateInterval = setInterval(async () => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] 💓 Heartbeat triggered - Sending position...`);
            try {
                await this.sendDriverLocation(driverId);
                console.log(`[${timestamp}] ✅ Heartbeat SUCCESS - Position sent to backend`);
            } catch (error) {
                console.error(`[${timestamp}] ❌ Heartbeat FAILED:`, error);
            }
        }, 3000); // 3s - gửi thường xuyên để backend có vị trí real-time
        
        console.log('✅ Auto location tracking started (heartbeat: every 3s)');
    }

    /**
     * ✅ Dừng auto location updates
     */
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
        console.log('🛑 Stopped auto location updates');
    }

    /**
     * ✅ Gửi location lên server qua WebSocket
     * Location được lấy từ map component (KHÔNG tự call GPS)
     */
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

            console.log('📤 Location sent:', {
                driverId,
                position: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
                time: new Date().toLocaleTimeString()
            });

        } catch (error) {
            console.error('❌ Error sending location:', error);
            throw error;
        }
    }

    ngOnDestroy(): void {
        console.log('DriverPosUpdateService destroying');
        this.stopAutoLocationUpdate();
        this.stompClient.deactivate();
        this.locationSubject.complete();
    }
}