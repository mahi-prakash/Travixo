/**
 * Core Travel Domain Types
 * Provides strict structural contracts for trips, itinerary items, map markers, and route navigation.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TripActivity {
  id: string;
  title: string;
  name?: string;
  category?: string;
  location?: string | GeoPoint;
  coords?: [number, number] | string[];
  lat?: number | string;
  lng?: number | string;
  time?: string;
  desc?: string;
  img?: string;
  rating?: number | string;
  cost?: string;
  duration?: string;
  tags?: string[];
  isStepOnePick?: boolean;
}

export interface DaySchedule {
  id: string;
  title: string;
  date?: string;
  color: string;
  items: TripActivity[];
}

export interface MapMarkerData extends TripActivity {
  dayColor: string;
  number: number;
  dayId: string;
  pos: [number, number]; // Strictly enforced geographic tuple
  isFocused: boolean;
}

export interface MapPolylineData {
  coords: [number, number][];
  color: string;
  dayId: string;
  isFocused: boolean;
}

export interface TransitLogistics {
  fromId: string;
  toId: string;
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
  mode: 'DRIVING' | 'WALKING' | 'TRANSIT';
}
