"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
} from "lucide-react";

export interface ParkingSlot2D {
  id?: string;
  slotId: string;
  slotNumber: string;
  floor: string;
  zone: string;
  pillar: string;
  status: "available" | "occupied" | "reserved" | "temporarily_held" | "maintenance";
  positionX: number;
  positionZ: number;
  distanceFromEntrance: number;
  walkingDirections?: string[];
  vehicleConstraints?: {
    maxVehicleSize?: string;
    isEV?: boolean;
    isHandicapped?: boolean;
  };
}

interface AdminFloorPlan2DProps {
  slots: ParkingSlot2D[];
  selectedSlotId: string | null;
  recommendedSlotIds?: string[];
  onSelectSlot: (slot: ParkingSlot2D) => void;
  floor?: string;
  zoneFilter?: string;
}

export default function AdminFloorPlan2D({
  slots,
  selectedSlotId,
  recommendedSlotIds = [],
  onSelectSlot,
  floor = "B2",
  zoneFilter = "ALL",
}: AdminFloorPlan2DProps) {
  // Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Status color mapper using professional standard palette
  const getSlotStyle = (slot: ParkingSlot2D) => {
    const isRecommended = recommendedSlotIds.includes(slot.slotId) && slot.status === "available";
    if (isRecommended) {
      return {
        fill: "#3569A8", // Blue for Recommended
        stroke: "#25538C",
        badgeBg: "#25538C",
        label: "RECOMMENDED",
      };
    }

    switch (slot.status) {
      case "available":
        return {
          fill: "#2F7D5A", // Green
          stroke: "#236346",
          badgeBg: "#236346",
          label: "AVAILABLE",
        };
      case "occupied":
        return {
          fill: "#C93B2F", // Red
          stroke: "#A92E25",
          badgeBg: "#A92E25",
          label: "OCCUPIED",
        };
      case "reserved":
      case "temporarily_held":
        return {
          fill: "#B7791F", // Amber
          stroke: "#975A16",
          badgeBg: "#975A16",
          label: "RESERVED",
        };
      case "maintenance":
        return {
          fill: "#70675F", // Grey
          stroke: "#574E47",
          badgeBg: "#574E47",
          label: "MAINTENANCE",
        };
      default:
        return {
          fill: "#2F7D5A",
          stroke: "#236346",
          badgeBg: "#236346",
          label: "AVAILABLE",
        };
    }
  };

  // Convert layout coordinates to large SVG canvas (1000 x 600)
  const mapToSvgCoords = (x: number, z: number) => {
    const svgX = 500 + x * 26;
    const svgY = 300 + z * 18;
    return { x: svgX, y: svgY };
  };

  const filteredSlots = zoneFilter && zoneFilter !== "ALL"
    ? slots.filter((s) => s.zone === zoneFilter)
    : slots;

  return (
    <div className="w-full min-h-[540px] sm:min-h-[580px] lg:min-h-[660px] rounded-2xl border border-[#DED3C7] bg-[#FFFFFF] overflow-hidden shadow-[0_8px_24px_rgba(70,48,35,0.07)] flex flex-col relative select-none">
      {/* Top Map Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#F3EAE0] border-b border-[#DED3C7] z-10">
        {/* Left: Level Indicator & Compact Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-bold text-[#241F1B]">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px]">Floor Plan</span>
            <span className="text-[#DED3C7]">·</span>
            <span className="text-[#70675F]">Level {floor === "ALL" ? "All" : floor}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[#DED3C7] text-[11.5px] font-semibold text-[#70675F]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D5A]" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3569A8]" /> Recommended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" /> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C93B2F]" /> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#70675F]" /> Maintenance
            </span>
          </div>
        </div>

        {/* Right: Zoom & Pan Interactive Controls */}
        <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#DED3C7] p-1 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70675F] hover:text-[#241F1B] hover:bg-[#F3EAE0] transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70675F] hover:text-[#241F1B] hover:bg-[#F3EAE0] transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 h-8 rounded-lg flex items-center gap-1 text-[12px] font-bold text-[#70675F] hover:text-[#241F1B] hover:bg-[#F3EAE0] transition-colors cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div
        className="relative flex-1 w-full h-full bg-[#FAF7F2] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full min-h-[500px]"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.15s ease-out",
          }}
        >
          {/* Facility Boundary & Grid */}
          <rect x="20" y="20" width="960" height="560" rx="16" fill="#FFFFFF" stroke="#DED3C7" strokeWidth="2" />

          {/* Background Grid Pattern */}
          <defs>
            <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FAF7F2" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="20" y="20" width="960" height="560" fill="url(#lightGrid)" />

          {/* Central Driving Aisle */}
          <rect x="60" y="250" width="880" height="100" rx="8" fill="#F3EAE0" stroke="#DED3C7" strokeWidth="1.5" />
          
          {/* Center Lane Divider Line (Dashed) */}
          <line x1="80" y1="300" x2="920" y2="300" stroke="#CBBCAE" strokeWidth="2" strokeDasharray="12 8" />

          {/* Directional Arrows inside driving lane */}
          <g fill="#938980" opacity="0.6">
            <polygon points="260,280 290,280 290,274 306,284 290,294 290,288 260,288" />
            <polygon points="740,320 710,320 710,314 694,324 710,334 710,328 740,328" />
          </g>

          {/* Entry Gate A Inbound */}
          <g transform="translate(60, 260)">
            <rect x="0" y="0" width="85" height="80" rx="8" fill="#2F7D5A" fillOpacity="0.1" stroke="#2F7D5A" strokeWidth="1.5" />
            <text x="42.5" y="32" fill="#2F7D5A" fontSize="12" fontWeight="900" textAnchor="middle">GATE A</text>
            <text x="42.5" y="52" fill="#241F1B" fontSize="10" fontWeight="700" textAnchor="middle">INBOUND</text>
          </g>

          {/* Exit Gate B Outbound */}
          <g transform="translate(855, 260)">
            <rect x="0" y="0" width="85" height="80" rx="8" fill="#C93B2F" fillOpacity="0.1" stroke="#C93B2F" strokeWidth="1.5" />
            <text x="42.5" y="32" fill="#C93B2F" fontSize="12" fontWeight="900" textAnchor="middle">GATE B</text>
            <text x="42.5" y="52" fill="#241F1B" fontSize="10" fontWeight="700" textAnchor="middle">OUTBOUND</text>
          </g>

          {/* Central Elevator Lobby */}
          <g transform="translate(435, 270)">
            <rect x="0" y="0" width="130" height="60" rx="10" fill="#FFFFFF" stroke="#DED3C7" strokeWidth="1.5" />
            <text x="65" y="26" fill="#241F1B" fontSize="11" fontWeight="800" textAnchor="middle">ELEVATOR LOBBY</text>
            <text x="65" y="44" fill="#70675F" fontSize="9.5" fontWeight="600" textAnchor="middle">Mall Level Access</text>
          </g>

          {/* Zone Labels */}
          <text x="80" y="60" fill="#70675F" fontSize="13" fontWeight="800" letterSpacing="2">ZONE A · NORTH BAY</text>
          <text x="80" y="550" fill="#70675F" fontSize="13" fontWeight="800" letterSpacing="2">ZONE B · SOUTH BAY</text>

          {/* Render Parking Bays */}
          {filteredSlots.map((slot) => {
            const coords = mapToSvgCoords(slot.positionX, slot.positionZ);
            const isSelected = selectedSlotId === slot.slotId;
            const style = getSlotStyle(slot);
            const bayWidth = 86;
            const bayHeight = 82;

            return (
              <g
                key={slot.slotId}
                transform={`translate(${coords.x - bayWidth / 2}, ${coords.y - bayHeight / 2})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot(slot);
                }}
                className="cursor-pointer group"
              >
                {/* Bay Rectangle */}
                <rect
                  x="0"
                  y="0"
                  width={bayWidth}
                  height={bayHeight}
                  rx="10"
                  fill={style.fill}
                  stroke={isSelected ? "#241F1B" : style.stroke}
                  strokeWidth={isSelected ? 3.5 : 1.5}
                  className="transition-all duration-150 group-hover:opacity-90"
                />

                {/* Slot Number Label */}
                <text
                  x={bayWidth / 2}
                  y="26"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {slot.slotNumber}
                </text>

                {/* Pillar Tag */}
                <text
                  x={bayWidth / 2}
                  y="42"
                  fill="#FFFFFF"
                  fillOpacity="0.85"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {slot.pillar || "P01"}
                </text>

                {/* Status Badge Pill */}
                <rect
                  x="6"
                  y="52"
                  width={bayWidth - 12}
                  height="20"
                  rx="6"
                  fill={style.badgeBg}
                  className="pointer-events-none"
                />
                <text
                  x={bayWidth / 2}
                  y="66"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="900"
                  letterSpacing="0.5"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {style.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Navigation Instructions */}
        <div className="absolute bottom-4 left-4 bg-[#FFFFFF]/90 backdrop-blur-md border border-[#DED3C7] rounded-xl px-3 py-1.5 text-[11.5px] font-semibold text-[#70675F] flex items-center gap-2 pointer-events-none shadow-xs">
          <Navigation className="w-3.5 h-3.5 text-[#C93B2F]" />
          <span>Click any space to view details or assign</span>
        </div>
      </div>
    </div>
  );
}
