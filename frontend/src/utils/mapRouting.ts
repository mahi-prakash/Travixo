import { MapMarkerData, MapPolylineData, TripActivity, DaySchedule } from '../types/travel';

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Universal Coordinate Resolver
 * Safely parses heterogeneous location formats (AI outputs, Google Places, Legacy state)
 * into validated [lat, lng] geometric tuples.
 */
export function resolveCoordinates(item: Partial<TripActivity>): [number, number] | null {
  const rawLat = item.coords?.[0] ?? item.lat ?? (typeof item.location === 'object' ? item.location.lat : undefined);
  const rawLng = item.coords?.[1] ?? item.lng ?? (typeof item.location === 'object' ? item.location.lng : undefined);

  const finalLat = Number(rawLat);
  const finalLng = Number(rawLng);

  if (!isNaN(finalLat) && !isNaN(finalLng) && finalLat !== 0 && finalLng !== 0) {
    return [finalLat, finalLng];
  }
  return null;
}

/**
 * Map Visualization Processor
 * Computes sequential numbered marker pins and multi-day colored polyline routes.
 */
export function buildMapVisuals(
  displayDayOrder: string[],
  displayDays: Record<string, DaySchedule>,
  selectedDayId: string
): { markers: MapMarkerData[]; polylines: MapPolylineData[] } {
  const markers: MapMarkerData[] = [];
  const polylines: MapPolylineData[] = [];
  let cumulativeIndex = 1;

  displayDayOrder.forEach(dayId => {
    const day = displayDays[dayId];
    if (!day) return;

    const isFocused = selectedDayId === "all" || selectedDayId === dayId;
    const coords: [number, number][] = [];

    (day.items || []).forEach((item: TripActivity) => {
      const pos = resolveCoordinates(item);

      if (pos) {
        markers.push({
          ...item,
          dayColor: day.color || '#0284c7',
          number: cumulativeIndex,
          dayId,
          pos,
          isFocused
        });
        coords.push(pos);
        cumulativeIndex++;
      }
    });

    if (coords.length > 1) {
      polylines.push({
        coords,
        color: day.color || '#0284c7',
        dayId,
        isFocused
      });
    }
  });

  return { markers, polylines };
}

/**
 * Street Route Engine (Google Directions Service)
 * Fetches real roadway routing along streets for focused daily activities.
 */
export async function fetchRoadRoute(
  focusedMarkers: MapMarkerData[],
  mode: string = 'DRIVING'
): Promise<any | null> {
  if (!window.google || focusedMarkers.length < 2) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const origin = { lat: focusedMarkers[0].pos[0], lng: focusedMarkers[0].pos[1] };
      const destination = {
        lat: focusedMarkers[focusedMarkers.length - 1].pos[0],
        lng: focusedMarkers[focusedMarkers.length - 1].pos[1]
      };
      const waypoints = focusedMarkers.slice(1, -1).map(m => ({
        location: { lat: m.pos[0], lng: m.pos[1] },
        stopover: true
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode[mode] || window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false
        },
        (result: any, status: string) => {
          if (status === window.google.maps.DirectionsStatus.OK || status === "OK") {
            resolve(result);
          } else {
            console.warn(`[MapRouting] Directions request failed with status: ${status}`);
            resolve(null);
          }
        }
      );
    } catch (error) {
      console.error("[MapRouting] Error initiating DirectionsService:", error);
      resolve(null);
    }
  });
}

/**
 * Route Logistics Extractor
 * Extracts step-by-step drive times and distances from Google route responses.
 */
export function extractTransitDetails(
  directions: any,
  focusedMarkers: MapMarkerData[]
): Record<string, { distanceText: string; durationText: string }> {
  const transitMap: Record<string, { distanceText: string; durationText: string }> = {};

  if (!directions || !directions.routes?.[0]?.legs) {
    return transitMap;
  }

  const legs = directions.routes[0].legs;

  for (let i = 0; i < legs.length && (i + 1) < focusedMarkers.length; i++) {
    const fromId = focusedMarkers[i].id;
    const leg = legs[i];
    if (leg?.distance && leg?.duration) {
      transitMap[fromId] = {
        distanceText: leg.distance.text,
        durationText: leg.duration.text
      };
    }
  }

  return transitMap;
}
