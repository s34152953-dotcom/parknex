"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Car,
  Zap,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpRight,
  Building2,
  Crosshair,
  RefreshCw,
  LocateFixed,
  Route as RouteIcon,
  Loader2,
} from "lucide-react";

interface RealPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  trafficStatus: "fast" | "moderate" | "heavy";
  totalCapacity: number;
  availableSpaces: number;
  evChargersAvailable: number;
  status: "available" | "limited" | "full";
  googleMapsUrl: string;
}

export default function AdminSettingsPage() {
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied" | "unsupported">(
    "locating"
  );
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 19.076, // Default fallback coordinates
    lng: 72.8777,
    accuracy: 10,
  });
  const [userAreaName, setUserAreaName] = useState<string>("Locating area...");
  const [places, setPlaces] = useState<RealPlace[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "available" | "ev" | "near">("all");
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(true);
  const [mapLayer, setMapLayer] = useState<"map" | "satellite">("map");

  // Fetch real nearby places around coordinates
  const fetchNearbyRealPlaces = useCallback(async (lat: number, lng: number) => {
    setIsLoadingPlaces(true);
    try {
      const res = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=8000`);
      if (res.ok) {
        const data = await res.json();
        if (data.userLocationName) {
          setUserAreaName(data.userLocationName);
        }
        if (data.places && data.places.length > 0) {
          setPlaces(data.places);
          setSelectedPlaceId((prev) => (prev ? prev : data.places[0].id));
        } else {
          setPlaces([]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch nearby real places:", err);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  // Acquire live GPS location and trigger real places fetch
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
        // Still fetch places for fallback coordinates
        fetchNearbyRealPlaces(userCoords.lat, userCoords.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000,
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
    if (filterType === "near") return place.distanceKm <= 3.0;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              LIVE GPS PLACES &amp; PARKING
            </span>
            <span className="text-[12px] text-[#70675F]">
              · {userAreaName} ({userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°)
            </span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Nearest Malls &amp; Real Google Maps Parking
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Real GPS device location detecting actual nearby shopping malls, retail hubs, and public parking facilities around your current location with live Google Maps routing.
          </p>
        </div>

        {/* GPS Status & Refresh Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
                ? `GPS Locked (±${userCoords.accuracy}m)`
                : gpsStatus === "locating"
                ? "Acquiring GPS Spot..."
                : "Location Access Required"}
            </span>
          </div>

          <button
            type="button"
            onClick={acquireExactGpsLocation}
            disabled={isLoadingPlaces}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[12px] font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-[#C93B2F] ${isLoadingPlaces ? "animate-spin" : ""}`} />
            <span>Update My GPS Location</span>
          </button>
        </div>
      </div>

      {/* GPS Location & Live Search Banner */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(70,48,35,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#241F1B] text-[14px]">
                {gpsStatus === "active" ? `Live Spot: ${userAreaName}` : "Location Spot"}
              </span>
              <span className="text-[11px] font-mono font-bold bg-[#FAF7F2] text-[#70675F] px-2 py-0.5 rounded border border-[#DED3C7]">
                {userCoords.lat.toFixed(5)}° N, {userCoords.lng.toFixed(5)}° E
              </span>
            </div>
            <p className="text-[12.5px] text-[#70675F] mt-0.5">
              Showing real, live shopping malls and parking facilities around your coordinates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[12.5px] font-bold transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
        >
          <span>{isDetailsExpanded ? "Hide Map & Places" : "View Map & Places"}</span>
          {isDetailsExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#70675F]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#70675F]" />
          )}
        </button>
      </div>

      {isDetailsExpanded && (
        <div className="flex flex-col gap-6">
          {/* ── SEARCH & FILTER CONTROLS ── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#DED3C7] shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#938980] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real nearby malls, shopping plazas, parking decks..."
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
                All Real Places ({places.length})
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
                EV Fast Charging
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
                Within 3 km
              </button>
            </div>
          </div>

          {/* ── TWO COLUMN VIEW: REAL MAP (7 COLS) & SELECTED PLACE DOSSIER (5 COLS) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Embedded Real Map Viewport (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#C93B2F]" />
                    <span className="text-[14.5px] font-bold text-[#241F1B]">
                      Real GPS Map · Centered on Your Location
                    </span>
                  </div>

                  {/* Layer Toggle */}
                  <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#DED3C7] text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setMapLayer("map")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        mapLayer === "map"
                          ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs"
                          : "text-[#70675F]"
                      }`}
                    >
                      Street Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapLayer("satellite")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        mapLayer === "satellite"
                          ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs"
                          : "text-[#70675F]"
                      }`}
                    >
                      Terrain / Aerial
                    </button>
                  </div>
                </div>

                {/* ── REAL OPENSTREETMAP / GOOGLE MAPS EMBED VIEW ── */}
                <div className="relative w-full h-[420px] sm:h-[480px] bg-[#E8E2D9] rounded-xl border border-[#DED3C7] overflow-hidden">
                  {/* Real OpenStreetMap Live Frame centered on user's exact coordinates */}
                  <iframe
                    title="Real GPS Map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.04}%2C${userCoords.lat - 0.03}%2C${userCoords.lng + 0.04}%2C${userCoords.lat + 0.03}&layer=${mapLayer === "satellite" ? "C" : "mapnik"}&marker=${userCoords.lat}%2C${userCoords.lng}`}
                    className="w-full h-full border-0 filter saturate-[1.1]"
                    loading="lazy"
                  />

                  {/* Overlay GPS Indicator */}
                  <div className="absolute top-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DED3C7] shadow-md flex items-center gap-2 text-[11.5px] font-bold text-[#241F1B] pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3569A8] animate-pulse" />
                    <span>Exact Spot: {userAreaName}</span>
                  </div>

                  {/* Open in Full Google Maps Button Overlay */}
                  <a
                    href={`https://www.google.com/maps/search/parking+or+mall/@${userCoords.lat},${userCoords.lng},14z`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-[#FFFFFF]/95 hover:bg-[#FFFFFF] backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DED3C7] shadow-md flex items-center gap-1.5 text-[11.5px] font-bold text-[#C93B2F] transition-all cursor-pointer"
                  >
                    <span>Open in Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-[12px] text-[#70675F] flex items-center justify-between">
                  <span>
                    Found <strong>{filteredPlaces.length}</strong> real parking hubs near you
                  </span>
                  <span className="font-mono text-[#241F1B]">GPS Geolocation: Live</span>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Place Live Availability & Direct Navigation (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {isLoadingPlaces ? (
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 shadow-[0_8px_24px_rgba(70,48,35,0.06)] min-h-[380px]">
                  <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin" />
                  <h3 className="text-[16px] font-bold text-[#241F1B]">Finding Real Places Near You...</h3>
                  <p className="text-[12.5px] text-[#70675F] max-w-[280px]">
                    Scanning real shopping malls, garages, and parking decks within 8 km of your GPS spot.
                  </p>
                </div>
              ) : selectedPlace ? (
                /* Selected Place Dossier Card */
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DED3C7]">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded">
                        {selectedPlace.category}
                      </span>
                      <h3 className="text-[20px] font-black text-[#241F1B] mt-1 tracking-tight">
                        {selectedPlace.name}
                      </h3>
                      <p className="text-[12.5px] text-[#70675F] mt-0.5">{selectedPlace.address}</p>
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
                        ? "SPACES AVAILABLE"
                        : selectedPlace.status === "limited"
                        ? "LIMITED SPACES"
                        : "PARKING FULL"}
                    </span>
                  </div>

                  {/* Live Real GPS Distance & Driving ETA */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                      <span className="text-[11px] text-[#70675F] block">Exact GPS Distance</span>
                      <span className="text-[18px] font-black text-[#241F1B] font-mono">
                        {selectedPlace.distanceKm} km
                      </span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                      <span className="text-[11px] text-[#70675F] block">Driving ETA</span>
                      <span className="text-[18px] font-black text-[#2F7D5A] flex items-center gap-1 font-mono">
                        {selectedPlace.driveTimeMin} min
                        <span className="text-[10px] font-medium text-[#70675F]">
                          ({selectedPlace.trafficStatus})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Live Capacity Fill Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-[#70675F]">Available Parking Spaces:</span>
                      <span className="font-mono font-bold text-[#241F1B]">
                        {selectedPlace.availableSpaces} / {selectedPlace.totalCapacity} Free
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
                              8,
                              ((selectedPlace.totalCapacity - selectedPlace.availableSpaces) /
                                selectedPlace.totalCapacity) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* EV Fast Charging Availability */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#DED3C7] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12.5px] text-[#241F1B] font-bold">
                      <Zap className="w-4 h-4 text-[#3569A8]" />
                      <span>EV Fast Charging Station</span>
                    </div>
                    <span className="font-bold text-[12px] text-[#3569A8]">
                      {selectedPlace.evChargersAvailable > 0
                        ? `${selectedPlace.evChargersAvailable} Chargers Open`
                        : "Standard Bay Only"}
                    </span>
                  </div>

                  {/* Coordinates & Location Breakdown */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#DED3C7] text-[12px] flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#70675F]">Destination Coordinates:</span>
                      <span className="font-mono font-bold text-[#241F1B]">
                        {selectedPlace.lat.toFixed(4)}°, {selectedPlace.lng.toFixed(4)}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#70675F]">Navigation Origin:</span>
                      <span className="font-bold text-[#2F7D5A]">Your Exact GPS Spot</span>
                    </div>
                  </div>

                  {/* Google Maps Direct Navigation Action Button Starting from User's GPS */}
                  <a
                    href={selectedPlace.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <Navigation className="w-4.5 h-4.5" />
                    <span>Navigate With Google Maps</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-8 text-center text-[#70675F]">
                  <p>No parking places found in this radius. Try widening your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── ALL REAL NEAREST DESTINATIONS LIST RANKED BY GPS DISTANCE ── */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-4.5 h-4.5 text-[#C93B2F]" />
                <h3 className="text-[16px] font-bold text-[#241F1B]">
                  Real Surrounding Places (Ranked from Nearest to Furthest)
                </h3>
              </div>
              <span className="text-[12px] text-[#70675F]">
                Click any place to preview details and start route
              </span>
            </div>

            {filteredPlaces.length === 0 ? (
              <div className="p-8 text-center text-[#70675F]">
                {isLoadingPlaces ? "Scanning places..." : "No places matching your filter."}
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
                          <span className="text-[#70675F]">· ~{place.driveTimeMin} min drive</span>
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
      )}
    </div>
  );
}
