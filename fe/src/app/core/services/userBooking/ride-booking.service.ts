import { Injectable } from "@angular/core";
import { BookingTypeResponse, BookingTypeService } from "../booking-type.service";
import { RideService } from "../ride.service";
import { TrackAsiaService } from "../trackasia.service";
import { Coordinate, RouteInfo, VehicleType } from "../../../models/models";
import { jwtPayload, RideRequest } from "../../models/api-response.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RideBookingService {
    constructor(
        private rideService: RideService,
        private trackAsiaService: TrackAsiaService,
        private bookingTypeService: BookingTypeService
    ) { }

    // Validate booking request
    validateBookingRequest(
        origin: Coordinate | null,
        destination: Coordinate | null,
        routeInfo: RouteInfo | null,
        jwtPayload: jwtPayload | null
    ): { valid: boolean; error?: string } {
        if (!jwtPayload) {
            return { valid: false, error: 'Please log in to book a ride.' };
        }

        if (!origin || !destination) {
            return { valid: false, error: 'Please select both pickup and destination locations.' };
        }

        if (!routeInfo) {
            return { valid: false, error: 'Unable to calculate route. Please try selecting locations again.' };
        }

        if (!this.isValidCoordinate(origin.lat, origin.lng) ||
            !this.isValidCoordinate(destination.lat, destination.lng)) {
            return { valid: false, error: 'Invalid location coordinates. Please select valid locations.' };
        }

        const minDistance = 0.1;
        if (routeInfo.distance < minDistance) {
            return { valid: false, error: 'Pickup and destination are too close. Minimum distance is 100m.' };
        }

        return { valid: true };
    }

    // Calculate fare
    calculateFare(
        vehicleType: VehicleType,
        distance: number,
        duration: number,
        bookingTypes: BookingTypeResponse[]
    ): number {
        const bookingType = bookingTypes.find(bt => bt.vehicleType === vehicleType.toString());

        if (bookingType) {
            const { baseFare, pricePerKm, pricePerMinute } = bookingType;
            const extraDistance = Math.max(0, distance - 2);
            const total = baseFare + (extraDistance * pricePerKm) + (duration * pricePerMinute);
            return Math.round(total / 1000) * 1000;
        }

        // Fallback pricing
        const baseFare = 10000;
        const pricePerKm = 5000;
        const pricePerMinute = 1000;
        const multiplier = vehicleType === VehicleType.CAR ? 2.5 : 1.0;
        const extraDistance = Math.max(0, distance - 2);
        const total = (baseFare + (extraDistance * pricePerKm) + (duration * pricePerMinute)) * multiplier;
        return Math.round(total / 1000) * 1000;
    }

    // Create ride request
    createRideRequest(
        origin: Coordinate,
        destination: Coordinate,
        routeInfo: RouteInfo,
        vehicleType: VehicleType,
        userId: string
    ): Observable<any> {
        const distanceInMeters = routeInfo.distance * 1000;
        const fare = this.calculateFare(vehicleType, routeInfo.distance, routeInfo.duration, []);

        const rideRequest: RideRequest = {
            customerId: userId,
            startLatitude: origin.lat,
            startLongitude: origin.lng,
            endLatitude: destination.lat,
            endLongitude: destination.lng,
            customerLatitude: origin.lat,
            customerLongitude: origin.lng,
            distance: Math.round(distanceInMeters),
            fare: Math.round(fare),
            vehicleType: this.mapVehicleTypeToBackend(vehicleType),
            startTime: Date.now(),
        };

        return this.rideService.createRide(rideRequest);
    }

    private isValidCoordinate(lat: number, lng: number): boolean {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
    }

    private mapVehicleTypeToBackend(vehicleType: VehicleType): string {
        return vehicleType === VehicleType.MOTORBIKE ? 'MOTORBIKE' : 'CAR';
    }
}
