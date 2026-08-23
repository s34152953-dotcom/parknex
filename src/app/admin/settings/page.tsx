"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface MallParkingHub {
  id: string;
  name: string;
  category: string;
  address: string;
  distanceKm: number;
  driveTimeMin: number;
  trafficStatus: "fast" | "moderate" | "heavy";
  totalCapacity: number;
  availableSpaces: number;
  evChargersAvailable: number;
  status: "available" | "limited" | "full";
  lat: number;
  lng: number;
  xPercent: number; // For interactive visual map placement
  yPercent: number;
  floors: { name: string; free: number; total: number }[];
  googleMapsUrl: string;
}

const NEARBY_MALLS: MallParkingHub[] = [
  {
    id: "central-mall-grand",
    name: "Central Mall Grand",
    category: "Shopping & Dining Complex",
    address: "MG Road Sector 4, Central District",
    distanceKm: 0.8,
    driveTimeMin: 3,
    trafficStatus: "fast",
    totalCapacity: 120,
    availableSpaces: 45,
    evChargersAvailable: 6,
    status: "available",
    lat: 19.076,
    lng: 72.8777,
    xPercent: 48,
    yPercent: 46,
    floors: [
      { name: "Basement 1 (Zone A & B)", free: 24, total: 60 },
      { name: "Basement 2 (Zone C)", free: 15, total: 40 },
      { name: "EV Fast Charging Deck", free: 6, total: 20 },
    ],
    googleMapsUrl: "https://maps.google.com/?q=Central+Mall+Grand",
  },
  {
    id: "phoenix-galleria",
    name: "Phoenix Galleria Mall",
    category: "Premium Retail Hub",
    address: "Plot 18, Expressway North Corridor",
    distanceKm: 2.3,
    driveTimeMin: 7,
    trafficStatus: "moderate",
    totalCapacity: 250,
    availableSpaces: 14,
    evChargersAvailable: 2,
    status: "limited",
    lat: 19.088,
    lng: 72.892,
    xPercent: 74,
    yPercent: 28,
    floors: [
      { name: "Lower Ground Multi-Level", free: 8, total: 120 },
      { name: "Basement Level 1", free: 4, total: 80 },
      { name: "EV Hub Deck", free: 2, total: 50 },
    ],
    googleMapsUrl: "https://maps.google.com/?q=Phoenix+Galleria+Mall",
  },
  {
    id: "inorbit-retail-center",
    name: "Inorbit Retail Center",
    category: "Hypermarket & Multiplex",
    address: "Linking Road West, Commercial Zone",
    distanceKm: 3.1,
    driveTimeMin: 11,
    trafficStatus: "heavy",
    totalCapacity: 180,
    availableSpaces: 0,
    evChargersAvailable: 0,
    status: "full",
    lat: 19.062,
    lng: 72.855,
    xPercent: 24,
    yPercent: 68,
    floors: [
      { name: "B1 General Parking", free: 0, total: 100 },
      { name: "B2 General Parking", free: 0, total: 80 },
    ],
    googleMapsUrl: "https://maps.google.com/?q=Inorbit+Retail+Center",
  },
  {
    id: "nexus-commercial-hub",
    name: "Nexus City Center",
    category: "Metro Transit & Lifestyle Mall",
    address: "Station Road, Metro Gate 2",
    distanceKm: 1.6,
    driveTimeMin: 5,
    trafficStatus: "fast",
    totalCapacity: 300,
    availableSpaces: 88,
    evChargersAvailable: 12,
    status: "available",
    lat: 19.082,
    lng: 72.868,
    xPercent: 36,
    yPercent: 32,
    floors: [
      { name: "Floor P1 (Express In)", free: 38, total: 100 },
      { name: "Floor P2 (Standard)", free: 38, total: 120 },
      { name: "EV Supercharging Hub", free: 12, total: 80 },
    ],
    googleMapsUrl: "https://maps.google.com/?q=Nexus+City+Center",
  },
  {
    id: "forum-hypercity",
    name: "Forum Hypercity Mall",
    category: "Entertainment & Shopping Arcade",
    address: "South Ring Road, Exit 12B",
    distanceKm: 4.5,
    driveTimeMin: 14,
    trafficStatus: "moderate",
    totalCapacity: 200,
    availableSpaces: 31,
    evChargersAvailable: 4,
    status: "available",
    lat: 19.055,
    lng: 72.889,
    xPercent: 82,
    yPercent: 78,
    floors: [
      { name: "Basement Level 1", free: 18, total: 100 },
      { name: "Basement Level 2", free: 13, total: 100 },
    ],
    googleMapsUrl: "https://maps.google.com/?q=Forum+Hypercity+Mall",
  },
  {
    id: "metro-transit-parking",
    name: "Metro Central Multi-Level Hub",
    category: "Public Transit Park & Ride",
    address: "Central Terminal Plaza",
    distanceKm: 1.1,
    driveTimeMin: 4,
    trafficStatus: "fast",
    totalCapacity: 400,
    availableSpaces: 112,
    evChargersAvailable: 18,
    status: "available",
    lat: 19.071,
    lng: 72.871,
    xPercent: 58,
    yPercent: 58,
    floors: [
      { name: "Level 1 (Short Stay)", free: 42, total: 120 },
      { name: "Level 2 (Transit Commute)", free: 52, total: 180 },
      { name: "Level 3 (EV & Green)", free: 18, total: 100 },
    ],
    googleMapsUrl: "https://maps.google.com/?q=Metro+Central+Park+and+Ride",
  },
];

export default function AdminSettingsPage() {
  const [selectedMallId, setSelectedMallId] = useState<string>("central-mall-grand");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "available" | "ev" | "near">("all");
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(true);
  const [mapLayer, setMapLayer] = useState<"standard" | "traffic" | "satellite">("standard");

  const selectedMall =
    NEARBY_MALLS.find((m) => m.id === selectedMallId) || NEARBY_MALLS[0];

  const filteredMalls = NEARBY_MALLS.filter((mall) => {
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
              FUTURE IMPLEMENTATIONS
            </span>
            <span className="text-[12px] text-[#70675F]">· City-Wide Multi-Mall Parking Network</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Nearby Malls &amp; Live Google Maps Parking Network
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Planned multi-destination network showing real-time parking space availability across surrounding shopping malls, retail hubs, and transit centers with direct Google Maps navigation.
          </p>
        </div>

        {/* Disabled Planned Control */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] text-[12px] font-bold cursor-not-allowed shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#938980]" />
            <span>Status: Planned Capability</span>
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_4px_16px_rgba(70,48,35,0.04)]">
        <div className="flex items-center gap-3 text-[13px] text-[#70675F]">
          <div className="w-9 h-9 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[#241F1B] block text-[13.5px]">
              Multi-Mall Live Telemetry Concept
            </span>
            <span>
              Connects surrounding shopping malls and public parking structures into a unified real-time availability map with turn-by-turn Google Maps routing.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[12.5px] font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          <span>{isDetailsExpanded ? "Hide Map & Hubs" : "View Live Map & Hubs"}</span>
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
                placeholder="Search nearby malls, retail centers, metro hubs..."
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
                All Malls ({NEARBY_MALLS.length})
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
                Spaces Available
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
                Within 2 km
              </button>
            </div>
          </div>

          {/* ── TWO COLUMN VIEW: INTERACTIVE MAP (LEFT 7 COLS) & MALL DETAILS (RIGHT 5 COLS) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Google Maps Viewport (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#C93B2F]" />
                    <span className="text-[14.5px] font-bold text-[#241F1B]">
                      City Parking Availability Map
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

                {/* ── MAP CANVAS (Interactive Vector / Grid Styled Map) ── */}
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

                    {/* Central Express Ring */}
                    <circle
                      cx="50%"
                      cy="48%"
                      r="130"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="10"
                      strokeDasharray="8 4"
                    />
                  </svg>

                  {/* Current User Location Pulse */}
                  <div className="absolute top-[52%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-[#3569A8]/20 animate-ping absolute" />
                    <div className="w-4 h-4 rounded-full bg-[#3569A8] border-2 border-white shadow-md relative z-10" />
                    <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-extrabold bg-[#241F1B] text-white px-2 py-0.5 rounded shadow">
                      Your Location
                    </span>
                  </div>

                  {/* Interactive Mall Markers on Map */}
                  {filteredMalls.map((mall) => {
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
                          isSelected ? "scale-110 z-30" : "hover:scale-105"
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

                        {/* Pin Label */}
                        <span className="mt-1 text-[10px] font-black bg-white/95 text-[#241F1B] px-2 py-0.5 rounded shadow-sm border border-[#DED3C7] max-w-[120px] truncate">
                          {mall.name}
                        </span>
                      </button>
                    );
                  })}

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
                  <span>Showing <strong>{filteredMalls.length}</strong> nearby parking destinations</span>
                  <span className="font-mono text-[#241F1B]">Live Data Frequency: 10s</span>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Mall Live Availability & Routing (5 Cols) */}
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
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
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

                {/* Live Distance & ETA via Google Maps Traffic */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                    <span className="text-[11px] text-[#70675F] block">Distance from Gate</span>
                    <span className="text-[16px] font-black text-[#241F1B]">
                      {selectedMall.distanceKm} km
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                    <span className="text-[11px] text-[#70675F] block">Google Maps ETA</span>
                    <span className="text-[16px] font-black text-[#2F7D5A] flex items-center gap-1">
                      {selectedMall.driveTimeMin} mins
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
                    Deck &amp; Level Availability
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedMall.floors.map((floor) => (
                      <div
                        key={floor.name}
                        className="flex items-center justify-between text-[12px] p-2 rounded-lg bg-[#FAF7F2] border border-[#DED3C7]"
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

                {/* Google Maps Direct Navigation Action Button */}
                <a
                  href={selectedMall.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[13.5px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open in Google Maps Navigation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* ── PLANNED INTEGRATION ARCHITECTURE & PHASES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phase 1 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-[#2F7D5A] bg-[#2F7D5A]/10 px-2 py-0.5 rounded border border-[#2F7D5A]/20">
                  PHASE 1 · CITY CONNECTIVITY
                </span>
                <h4 className="text-[15px] font-bold text-[#241F1B]">
                  Open Parking Telemetry &amp; Google Maps API
                </h4>
              </div>
              <p className="text-[13px] text-[#70675F] leading-relaxed">
                Aggregates live entry/exit gate barrier telemetry across participating commercial shopping malls, municipal lots, and metro park-and-ride facilities into a centralized Google Maps availability layer.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-[#3569A8] bg-[#3569A8]/10 px-2 py-0.5 rounded border border-[#3569A8]/20">
                  PHASE 2 · PREDICTIVE ROUTING
                </span>
                <h4 className="text-[15px] font-bold text-[#241F1B]">
                  Pre-Arrival Congestion Diversion
                </h4>
              </div>
              <p className="text-[13px] text-[#70675F] leading-relaxed">
                Analyzes live traffic flow and automatically suggests alternate nearby malls with guaranteed available parking spaces before drivers encounter entry gate queues.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
