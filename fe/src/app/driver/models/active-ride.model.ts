export interface ActiveRide {
    rideId: string;
    customerId: string;
    pickupLat: number;
    pickupLng: number;
    pickupLocation: string;
    destinationLat?: number;
    destinationLng?: number;
    destinationLocation: string;
    status: string;
}

export interface NavigationInfo {
    distance: number; // in meters
    duration: number; // in seconds
    instruction: string;
}
