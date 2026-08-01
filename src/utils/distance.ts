import type { FtcEvent } from '../types/ftc';

export interface Coords {
  lat: number;
  lng: number;
}

/** Great-circle distance in kilometers between two coordinates. */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Extracts coordinates from an event if the API provided them. */
export function eventCoords(e: FtcEvent): Coords | null {
  if (e.location && typeof e.location.lat === 'number') {
    return { lat: e.location.lat, lng: e.location.lng };
  }
  if (typeof e.latitude === 'number' && typeof e.longitude === 'number') {
    return { lat: e.latitude, lng: e.longitude };
  }
  return null;
}

export interface EventWithDistance {
  event: FtcEvent;
  distanceKm: number | null;
}

/**
 * Sorts events by distance from `origin` when coordinates exist, pushing
 * coordinate-less events to the end sorted by start date.
 */
export function sortEventsByDistance(
  events: FtcEvent[],
  origin: Coords | null,
): EventWithDistance[] {
  const withDist = events.map((event) => {
    const c = eventCoords(event);
    const distanceKm = origin && c ? haversineKm(origin, c) : null;
    return { event, distanceKm };
  });

  return withDist.sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return (
      new Date(a.event.dateStart).getTime() - new Date(b.event.dateStart).getTime()
    );
  });
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(km: number | null): string {
  if (km == null) return '';
  if (km < 1) return '<1 km';
  return `${Math.round(km)} km`;
}
