export interface Location {
    name: string;
    icon: string;
    lng: number;
    lat: number;
}

export interface SearchResult {
    place_id?: string;
    display: string;
    lng: number;
    lat: number;
}

export interface RouteInfo {
    distance: number; // in km
    duration: number; // in minutes
    steps: string[];
}

export interface Coordinate {
    lng: number;
    lat: number;
    name?: string;
}

export enum VehicleType {
    MOTORBIKE = 'motorbike',
    CAR = 'car',
}

export interface Vehicle {
    type: VehicleType;
    name: string;
    description: string;
    icon: string;
    priceMultiplier: number;
}

export interface Driver {
    id: string;
    name: string;
    vehicleType: VehicleType;
    lng: number;
    lat: number;
    rating: number;
    icon: string;
}

export interface VehiclePrice {
    baseFare: number;
    pricePerKm: number;
    pricePerMinute: number;
}

export const VEHICLE_PRICES: Record<string, VehiclePrice> = {
    motorbike: {
        baseFare: 10000,
        pricePerKm: 4000,
        pricePerMinute: 200
    },
    car: {
        baseFare: 25000,
        pricePerKm: 9000,
        pricePerMinute: 400
    }
};

export interface RideFare {
    baseFare: number;
    distanceFee: number;
    timeFee: number;
    total: number;
}




