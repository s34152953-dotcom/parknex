"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  totalCapacity: number;
  availableSpaces: number;
  status: "available" | "limited" | "full";
}

interface LiveGpsPlacesMapProps {
  userCoords: { lat: number; lng: number };
  userAreaName?: string;
  places: MapPlace[];
  selectedPlaceId: string;
  onSelectPlace: (id: string) => void;
}

export default function LiveGpsPlacesMap({
  userCoords,
  userAreaName,
  places,
  selectedPlaceId,
  onSelectPlace,
}: LiveGpsPlacesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false, // Clean UI without footer clutter
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // 1. Add User Spot Marker
    const userHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%);">
        <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(53,105,168,0.25);animation:pulse 2s infinite;"></div>
        <div style="width:16px;height:16px;border-radius:50%;background:#3569A8;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;top:18px;white-space:nowrap;background:#241F1B;color:#FFFFFF;font-size:10px;font-weight:800;padding:2px 6px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
          🎯 You Are Here
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: "custom-user-marker",
      iconSize: [0, 0],
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(markersLayer);

    const bounds = L.latLngBounds([[userCoords.lat, userCoords.lng]]);

    // 2. Add Nearby Mall / Parking Places Markers
    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const isFull = place.status === "full";
      const isLimited = place.status === "limited";
      const badgeBg = isFull ? "#C93B2F" : isLimited ? "#B7791F" : "#2F7D5A";

      const placeHtml = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
          <div style="display:flex;align-items:center;gap:4px;background:${badgeBg};color:#FFFFFF;padding:4px 8px;border-radius:10px;font-size:11px;font-weight:800;border:2px solid #FFFFFF;box-shadow:0 4px 12px rgba(0,0,0,0.25);${
        isSelected ? "outline:3px solid #C93B2F;outline-offset:2px;transform:scale(1.08);" : ""
      }">
            <span>${isFull ? "FULL" : `${place.availableSpaces} Free`}</span>
          </div>
          <div style="width:6px;height:6px;background:${badgeBg};transform:rotate(45deg);margin-top:-3px;border-right:1px solid #FFF;border-bottom:1px solid #FFF;"></div>
          <div style="margin-top:2px;background:rgba(255,255,255,0.95);color:#241F1B;padding:2px 6px;border-radius:5px;font-size:10px;font-weight:800;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 4px rgba(0,0,0,0.15);border:1px solid #DED3C7;">
            ${place.name}
          </div>
        </div>
      `;

      const placeIcon = L.divIcon({
        html: placeHtml,
        className: `custom-place-marker-${place.id}`,
        iconSize: [0, 0],
      });

      const marker = L.marker([place.lat, place.lng], { icon: placeIcon }).addTo(markersLayer);
      marker.on("click", () => {
        onSelectPlace(place.id);
      });

      bounds.extend([place.lat, place.lng]);

      // If this place is selected, draw connecting route line
      if (isSelected) {
        routeLineRef.current = L.polyline(
          [
            [userCoords.lat, userCoords.lng],
            [place.lat, place.lng],
          ],
          {
            color: "#C93B2F",
            weight: 3.5,
            dashArray: "6, 6",
            opacity: 0.85,
          }
        ).addTo(map);
      }
    });

    // Fit map bounds if places exist
    if (places.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([userCoords.lat, userCoords.lng], 13);
    }
  }, [userCoords, places, selectedPlaceId, onSelectPlace]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
