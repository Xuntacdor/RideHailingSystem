import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface BookingTypeResponse {
    id: string;
    name: string;
    code: string;
    vehicleType: 'CAR' | 'MOTORBIKE';
    baseFare: number;
    pricePerKm: number;
    pricePerMinute: number;
    description: string;
    active: boolean;
    iconUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingTypeService extends ApiService {
    constructor(http: HttpClient) {
        super(http);
    }

    getAllBookingTypes(): Observable<BookingTypeResponse[]> {
        return this.get<BookingTypeResponse[]>('/booking-types');
    }

    getActiveBookingTypes(): Observable<BookingTypeResponse[]> {
        return this.get<BookingTypeResponse[]>('/booking-types/active');
    }

    getBookingTypesByVehicleType(vehicleType: 'CAR' | 'MOTORBIKE'): Observable<BookingTypeResponse[]> {
        return this.get<BookingTypeResponse[]>(`/booking-types/vehicle/${vehicleType}`);
    }

    getBookingTypeById(id: string): Observable<BookingTypeResponse> {
        return this.get<BookingTypeResponse>(`/booking-types/${id}`);
    }
}
