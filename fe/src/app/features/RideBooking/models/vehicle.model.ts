export enum VehicleType {
    CAR = 'CAR',
    SCOOTER = 'SCOOTER',
    BIKE = 'BIKE'
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Vehicle {
    id: string;
    type: VehicleType;
    location: Location;
    available: boolean;
    heading?: number; // rotation angle for map icon
}

export interface Driver {
    id: string;
    name: string;
    rating: number;
    vehicleId: string;
    location: Location;
}

export interface VehicleOption {
    type: VehicleType;
    name: string;
    description: string;
    icon: string;
}
