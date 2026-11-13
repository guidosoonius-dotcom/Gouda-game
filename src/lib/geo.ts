"use client";

import { useEffect, useState } from "react";

export interface LatLng {
  lat: number;
  lng: number;
}

/** Great-circle distance in metres. */
export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type GeoState =
  | { status: "idle" }
  | { status: "asking" }
  | { status: "denied" }
  | { status: "ok"; metres: number; accuracy: number };

/** Live distance to a target. Only watches while `active` (map screen, location mode, after consent). */
export function useDistance(target: LatLng, active: boolean): GeoState {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    if (!active) return setState({ status: "idle" });
    if (!("geolocation" in navigator)) return setState({ status: "denied" });
    setState({ status: "asking" });
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          status: "ok",
          metres: haversine({ lat: pos.coords.latitude, lng: pos.coords.longitude }, target),
          accuracy: pos.coords.accuracy,
        }),
      () => setState({ status: "denied" }),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [active, target.lat, target.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

export function formatMetres(m: number): string {
  if (m >= 10000) return `${Math.round(m / 1000)} km`;
  if (m >= 1000) return `${(m / 1000).toFixed(1).replace(".", ",")} km`;
  return `${Math.round(m / 10) * 10} m`;
}
