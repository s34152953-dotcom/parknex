"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

if (typeof window !== "undefined") {
  // Fix missing marker icons in Next.js
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

const MALL_LOCATION: [number, number] = [17.4486, 78.3908]; // Example: Central Mall Location

function LocationUpdater({ coords }: { coords: GeolocationCoordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.latitude, coords.longitude], 15);
    }
  }, [coords, map]);
  return null;
}

export default function CustomerMap() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation(pos.coords),
        (err) => console.warn("Location error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-[#EAE3D9] shadow-inner relative z-10">
      <MapContainer center={MALL_LOCATION} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {/* Mall Marker */}
        <Marker position={MALL_LOCATION}>
          <Popup>Central Mall Parking Entrance</Popup>
        </Marker>

        {/* Customer Location */}
        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        
        <LocationUpdater coords={location} />
      </MapContainer>
    </div>
  );
}
