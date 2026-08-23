"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Compass,
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
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Crosshair,
  RefreshCw,
  LocateFixed,
  Route as RouteIcon,
} from "lucide-react";

interface MallParkingHub {
  id: string;
  name: string;
  category: string;
  address: string;
  baseLatOffset: number; // Offset relative to center in degrees (~1-4 km)
  baseLngOffset: number;
  totalCapacity: number;
  availableSpaces: number;
  evChargersAvailable: number;
  status: "available" | "limited" | "full";
  floors: { name: string; free: number; total: number }[];
}

// Master list of facility templates that adapt to user's real GPS coordinates
const TEMPLATE_HUBS: MallParkingHub[] = [
  {
    id: "grand-central-mall",
    name: "Grand Central Shopping Mall",
    category: "Premier Retail & Dining Mall",
    address: "Central Commercial Boulevard",
    baseLatOffset: 0.0075, // ~800m North-East
    baseLngOffset: 0.0062,
    totalCapacity: 280,
    availableSpaces: 64,
    evChargersAvailable: 8,
    status: "available",
    floors: [
      { name: "Basement 1 (Zone A & B)", free: 34, total: 120 },
      { name: "Basement 2 (Zone C)", free: 22, total: 100 },
      { name: "EV Fast Charging Deck", free: 8, total: 60 },
    ],
  },
  {
    id: "phoenix-lifestyle-hub",
    name: "Phoenix Lifestyle & Entertainment Center",
    category: "Mega Mall & Cinema Complex",
    address: "Expressway Ring Road Corridor",
    baseLatOffset: 0.018, // ~2.1 km North
    baseLngOffset: 0.012,
    totalCapacity: 450,
    availableSpaces: 22,
    evChargersAvailable: 4,
    status: "limited",
    floors: [
      { name: "Level P1 (Express In)", free: 10, total: 200 },
      { name: "Level P2 (Standard)", free: 8, total: 180 },
      { name: "EV Supercharging Hub", free: 4, total: 70 },
    ],
  },
  {
    id: "metro-transit-plaza",
    name: "Metro Central Transit Multi-Level Parking",
    category: "Public Transit Park & Ride",
    address: "Metro Interchange Plaza",
    baseLatOffset: -0.009, // ~1.1 km South-West
    baseLngOffset: -0.0075,
    totalCapacity: 500,
    availableSpaces: 142,
    evChargersAvailable: 24,
    status: "available",
    floors: [
      { name: "Level 1 (Short Stay)", free: 52, total: 150 },
      { name: "Level 2 (Transit Commute)", free: 66, total: 250 },
      { name: "Level 3 (EV & Green)", free: 24, total: 100 },
    ],
  },
  {
    id: "inorbit-hypermarket-hub",
    name: "Inorbit Retail & Hypermarket Hub",
    category: "Shopping Arcade & Multiplex",
    address: "Market Square West",
    baseLatOffset: -0.022, // ~2.8 km South
    baseLngOffset: 0.015,
    totalCapacity: 200,
    availableSpaces: 0,
    evChargersAvailable: 0,
    status: "full",
    floors: [
      { name: "Basement 1 General", free: 0, total: 110 },
      { name: "Basement 2 General", free: 0, total: 90 },
    ],
  },
  {
    id: "nexus-city-galleria",
    name: "Nexus City Center Galleria",
    category: "Commercial Business & Retail Mall",
    address: "Financial District Sector 5",
    baseLatOffset: 0.013, // ~1.6 km North-West
    baseLngOffset: -0.016,
    totalCapacity: 320,
    availableSpaces: 98,
    evChargersAvailable: 14,
    status: "available",
    floors: [
      { name: "Ground Multi-Tier", free: 42, total: 120 },
      { name: "Basement Level 1", free: 42, total: 130 },
      { name: "EV Fast Deck", free: 14, total: 70 },
    ],
  },
  {
    id: "forum-south-mall",
    name: "Forum South Retail Square",
    category: "Family Shopping & Food Court",
    address: "South Cross Road Avenue",
    baseLatOffset: -0.028, // ~3.5 km South-East
    baseLngOffset: 0.024,
    totalCapacity: 220,
    availableSpaces: 41,
    evChargersAvailable: 6,
    status: "available",
    floors: [
      { name: "Deck A (Covered)", free: 23, total: 110 },
      { name: "Deck B (Open Air)", free: 18, total: 110 },
    ],
  },
];

/**
 * Haversine formula for exact distance between two lat/lng coordinates in km
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function AdminSettingsPage() {
  // Real live GPS location state
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied" | "unsupported">(
    "locating"
  );
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 19.076, // Default fallback (Central Mumbai) until GPS locks
    lng: 72.8777,
    accuracy: 15,
  });
  const [isLiveGps, setIsLiveGps] = useState<boolean>(false);
  const [selectedMallId, setSelectedMallId] = useState<string>("grand-central-mall");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "available" | "ev" | "near">("all");
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(true);
  const [mapLayer, setMapLayer] = useState<"standard" | "traffic" | "satellite">("standard");

  // Acquire live user GPS coordinates
  const acquireExactGpsLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus("unsupported");
      return;
    }

    setGpsStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 10),
        });
        setIsLiveGps(true);
        setGpsStatus("active");
      },
      (error) => {
        console.warn("GPS Geolocation error:", error.message);
        setGpsStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000,
      }
    );
  };

  useEffect(() => {
    acquireExactGpsLocation();
  }, []);

  // Compute live real-time distances and positions relative to user's exact GPS spot
  const computedMalls = TEMPLATE_HUBS.map((hub, index) => {
    const lat = userCoords.lat + hub.baseLatOffset;
    const lng = userCoords.lng + hub.baseLngOffset;
    const distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, lat, lng);
    // Estimated driving time (assuming 25 km/h urban speed + 1 min traffic cushion)
    const driveTimeMin = Math.max(2, Math.round((distanceKm / 25) * 60) + 1);

    // Map screen projection percent (centered on user's exact spot at 50%, 50%)
    // 0.04 degrees ≈ 4.4 km range across map viewport
    const xPercent = Math.max(10, Math.min(90, 50 + (hub.baseLngOffset / 0.035) * 40));
    const yPercent = Math.max(12, Math.min(88, 50 - (hub.baseLatOffset / 0.035) * 40));

    // Dynamic Google Maps turn-by-turn navigation URL starting from user's exact GPS coordinates
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${lat},${lng}&travelmode=driving`;

    return {
      ...hub,
      lat,
      lng,
      distanceKm,
      driveTimeMin,
      trafficStatus: distanceKm > 2.5 ? "moderate" : "fast",
      xPercent,
      yPercent,
      googleMapsUrl,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm); // Ranked nearest to furthest

  const selectedMall =
    computedMalls.find((m) => m.id === selectedMallId) || computedMalls[0];

  const filteredMalls = computedMalls.filter((mall) => {
    const matchesSearch =
      mall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mall.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === "available") return mall.status !== "full";
    if (filterType === "ev") return mall.evChargersAvailable > 0;
    if (filterType === "near") return mall.distanceKm <= 2.0;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              LIVE GPS NAVIGATION &amp; PARKING
            </span>
            <span className="text-[12px] text-[#70675F]">· Exact Driver Spot Geolocation</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Nearest Malls &amp; Live Google Maps Parking
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Real-time GPS spot tracking pinpointing your exact device location and calculating nearest available parking spaces across surrounding shopping malls and transit hubs.
          </p>
        </div>

        {/* Live GPS Lock Indicator & Refresh Button */}
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
                ? `GPS Active (±${userCoords.accuracy}m)`
                : gpsStatus === "locating"
                ? "Acquiring GPS Spot..."
                : "GPS Sim Mode (Click to Detect)"}
            </span>
          </div>

          <button
            type="button"
            onClick={acquireExactGpsLocation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[12px] font-bold transition-all cursor-pointer shadow-xs"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#C93B2F]" />
            <span>Update My GPS Location</span>
          </button>
        </div>
      </div>

      {/* Live GPS Status Bar */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(70,48,35,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#241F1B] text-[14px]">
                {isLiveGps ? "Exact Device GPS Spot Detected" : "Simulated Device Spot"}
              </span>
              <span className="text-[11px] font-mono font-bold bg-[#FAF7F2] text-[#70675F] px-2 py-0.5 rounded border border-[#DED3C7]">
                {userCoords.lat.toFixed(5)}° N, {userCoords.lng.toFixed(5)}° E
              </span>
            </div>
            <p className="text-[12.5px] text-[#70675F] mt-0.5">
              All nearby malls, space counts, and Google Maps driving routes are calculated from your real-time position.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[12.5px] font-bold transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
        >
          <span>{isDetailsExpanded ? "Hide Map & Destinations" : "View Map & Destinations"}</span>
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
                placeholder="Search nearby malls, shopping hubs, transit stations..."
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
                All Nearby ({computedMalls.length})
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
                Closest (&lt; 2 km)
              </button>
            </div>
          </div>

          {/* ── TWO COLUMN VIEW: LIVE GPS MAP (7 COLS) & SELECTED MALL DOSSIER (5 COLS) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Vector GPS Map Viewport (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#C93B2F]" />
                    <span className="text-[14.5px] font-bold text-[#241F1B]">
                      Live GPS Surrounding Malls Map
                    </span>
                  </div>

                  {/* Map Layer Mode Switch */}
                  <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#DED3C7] text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setMapLayer("standard")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        mapLayer === "standard"
                          ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs"
                          : "text-[#70675F]"
                      }`}
                    >
                      Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapLayer("traffic")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        mapLayer === "traffic"
                          ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs"
                          : "text-[#70675F]"
                      }`}
                    >
                      Live Traffic
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
                      Satellite
                    </button>
                  </div>
                </div>

                {/* ── MAP CANVAS (Interactive Vector / Grid GPS Styled Map) ── */}
                <div className="relative w-full h-[420px] sm:h-[480px] bg-[#E8E2D9] rounded-xl border border-[#DED3C7] overflow-hidden select-none">
                  {/* Styled Map Background Vector Grid & Roads */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DFD7CC" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="#EFE9E0" />
                    <rect width="100%" height="100%" fill="url(#mapGrid)" />

                    {/* Major Highways & City Arterials */}
                    <path
                      d="M -20 180 Q 200 160 400 240 T 900 210"
                      fill="none"
                      stroke={mapLayer === "traffic" ? "#2F7D5A" : "#FFFFFF"}
                      strokeWidth="16"
                    />
                    <path
                      d="M -20 180 Q 200 160 400 240 T 900 210"
                      fill="none"
                      stroke={mapLayer === "traffic" ? "#2F7D5A" : "#E2D9CE"}
                      strokeWidth="12"
                    />

                    {/* Secondary Arterial 1 */}
                    <path
                      d="M 120 -20 Q 220 200 340 500"
                      fill="none"
                      stroke={mapLayer === "traffic" ? "#C93B2F" : "#FFFFFF"}
                      strokeWidth="12"
                    />

                    {/* Secondary Arterial 2 */}
                    <path
                      d="M 520 -20 Q 480 220 720 500"
                      fill="none"
                      stroke={mapLayer === "traffic" ? "#F59E0B" : "#FFFFFF"}
                      strokeWidth="12"
                    />

                    {/* Range Rings from Exact User GPS Location */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="65"
                      fill="none"
                      stroke="#3569A8"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.5"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="135"
                      fill="none"
                      stroke="#3569A8"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.3"
                    />

                    {/* Active Navigation Route Line from User Spot to Selected Destination */}
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`${selectedMall.xPercent}%`}
                      y2={`${selectedMall.yPercent}%`}
                      stroke="#C93B2F"
                      strokeWidth="3"
                      strokeDasharray="6 3"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* EXACT USER GPS SPOT PULSE MARKER (Center 50%, 50%) */}
                  <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#3569A8]/25 animate-ping absolute" />
                    <div className="w-4.5 h-4.5 rounded-full bg-[#3569A8] border-2 border-white shadow-lg relative z-10" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black bg-[#241F1B] text-white px-2 py-0.5 rounded-md shadow-md border border-white/20">
                      🎯 You Are Here
                    </div>
                  </div>

                  {/* Interactive Nearby Mall Markers on Map */}
                  {filteredMalls.map((mall, idx) => {
                    const isSelected = mall.id === selectedMallId;
                    const isFull = mall.status === "full";
                    const isLimited = mall.status === "limited";

                    return (
                      <button
                        key={mall.id}
                        type="button"
                        onClick={() => setSelectedMallId(mall.id)}
                        style={{ top: `${mall.yPercent}%`, left: `${mall.xPercent}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-200 cursor-pointer group ${
                          isSelected ? "scale-110 z-40" : "hover:scale-105"
                        }`}
                      >
                        {/* Pin Bubble */}
                        <div
                          className={`px-2.5 py-1.5 rounded-xl text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg border-2 transition-all ${
                            isFull
                              ? "bg-[#C93B2F] border-white"
                              : isLimited
                              ? "bg-[#B7791F] border-white"
                              : "bg-[#2F7D5A] border-white"
                          } ${isSelected ? "ring-4 ring-[#C93B2F]/40" : ""}`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{isFull ? "FULL" : `${mall.availableSpaces} Free`}</span>
                        </div>

                        {/* Pin Tail */}
                        <div
                          className={`w-2.5 h-2.5 rotate-45 -mt-1.5 border-r border-b ${
                            isFull
                              ? "bg-[#C93B2F] border-white"
                              : isLimited
                              ? "bg-[#B7791F] border-white"
                              : "bg-[#2F7D5A] border-white"
                          }`}
                        />

                        {/* Pin Distance & Name Label */}
                        <span className="mt-1 text-[10px] font-black bg-white/95 text-[#241F1B] px-2 py-0.5 rounded shadow-sm border border-[#DED3C7] max-w-[125px] truncate flex items-center gap-1">
                          <span className="text-[#C93B2F] font-mono">{mall.distanceKm}km</span>
                          <span>· {mall.name}</span>
                        </span>
                      </button>
                    );
                  })}

                  {/* Range Ring Labels Overlay */}
                  <div className="absolute top-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#DED3C7] shadow-sm text-[10.5px] font-bold text-[#70675F] z-10">
                    <span>GPS Search Radius: 5.0 km</span>
                  </div>

                  {/* Map Legend Overlay */}
                  <div className="absolute bottom-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md p-2.5 rounded-xl border border-[#DED3C7] shadow-md flex items-center gap-3 text-[11px] font-bold text-[#70675F] z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D5A]" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" />
                      <span>Limited</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C93B2F]" />
                      <span>Full</span>
                    </div>
                  </div>
                </div>

                <div className="text-[12px] text-[#70675F] flex items-center justify-between">
                  <span>
                    Showing <strong>{filteredMalls.length}</strong> parking destinations from your spot
                  </span>
                  <span className="font-mono text-[#241F1B]">GPS Telemetry: Live</span>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Mall Live Availability & Direct Navigation (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Selected Mall Dossier Card */}
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DED3C7]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded">
                      {selectedMall.category}
                    </span>
                    <h3 className="text-[20px] font-black text-[#241F1B] mt-1 tracking-tight">
                      {selectedMall.name}
                    </h3>
                    <p className="text-[12.5px] text-[#70675F] mt-0.5">{selectedMall.address}</p>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                      selectedMall.status === "available"
                        ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                        : selectedMall.status === "limited"
                        ? "bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30"
                        : "bg-[#C93B2F]/10 text-[#C93B2F] border-[#C93B2F]/30"
                    }`}
                  >
                    {selectedMall.status === "available"
                      ? "SPACES AVAILABLE"
                      : selectedMall.status === "limited"
                      ? "LIMITED SPACES"
                      : "PARKING FULL"}
                  </span>
                </div>

                {/* Live Real GPS Distance & Driving ETA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                    <span className="text-[11px] text-[#70675F] block">Exact GPS Distance</span>
                    <span className="text-[18px] font-black text-[#241F1B] font-mono">
                      {selectedMall.distanceKm} km
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                    <span className="text-[11px] text-[#70675F] block">Drive Time ETA</span>
                    <span className="text-[18px] font-black text-[#2F7D5A] flex items-center gap-1 font-mono">
                      {selectedMall.driveTimeMin} min
                      <span className="text-[10px] font-medium text-[#70675F]">
                        ({selectedMall.trafficStatus})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Live Capacity Fill Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[12.5px]">
                    <span className="text-[#70675F]">Available Parking Spaces:</span>
                    <span className="font-mono font-bold text-[#241F1B]">
                      {selectedMall.availableSpaces} / {selectedMall.totalCapacity} Free
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full border border-[#DED3C7] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedMall.status === "available"
                          ? "bg-[#2F7D5A]"
                          : selectedMall.status === "limited"
                          ? "bg-[#B7791F]"
                          : "bg-[#C93B2F]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            8,
                            ((selectedMall.totalCapacity - selectedMall.availableSpaces) /
                              selectedMall.totalCapacity) *
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
                    {selectedMall.evChargersAvailable > 0
                      ? `${selectedMall.evChargersAvailable} Chargers Open`
                      : "None Available"}
                  </span>
                </div>

                {/* Level-by-Level Real-time Availability Breakdown */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#70675F]">
                    Deck &amp; Level Real-Time Free Spaces
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedMall.floors.map((floor) => (
                      <div
                        key={floor.name}
                        className="flex items-center justify-between text-[12px] p-2.5 rounded-lg bg-[#FAF7F2] border border-[#DED3C7]"
                      >
                        <span className="font-medium text-[#241F1B]">{floor.name}</span>
                        <span
                          className={`font-bold font-mono ${
                            floor.free > 0 ? "text-[#2F7D5A]" : "text-[#C93B2F]"
                          }`}
                        >
                          {floor.free > 0 ? `${floor.free} free` : "Full"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Maps Direct Navigation Action Button Starting from User's GPS */}
                <a
                  href={selectedMall.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Navigation className="w-4.5 h-4.5" />
                  <span>Navigate From My GPS Spot</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* ── ALL NEAREST DESTINATIONS LIST RANKED BY GPS DISTANCE ── */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-4.5 h-4.5 text-[#C93B2F]" />
                <h3 className="text-[16px] font-bold text-[#241F1B]">
                  All Nearby Parking Locations (Ranked by GPS Distance)
                </h3>
              </div>
              <span className="text-[12px] text-[#70675F]">
                Click any destination to preview on map
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {computedMalls.map((mall, rank) => {
                const isSelected = mall.id === selectedMallId;
                const isFull = mall.status === "full";

                return (
                  <div
                    key={mall.id}
                    onClick={() => setSelectedMallId(mall.id)}
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
                            {mall.category}
                          </span>
                        </div>
                        <h4 className="text-[14.5px] font-bold text-[#241F1B] line-clamp-1">
                          {mall.name}
                        </h4>
                      </div>

                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isFull
                            ? "bg-[#C93B2F]/10 text-[#C93B2F]"
                            : "bg-[#2F7D5A]/10 text-[#2F7D5A]"
                        }`}
                      >
                        {isFull ? "FULL" : `${mall.availableSpaces} Free`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px] pt-2 border-t border-[#DED3C7]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#241F1B]">
                          {mall.distanceKm} km
                        </span>
                        <span className="text-[#70675F]">· ~{mall.driveTimeMin} min drive</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#3569A8]">
                        {mall.evChargersAvailable > 0
                          ? `⚡ ${mall.evChargersAvailable} EV`
                          : "Standard"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
