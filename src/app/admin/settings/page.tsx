"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Car,
  Zap,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpRight,
  Building2,
  Crosshair,
  LocateFixed,
  Route as RouteIcon,
  Loader2,
} from "lucide-react";
import { MapPlace } from "@/components/maps/LiveGpsPlacesMap";

// Dynamic import of Leaflet map to prevent SSR window issues
const LiveGpsPlacesMap = dynamic(
  () => import("@/components/maps/LiveGpsPlacesMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-[#70675F] gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#C93B2F]" />
        <span className="text-[13px] font-bold">Loading Interactive Map...</span>
      </div>
    ),
  }
);

interface RealPlace extends MapPlace {
  trafficStatus: "fast" | "moderate" | "heavy";
  evChargersAvailable: number;
  googleMapsUrl: string;
}

export default function AdminSettingsPage() {
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied" | "unsupported">(
    "locating"
  );
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 17.558, // Default Telangana coordinates
    lng: 78.486,
    accuracy: 10,
  });
  const [userAreaName, setUserAreaName] = useState<string>("Locating area...");
  const [places, setPlaces] = useState<RealPlace[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "available" | "ev" | "near">("all");

  // Fetch real nearby places from our API
  const fetchNearbyRealPlaces = useCallback(async (lat: number, lng: number) => {
    setIsLoadingPlaces(true);
    try {
      const res = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=15000`);
      if (res.ok) {
        const data = await res.json();
        if (data.userLocationName) {
          setUserAreaName(data.userLocationName);
        }
        if (data.places && data.places.length > 0) {
          setPlaces(data.places);
          setSelectedPlaceId((prev) => (prev ? prev : data.places[0].id));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch nearby places:", err);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  // Request browser GPS coordinates
  const acquireExactGpsLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus("unsupported");
      return;
    }

    setGpsStatus("locating");
    setIsLoadingPlaces(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newCoords = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 10),
        };
        setUserCoords(newCoords);
        setGpsStatus("active");
        fetchNearbyRealPlaces(latitude, longitude);
      },
      (error) => {
        console.warn("GPS Geolocation error:", error.message);
        setGpsStatus("denied");
        fetchNearbyRealPlaces(userCoords.lat, userCoords.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 4000,
      }
    );
  }, [fetchNearbyRealPlaces, userCoords.lat, userCoords.lng]);

  useEffect(() => {
    acquireExactGpsLocation();
  }, []);

  const selectedPlace =
    places.find((p) => p.id === selectedPlaceId) || places[0] || null;

  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === "available") return place.status !== "full";
    if (filterType === "ev") return place.evChargersAvailable > 0;
    if (filterType === "near") return place.distanceKm <= 5.0;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              NEARBY PLACES &amp; PARKING
            </span>
            {userAreaName && (
              <span className="text-[12px] text-[#70675F]">· {userAreaName}</span>
            )}
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Surrounding Malls &amp; Parking Spaces
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Real shopping malls, retail centers, and parking facilities detected near your current location with live Google Maps driving routes.
          </p>
        </div>

        {/* GPS Location Refresh */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-bold shadow-xs ${
              gpsStatus === "active"
                ? "bg-[#2F7D5A]/10 border-[#2F7D5A]/30 text-[#2F7D5A]"
                : gpsStatus === "locating"
                ? "bg-[#3569A8]/10 border-[#3569A8]/30 text-[#3569A8]"
                : "bg-[#B7791F]/10 border-[#B7791F]/30 text-[#B7791F]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gpsStatus === "active"
                  ? "bg-[#2F7D5A] animate-pulse"
                  : gpsStatus === "locating"
                  ? "bg-[#3569A8] animate-ping"
                  : "bg-[#B7791F]"
              }`}
            />
            <span>
              {gpsStatus === "active"
                ? `Location Active (±${userCoords.accuracy}m)`
                : gpsStatus === "locating"
                ? "Detecting Location..."
                : "Location Access Required"}
            </span>
          </div>

          <button
            type="button"
            onClick={acquireExactGpsLocation}
            disabled={isLoadingPlaces}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[12px] font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-[#C93B2F] ${isLoadingPlaces ? "animate-spin" : ""}`} />
            <span>Update Location</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#DED3C7] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#938980] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby malls, shopping centers, parking..."
            className="w-full bg-[#FAF7F2] border border-[#DED3C7] rounded-xl pl-10 pr-4 py-2.5 text-[13.5px] text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "all"
                ? "bg-[#C93B2F] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] hover:bg-[#F3EAE0]"
            }`}
          >
            All Places ({places.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("available")}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "available"
                ? "bg-[#2F7D5A] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] hover:bg-[#F3EAE0]"
            }`}
          >
            Available Spaces
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ev")}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "ev"
                ? "bg-[#3569A8] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] hover:bg-[#F3EAE0]"
            }`}
          >
            EV Charging
          </button>
          <button
            type="button"
            onClick={() => setFilterType("near")}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "near"
                ? "bg-[#241F1B] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] hover:bg-[#F3EAE0]"
            }`}
          >
            Within 5 km
          </button>
        </div>
      </div>

      {/* ── TWO COLUMN VIEW: INTERACTIVE MAP (7 COLS) & SELECTED PLACE DETAILS (5 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Viewport with Markers (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#C93B2F]" />
                <span className="text-[14.5px] font-bold text-[#241F1B]">
                  Live Interactive Places Map
                </span>
              </div>
              <span className="text-[12px] font-bold text-[#70675F]">
                Click pins to select mall
              </span>
            </div>

            {/* Interactive Leaflet Map with All Surrounding Place Pins */}
            <div className="relative w-full h-[400px] sm:h-[460px] bg-[#FAF7F2] rounded-xl border border-[#DED3C7] overflow-hidden">
              <LiveGpsPlacesMap
                userCoords={userCoords}
                userAreaName={userAreaName}
                places={filteredPlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={(id) => setSelectedPlaceId(id)}
              />

              {/* Your Location Pill Overlay */}
              <div className="absolute top-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DED3C7] shadow-md flex items-center gap-2 text-[11.5px] font-bold text-[#241F1B] pointer-events-none z-[1000]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3569A8] animate-pulse" />
                <span>Your Location: {userAreaName}</span>
              </div>

              {/* Direct Google Maps Link */}
              <a
                href={`https://www.google.com/maps/search/mall+or+parking/@${userCoords.lat},${userCoords.lng},14z`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-[#FFFFFF] hover:bg-[#F3EAE0] px-3.5 py-1.5 rounded-xl border border-[#DED3C7] shadow-md flex items-center gap-1.5 text-[11.5px] font-bold text-[#C93B2F] transition-all cursor-pointer z-[1000]"
              >
                <span>Open in Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Place Details & Direct Navigation (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {isLoadingPlaces ? (
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 shadow-[0_8px_24px_rgba(70,48,35,0.06)] min-h-[380px]">
              <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin" />
              <h3 className="text-[16px] font-bold text-[#241F1B]">Finding Nearby Places...</h3>
              <p className="text-[12.5px] text-[#70675F] max-w-[280px]">
                Searching shopping malls, retail centers, and parking facilities around {userAreaName}.
              </p>
            </div>
          ) : selectedPlace ? (
            /* Selected Place Card */
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DED3C7]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded">
                    {selectedPlace.category}
                  </span>
                  <h3 className="text-[19px] font-black text-[#241F1B] mt-1 tracking-tight">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-[12.5px] text-[#70675F] mt-0.5 line-clamp-2">{selectedPlace.address}</p>
                </div>

                <span
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                    selectedPlace.status === "available"
                      ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                      : selectedPlace.status === "limited"
                      ? "bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30"
                      : "bg-[#C93B2F]/10 text-[#C93B2F] border-[#C93B2F]/30"
                  }`}
                >
                  {selectedPlace.status === "available"
                    ? "AVAILABLE"
                    : selectedPlace.status === "limited"
                    ? "LIMITED"
                    : "FULL"}
                </span>
              </div>

              {/* Distance & ETA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[11px] text-[#70675F] block">Distance</span>
                  <span className="text-[18px] font-black text-[#241F1B] font-mono">
                    {selectedPlace.distanceKm} km
                  </span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[11px] text-[#70675F] block">Driving Time</span>
                  <span className="text-[18px] font-black text-[#2F7D5A] flex items-center gap-1 font-mono">
                    ~{selectedPlace.driveTimeMin} min
                  </span>
                </div>
              </div>

              {/* Available Spaces */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-[#70675F]">Available Parking Spaces:</span>
                  <span className="font-mono font-bold text-[#241F1B]">
                    {selectedPlace.availableSpaces} / {selectedPlace.totalCapacity} Spaces Free
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full border border-[#DED3C7] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedPlace.status === "available"
                        ? "bg-[#2F7D5A]"
                        : selectedPlace.status === "limited"
                        ? "bg-[#B7791F]"
                        : "bg-[#C93B2F]"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          10,
                          ((selectedPlace.totalCapacity - selectedPlace.availableSpaces) /
                            selectedPlace.totalCapacity) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* EV Charging */}
              <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#DED3C7] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12.5px] text-[#241F1B] font-bold">
                  <Zap className="w-4 h-4 text-[#3569A8]" />
                  <span>EV Fast Charging Station</span>
                </div>
                <span className="font-bold text-[12px] text-[#3569A8]">
                  {selectedPlace.evChargersAvailable > 0
                    ? `${selectedPlace.evChargersAvailable} Chargers Available`
                    : "Standard Parking"}
                </span>
              </div>

              {/* Google Maps Action Button */}
              <a
                href={selectedPlace.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <Navigation className="w-4.5 h-4.5" />
                <span>Start Google Maps Navigation</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-8 text-center text-[#70675F]">
              <p>No places found matching your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── ALL SURROUNDING PLACES LIST ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-4.5 h-4.5 text-[#C93B2F]" />
            <h3 className="text-[16px] font-bold text-[#241F1B]">
              All Surrounding Places Near You
            </h3>
          </div>
          <span className="text-[12px] text-[#70675F]">
            Ranked by nearest distance
          </span>
        </div>

        {isLoadingPlaces ? (
          <div className="p-8 text-center text-[#70675F] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#C93B2F]" />
            <span>Finding surrounding places...</span>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="p-8 text-center text-[#70675F]">
            No places found matching your filter. Click &ldquo;Update Location&rdquo; to re-scan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPlaces.map((place, rank) => {
              const isSelected = place.id === selectedPlaceId;
              const isFull = place.status === "full";

              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#C93B2F] shadow-xs ring-2 ring-[#C93B2F]"
                      : "bg-[#FFFFFF] border-[#DED3C7] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black uppercase text-[#C93B2F] bg-[#F9E3DE] px-1.5 py-0.5 rounded">
                          #{rank + 1}
                        </span>
                        <span className="text-[11px] font-bold text-[#70675F]">
                          {place.category}
                        </span>
                      </div>
                      <h4 className="text-[14.5px] font-bold text-[#241F1B] line-clamp-1">
                        {place.name}
                      </h4>
                      <p className="text-[11.5px] text-[#70675F] line-clamp-1 mt-0.5">
                        {place.address}
                      </p>
                    </div>

                    <span
                      className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isFull
                          ? "bg-[#C93B2F]/10 text-[#C93B2F]"
                          : "bg-[#2F7D5A]/10 text-[#2F7D5A]"
                      }`}
                    >
                      {isFull ? "FULL" : `${place.availableSpaces} Free`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[12px] pt-2 border-t border-[#DED3C7]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#241F1B]">
                        {place.distanceKm} km
                      </span>
                      <span className="text-[#70675F]">· ~{place.driveTimeMin} min</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#3569A8]">
                      {place.evChargersAvailable > 0
                        ? `⚡ ${place.evChargersAvailable} EV`
                        : "Standard"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
