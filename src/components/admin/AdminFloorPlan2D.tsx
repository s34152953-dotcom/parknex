"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Layers,
  ChevronDown,
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
    if (e.button !== 0) return; // primary button only
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
        fill: "#2563EB", // Blue for Recommended
        stroke: "#3B82F6",
        badgeBg: "#1D4ED8",
        label: "RECOMMENDED",
      };
    }

    switch (slot.status) {
      case "available":
        return {
          fill: "#10B981", // Emerald Green
          stroke: "#34D399",
          badgeBg: "#059669",
          label: "AVAILABLE",
        };
      case "occupied":
        return {
          fill: "#EF4444", // Red
          stroke: "#F87171",
          badgeBg: "#DC2626",
          label: "OCCUPIED",
        };
      case "reserved":
      case "temporarily_held":
        return {
          fill: "#F59E0B", // Amber
          stroke: "#FBBF24",
          badgeBg: "#D97706",
          label: "RESERVED",
        };
      case "maintenance":
        return {
          fill: "#6B7280", // Slate Grey
          stroke: "#9CA3AF",
          badgeBg: "#4B5563",
          label: "MAINTENANCE",
        };
      default:
        return {
          fill: "#10B981",
          stroke: "#34D399",
          badgeBg: "#059669",
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
    <div className="w-full min-h-[380px] sm:min-h-[500px] lg:min-h-[650px] rounded-3xl border border-white/10 bg-[#10151D] overflow-hidden shadow-xl shadow-black/20 flex flex-col relative select-none">
      {/* Top Map Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0D1219] border-b border-white/[0.08] z-10">
        {/* Left: Level Indicator & Compact Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-white/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-[13px]">Floor Plan</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">Level {floor === "ALL" ? "All" : floor}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/[0.08] text-[11px] font-medium text-white/70">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Recommended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" /> Maintenance
            </span>
          </div>
        </div>

        {/* Right: Zoom & Pan Interactive Controls */}
        <div className="flex items-center gap-1.5 bg-[#151B24] border border-white/[0.08] p-1 rounded-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 h-8 rounded-lg flex items-center gap-1 text-[11.5px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Viewport (Supports Pan & Drag) */}
      <div
        className={`flex-1 w-full min-h-[380px] sm:min-h-[440px] lg:min-h-[580px] bg-[#0A0D14] relative overflow-hidden flex items-center justify-center ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full max-h-[640px] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Subtle Grid Background */}
          <defs>
            <pattern id="floor-grid-dense" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            </pattern>
            <linearGradient id="driveway-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(216,74,43,0.08)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(216,74,43,0.08)" />
            </linearGradient>
          </defs>

          <rect width="1000" height="600" fill="url(#floor-grid-dense)" />

          {/* Exterior Boundaries & Floor Zone Outlines */}
          <rect x="40" y="30" width="920" height="540" rx="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

          {/* Central Main Driving Lane */}
          <rect x="60" y="245" width="880" height="110" rx="12" fill="url(#driveway-grad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          
          {/* Center Lane Dashed Divider */}
          <line x1="160" y1="300" x2="840" y2="300" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="12 12" />

          {/* Lane Directional Arrows */}
          <g transform="translate(340, 275)" opacity="0.35">
            <path d="M0 5 L30 5 L30 0 L42 8 L30 16 L30 11 L0 11 Z" fill="#FFFFFF" />
          </g>
          <g transform="translate(620, 315)" opacity="0.35">
            <path d="M42 5 L12 5 L12 0 L0 8 L12 16 L12 11 L42 11 Z" fill="#FFFFFF" />
          </g>

          <text x="500" y="305" fill="rgba(255,255,255,0.22)" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="5">
            CENTRAL DRIVING AISLE · 6.0M CLEARANCE
          </text>

          {/* Entrance: Gate A Inbound */}
          <g transform="translate(50, 255)">
            <rect width="100" height="90" rx="12" fill="#151B24" stroke="#D84A2B" strokeWidth="2" />
            <rect x="0" y="0" width="8" height="90" rx="4" fill="#D84A2B" />
            <text x="54" y="38" fill="#D84A2B" fontSize="12" fontWeight="900" textAnchor="middle">ENTRY</text>
            <text x="54" y="54" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">GATE A</text>
            <text x="54" y="70" fill="rgba(245,247,250,0.5)" fontSize="9" textAnchor="middle">Inbound</text>
          </g>

          {/* Exit: Gate B Outbound Barrier */}
          <g transform="translate(850, 255)">
            <rect width="100" height="90" rx="12" fill="#151B24" stroke="#D84A2B" strokeWidth="2" />
            <rect x="92" y="0" width="8" height="90" rx="4" fill="#D84A2B" />
            <text x="46" y="38" fill="#D84A2B" fontSize="12" fontWeight="900" textAnchor="middle">EXIT</text>
            <text x="46" y="54" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">GATE B</text>
            <text x="46" y="70" fill="rgba(245,247,250,0.5)" fontSize="9" textAnchor="middle">Barrier</text>
          </g>

          {/* Central Lift & Mall Access Lobby */}
          <g transform="translate(420, 45)">
            <rect width="160" height="54" rx="12" fill="#151B24" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <rect x="0" y="0" width="160" height="4" fill="#10B981" rx="2" />
            <text x="80" y="26" fill="#F5F7FA" fontSize="12" fontWeight="bold" textAnchor="middle">MAIN ELEVATOR LOBBY</text>
            <text x="80" y="42" fill="#10B981" fontSize="10" fontWeight="extrabold" textAnchor="middle">Mall Access & Lift 01–04</text>
          </g>

          {/* Zone A Demarcation Banner */}
          <g transform="translate(80, 55)">
            <rect width="110" height="30" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
            <text x="55" y="20" fill="rgba(245,247,250,0.7)" fontSize="11" fontWeight="bold" textAnchor="middle">ZONE A</text>
          </g>

          {/* Zone B Demarcation Banner */}
          <g transform="translate(80, 515)">
            <rect width="110" height="30" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
            <text x="55" y="20" fill="rgba(245,247,250,0.7)" fontSize="11" fontWeight="bold" textAnchor="middle">ZONE B</text>
          </g>

          {/* Render All Parking Slots with Large Readable Dimensions */}
          {filteredSlots.map((slot) => {
            const coords = mapToSvgCoords(slot.positionX, slot.positionZ);
            const style = getSlotStyle(slot);
            const isSelected = selectedSlotId === slot.slotId;
            const isRecommended = recommendedSlotIds.includes(slot.slotId) && slot.status === "available";

            // Large, readable dimensions
            const slotWidth = 86;
            const slotHeight = 82;

            return (
              <g
                key={slot.slotId}
                transform={`translate(${coords.x - slotWidth / 2}, ${coords.y - slotHeight / 2})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot(slot);
                }}
                className="cursor-pointer transition-all duration-150 group"
                role="button"
                tabIndex={0}
                aria-label={`Space ${slot.slotNumber}, Status: ${slot.status}, Pillar: ${slot.pillar}`}
              >
                {/* Selection Outline Glow */}
                {isSelected && (
                  <rect
                    x="-4"
                    y="-4"
                    width={slotWidth + 8}
                    height={slotHeight + 8}
                    rx="14"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                )}

                {/* Primary Slot Card Body */}
                <rect
                  width={slotWidth}
                  height={slotHeight}
                  rx="10"
                  fill={style.fill}
                  stroke={isSelected ? "#FFFFFF" : isRecommended ? "#60A5FA" : style.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                  opacity={isSelected ? 1 : 0.94}
                />

                {/* Pillar Pillar Top Stripe */}
                <rect
                  x="0"
                  y="0"
                  width={slotWidth}
                  height="22"
                  rx="10"
                  fill="rgba(0,0,0,0.22)"
                />

                {/* Pillar Badge Text */}
                <text
                  x={slotWidth / 2}
                  y="15"
                  fill="rgba(255,255,255,0.85)"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {slot.pillar.replace("Pillar ", "P")}
                </text>

                {/* Slot Number Main Text */}
                <text
                  x={slotWidth / 2}
                  y="46"
                  fill="#FFFFFF"
                  fontSize="16"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {slot.slotNumber}
                </text>

                {/* Status Sub-badge */}
                <rect
                  x="8"
                  y="56"
                  width={slotWidth - 16}
                  height="18"
                  rx="5"
                  fill="rgba(0,0,0,0.3)"
                />
                <text
                  x={slotWidth / 2}
                  y="69"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="800"
                  letterSpacing="0.5"
                  textAnchor="middle"
                >
                  {style.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Pan Hint at Bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white/40 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5" />
            Drag map to pan · Click space to inspect &amp; assign
          </span>
          <span className="font-mono text-[10px]">Scale: {(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
