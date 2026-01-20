import { Injectable } from '@angular/core';

interface SearchResult {
    place_id?: string;
    display: string;
    lng: number;
    lat: number;
}

interface RouteResult {
    distance: number; // meters
    duration: number; // milliseconds
    geometry: any; // GeoJSON geometry
    instructions?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class TrackAsiaService {
    private apiKey = '9304ed0af35602777a71768789308f6f9e';

    // API endpoints - using official TrackAsia API domains
    private readonly AUTOCOMPLETE_URL = 'https://maps.track-asia.com/api/v1/autocomplete';
    private readonly SEARCH_URL = 'https://maps.track-asia.com/api/v2/search';
    private readonly REVERSE_URL = 'https://maps.track-asia.com/api/v2/geocode';
    private readonly DIRECTIONS_URL = 'https://maps.track-asia.com/api/route/v2';

    constructor() { }


    async search(query: string, limit: number = 5): Promise<SearchResult[]> {
        try {
            const url = `${this.AUTOCOMPLETE_URL}?key=${this.apiKey}&text=${encodeURIComponent(query)}&limit=${limit}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error('Search API error:', response.status, response.statusText);
                return [];
            }

            const data = await response.json();

            if (data.features && Array.isArray(data.features)) {
                return data.features.map((feature: any) => ({
                    place_id: feature.properties?.place_id || feature.id || Math.random().toString(),
                    display: feature.properties?.label || feature.properties?.name || feature.properties?.text || 'Unknown location',
                    lng: feature.geometry?.coordinates?.[0] || 0,
                    lat: feature.geometry?.coordinates?.[1] || 0
                }));
            }

            return [];
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }


    async reverseGeocode(lng: number, lat: number): Promise<string> {
        try {
            const url = `https://maps.track-asia.com/api/v2/geocode/json?key=${this.apiKey}&latlng=${lat}%2C%20${lng}&radius=30&size=2&new_admin=true&include_old_admin=true`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error('Reverse geocoding failed:', response.status);
                return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }

            const data = await response.json();

            // Parse the new API format
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];

                // Return formatted_address if available
                if (result.formatted_address) {
                    return result.formatted_address;
                }

                // Fallback to constructing address from components
                if (result.address_components && result.address_components.length > 0) {
                    const components = result.address_components;
                    const parts = components
                        .filter((c: any) => c.long_name)
                        .map((c: any) => c.long_name);
                    return parts.join(', ');
                }
            }

            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    async getDirections(
        originLng: number,
        originLat: number,
        destLng: number,
        destLat: number,
        mode: 'driving' | 'walking' | 'bicycling' = 'driving'
    ): Promise<RouteResult | null> {
        try {
            // New API format: origin=lat,lng&destination=lat,lng
            const url = `https://maps.track-asia.com/route/v2/directions/json?` +
                `key=${this.apiKey}` +
                `&origin=${originLat},${originLng}` +
                `&destination=${destLat},${destLng}` +
                `&mode=${mode}` +
                `&new_admin=true`;

            const response = await fetch(url);

            if (!response.ok) {
                console.error('Directions API error:', response.status, response.statusText);
                return null;
            }

            const data = await response.json();

            // Parse new response format
            if (data.status === 'OK' && data.routes && data.routes[0]) {
                const route = data.routes[0];
                const leg = route.legs[0]; // First leg of the route

                // Parse polyline to GeoJSON format
                const coordinates = this.decodePolyline(route.overview_polyline.points);

                return {
                    distance: leg.distance.value, // meters
                    duration: leg.duration.value * 1000, // convert seconds to milliseconds
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    },
                    instructions: leg.steps || []
                };
            }

            return null;
        } catch (error) {
            console.error('Directions error:', error);
            return null;
        }
    }

    private decodePolyline(encoded: string): number[][] {
        const coordinates: number[][] = [];
        let index = 0;
        let lat = 0;
        let lng = 0;

        while (index < encoded.length) {
            let b;
            let shift = 0;
            let result = 0;

            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;

            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            coordinates.push([lng / 1e5, lat / 1e5]);
        }

        return coordinates;
    }


    getStyleUrl(style: 'streets' | 'satellite' | 'hybrid' = 'streets'): string {
        const styleMap = {
            streets: 'streets',
            satellite: 'satellite',
            hybrid: 'hybrid'
        };

        return `https://maps.track-asia.com/styles/v2/${styleMap[style]}.json?key=${this.apiKey}`;
    }
}
