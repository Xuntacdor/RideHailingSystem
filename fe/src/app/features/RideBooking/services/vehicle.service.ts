import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vehicle, VehicleType, Location } from '../models';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
    public vehicles$ = this.vehiclesSubject.asObservable();

    constructor() {
        this.generateMockVehicles();
    }

    /**
     * Generate mock vehicles around a location
     */
    private generateMockVehicles(center: Location = { lat: 10.762622, lng: 106.660172 }): void {
        const mockVehicles: Vehicle[] = [];
        const radius = 0.01; // approximately 1km

        // Generate random cars
        for (let i = 0; i < 8; i++) {
            mockVehicles.push({
                id: `car-${i}`,
                type: VehicleType.CAR,
                location: this.randomLocationAround(center, radius),
                available: Math.random() > 0.3,
                heading: Math.random() * 360
            });
        }

        // Generate random scooters
        for (let i = 0; i < 6; i++) {
            mockVehicles.push({
                id: `scooter-${i}`,
                type: VehicleType.SCOOTER,
                location: this.randomLocationAround(center, radius),
                available: Math.random() > 0.2,
                heading: Math.random() * 360
            });
        }

        this.vehiclesSubject.next(mockVehicles);
    }

    /**
     * Get vehicles near a location
     */
    getVehiclesNearLocation(location: Location, vehicleType?: VehicleType): Observable<Vehicle[]> {
        this.generateMockVehicles(location);
        return this.vehicles$;
    }

    /**
     * Update vehicle locations (simulate real-time movement)
     */
    startVehicleTracking(): void {
        setInterval(() => {
            const currentVehicles = this.vehiclesSubject.value;
            const updatedVehicles = currentVehicles.map(vehicle => ({
                ...vehicle,
                location: this.jitterLocation(vehicle.location, 0.0001),
                heading: (vehicle.heading || 0) + (Math.random() - 0.5) * 10
            }));
            this.vehiclesSubject.next(updatedVehicles);
        }, 5000); // Update every 5 seconds
    }

    /**
     * Generate random location around a center point
     */
    private randomLocationAround(center: Location, radius: number): Location {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;

        return {
            lat: center.lat + (distance * Math.cos(angle)),
            lng: center.lng + (distance * Math.sin(angle))
        };
    }

    /**
     * Add slight random movement to location
     */
    private jitterLocation(location: Location, amount: number): Location {
        return {
            lat: location.lat + (Math.random() - 0.5) * amount,
            lng: location.lng + (Math.random() - 0.5) * amount
        };
    }
}
