export interface Station {
    id: string;
    name: string;
    system: string;
    borough?: string;
    accessibilityStatus?: string;
    lines: string[];
}
export interface Departure {
    routeShortName?: string;
    routeLongName?: string;
    destination: string;
    departureTime: string;
    status: string;
    track?: string;
    peakStatus?: string;
    direction?: string;
    tripId?: string;
}
export interface Alert {
    title: string;
    description?: string;
    activePeriods: {
        start?: string;
        end?: string;
    }[];
    affectedLines: string[];
    affectedStations: string[];
    affectedStationsLabels: string[];
}
export declare function fetchWithCache<T>(endpoint: string, ttl?: number): Promise<T>;
export declare function getStations(): Promise<Station[]>;
export declare function getDepartures(stationId: string): Promise<Departure[]>;
export declare function getAlerts(): Promise<Alert[]>;
export declare function getFavorites(): Record<string, string>;
export declare function addFavorite(id: string, alias?: string): void;
export declare function removeFavorite(idOrAlias: string): void;
export declare function resolveAlias(input: string): string;
//# sourceMappingURL=api.d.ts.map