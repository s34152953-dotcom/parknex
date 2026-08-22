"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Video,
  Camera,
  CarFront,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  Eye,
  ShieldCheck,
  Activity,
  Maximize2,
  Calendar,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import CctvLivePlayer from "@/components/cctv/CctvLivePlayer";

export default function AdminCctvMonitoringPage() {
  const [activeTab, setActiveTab] = useState<"entry" | "floors" | "exit">("entry");
  const [selectedFloor, setSelectedFloor] = useState<string>("B2");
  const [plateSearchInput, setPlateSearchInput] = useState("");
  const [searchedPlate, setSearchedPlate] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Convex Real-Time Queries
  const cameras = useQuery(api.cctv.listCameras, {});
  const overview = useQuery(api.cctv.getCctvOverview, {});
  const recentEvents = useQuery(api.cctv.listRecentCameraEvents, { limit: 25 });
  const vehicleSightings = useQuery(
    api.cctv.getSightingsForPlate,
    searchedPlate ? { plateNumber: searchedPlate, limit: 10 } : "skip"
  );

  const entryCameras = cameras?.filter((c: any) => c.type === "ENTRY") || [];
  const floorCameras = cameras?.filter((c: any) => c.type === "FLOOR") || [];
  const exitCameras = cameras?.filter((c: any) => c.type === "EXIT") || [];

  const activeFloorCameras =
    selectedFloor === "ALL"
      ? floorCameras
      : floorCameras.filter((c: any) => c.floor === selectedFloor);

  const plateDetections =
    recentEvents?.filter((e: any) => e.eventType === "PLATE_DETECTED") || [];
  const occupancyEvents =
    recentEvents?.filter((e: any) => e.eventType === "OCCUPANCY_CHANGED") || [];

  const formatTimeSafe = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? ts : d.toLocaleTimeString("en-IN");
    } catch {
      return ts || "";
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateSearchInput.trim()) return;
    setIsSearching(true);
    setSearchedPlate(plateSearchInput.trim().toUpperCase());
    setTimeout(() => setIsSearching(false), 300);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              INTELLIGENT SURVEILLANCE
            </span>
            <span className="text-[12px] text-[#70675F]">· Real-Time Camera Telemetry</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            CCTV Monitoring &amp; ANPR Control
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Real-time IP camera feeds, license plate recognition events, space occupancy tracking, and vehicle search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DED3C7] text-[12.5px] font-bold text-[#241F1B] shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                (overview?.onlineCameras ?? 0) > 0 ? "bg-[#2F7D5A] animate-pulse" : "bg-[#70675F]"
              }`}
            />
            <span>
              {overview?.onlineCameras ?? 0} / {overview?.totalCameras ?? 0} Cameras Active
            </span>
          </div>
        </div>
      </div>

      {/* ── TOP STAT METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cameras */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.05)]">
          <div className="flex items-center justify-between text-[#70675F]">
            <span className="text-[12px] font-bold uppercase tracking-wider">CCTV Feeds</span>
            <Camera className="w-4 h-4 text-[#C93B2F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[24px] sm:text-[28px] font-black text-[#241F1B]">
              {overview?.totalCameras ?? 0}
            </span>
            <span className="text-[11.5px] font-semibold text-[#70675F]">configured</span>
          </div>
        </div>

        {/* Online Status */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.05)]">
          <div className="flex items-center justify-between text-[#70675F]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Online Streams</span>
            <Activity className="w-4 h-4 text-[#2F7D5A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[24px] sm:text-[28px] font-black text-[#2F7D5A]">
              {overview?.onlineCameras ?? 0}
            </span>
            <span className="text-[11.5px] font-semibold text-[#70675F]">streaming</span>
          </div>
        </div>

        {/* Monitored Spaces */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.05)]">
          <div className="flex items-center justify-between text-[#70675F]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Monitored Bays</span>
            <Layers className="w-4 h-4 text-[#3569A8]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[24px] sm:text-[28px] font-black text-[#3569A8]">
              {overview?.monitoredSpaces ?? 0}
            </span>
            <span className="text-[11.5px] font-semibold text-[#70675F]">spaces</span>
          </div>
        </div>

        {/* Total Detections */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.05)]">
          <div className="flex items-center justify-between text-[#70675F]">
            <span className="text-[12px] font-bold uppercase tracking-wider">Recent Events</span>
            <ShieldCheck className="w-4 h-4 text-[#B7791F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[24px] sm:text-[28px] font-black text-[#241F1B]">
              {overview?.recentEventsCount ?? 0}
            </span>
            <span className="text-[11.5px] font-semibold text-[#70675F]">verified</span>
          </div>
        </div>
      </div>

      {/* ── LAST-SEEN VEHICLE SEARCH STRIP ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 shadow-[0_8px_24px_rgba(70,48,35,0.06)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4.5 h-4.5 text-[#C93B2F]" />
            <h3 className="text-[15px] font-bold text-[#241F1B]">Last-Seen Vehicle Sighting Search</h3>
          </div>
          <span className="text-[11.5px] text-[#70675F]">Search multi-camera ANPR history</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={plateSearchInput}
              onChange={(e) => setPlateSearchInput(e.target.value)}
              placeholder="Enter registration plate (e.g. KA01MJ2026 or MH02AB1234)"
              className="w-full bg-[#FAF7F2] border border-[#DED3C7] rounded-xl px-4 py-2.5 text-[14px] font-mono text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
            />
          </div>
          <button
            type="submit"
            disabled={!plateSearchInput.trim() || isSearching}
            className="h-11 px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] disabled:opacity-50 text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Sightings</span>
          </button>
        </form>

        {/* Search Results Display */}
        {searchedPlate && (
          <div className="pt-3 border-t border-[#DED3C7] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-bold text-[#241F1B]">
                Sightings for <code className="text-[#C93B2F] font-mono">{searchedPlate}</code>:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchedPlate("");
                  setPlateSearchInput("");
                }}
                className="text-[11.5px] text-[#70675F] hover:text-[#C93B2F] font-bold cursor-pointer"
              >
                Clear Search
              </button>
            </div>

            {vehicleSightings === undefined ? (
              <div className="py-4 text-center text-[12.5px] text-[#70675F] animate-pulse">
                Searching camera logs...
              </div>
            ) : vehicleSightings.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-[#70675F] bg-[#FAF7F2] rounded-xl border border-[#DED3C7]">
                No camera sightings recorded for vehicle <strong>{searchedPlate}</strong>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicleSightings.map((s: any) => (
                  <div
                    key={s._id}
                    className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col gap-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#3569A8]/10 text-[#3569A8] border border-[#3569A8]/20">
                        {s.sightingType} SIGHTING
                      </span>
                      <span className="text-[11px] text-[#70675F] font-mono">
                        {formatTimeSafe(s.timestamp)}
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-[#241F1B]">{s.cameraName}</div>
                    <div className="flex items-center justify-between text-[11.5px] text-[#70675F]">
                      <span>
                        Floor {s.floor} · {s.zone} {s.slotId ? `· Space ${s.slotId}` : ""}
                      </span>
                      <span className="font-bold text-[#2F7D5A]">
                        {(s.confidence * 100).toFixed(1)}% Conf
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3-TAB CAMERA WORKSPACE ── */}
      <div className="flex flex-col gap-5">
        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 bg-[#F3EAE0] p-1.5 rounded-2xl border border-[#DED3C7] self-start">
          <button
            type="button"
            onClick={() => setActiveTab("entry")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === "entry"
                ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs border border-[#DED3C7]"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <CarFront className={`w-4 h-4 ${activeTab === "entry" ? "text-[#C93B2F]" : ""}`} />
            <span>Entry Cameras ({entryCameras.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("floors")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === "floors"
                ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs border border-[#DED3C7]"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === "floors" ? "text-[#C93B2F]" : ""}`} />
            <span>Parking Floors ({floorCameras.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("exit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === "exit"
                ? "bg-[#FFFFFF] text-[#241F1B] shadow-xs border border-[#DED3C7]"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === "exit" ? "text-[#C93B2F]" : ""}`} />
            <span>Exit Cameras ({exitCameras.length})</span>
          </button>
        </div>

        {/* ── TAB 1: ENTRY CAMERAS ── */}
        {activeTab === "entry" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Camera Previews (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {entryCameras.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
                  <Camera className="w-10 h-10 text-[#70675F]" />
                  <h3 className="text-[16px] font-bold text-[#241F1B]">Camera not configured</h3>
                  <p className="text-[13px] text-[#70675F] max-w-[340px]">
                    No entry gate camera is configured. Set up Gate A ANPR in{" "}
                    <code className="text-[#241F1B] font-mono">cameras_config.json</code>.
                  </p>
                </div>
              ) : (
                entryCameras.map((cam: any) => (
                  <CctvLivePlayer
                    key={cam._id}
                    cameraId={cam.cameraId}
                    cameraName={cam.name}
                    status={cam.status}
                    fps={cam.fps}
                    webrtcUrl={cam.webrtcUrl}
                    hlsUrl={cam.hlsUrl}
                  />
                ))
              )}
            </div>

            {/* Real-time Plate Detections Table (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
                  <div className="flex items-center gap-2">
                    <CarFront className="w-4 h-4 text-[#C93B2F]" />
                    <h3 className="text-[14.5px] font-bold text-[#241F1B]">Latest ANPR Detections</h3>
                  </div>
                  <span className="text-[11px] text-[#70675F]">Real-time OCR</span>
                </div>

                {plateDetections.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-[#70675F]">
                    No plate detection events recorded yet.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-[#DED3C7] max-h-[460px] overflow-y-auto">
                    {plateDetections.map((evt: any) => (
                      <div key={evt._id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[14.5px] font-bold text-[#241F1B]">
                            {evt.plateNumber || "NO_PLATE"}
                          </span>
                          <span className="text-[11px] text-[#70675F]">
                            {evt.cameraId} · {formatTimeSafe(evt.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                              (evt.confidence ?? 0) >= 0.75
                                ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                                : "bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30"
                            }`}
                          >
                            {((evt.confidence ?? 0) * 100).toFixed(1)}% Conf
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PARKING FLOORS ── */}
        {activeTab === "floors" && (
          <div className="flex flex-col gap-5">
            {/* Floor Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-bold text-[#70675F]">Floor:</span>
              {["B2", "B1", "G", "ALL"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFloor(f)}
                  className={`px-3 py-1 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer ${
                    selectedFloor === f
                      ? "bg-[#C93B2F] text-white shadow-xs"
                      : "bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] hover:bg-[#F3EAE0]"
                  }`}
                >
                  Floor {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Floor Camera Feed (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {activeFloorCameras.length === 0 ? (
                  <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
                    <Camera className="w-10 h-10 text-[#70675F]" />
                    <h3 className="text-[16px] font-bold text-[#241F1B]">Camera not configured</h3>
                    <p className="text-[13px] text-[#70675F] max-w-[340px]">
                      No overhead CCTV stream configured for Floor {selectedFloor}. Configure camera in{" "}
                      <code className="text-[#241F1B] font-mono">cameras_config.json</code>.
                    </p>
                  </div>
                ) : (
                  activeFloorCameras.map((cam: any) => (
                    <CctvLivePlayer
                      key={cam._id}
                      cameraId={cam.cameraId}
                      cameraName={cam.name}
                      status={cam.status}
                      fps={cam.fps}
                      webrtcUrl={cam.webrtcUrl}
                      hlsUrl={cam.hlsUrl}
                      showPolygonsDefault={true}
                    />
                  ))
                )}
              </div>

              {/* Space Occupancy Change Log (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#3569A8]" />
                      <h3 className="text-[14.5px] font-bold text-[#241F1B]">Occupancy Transitions</h3>
                    </div>
                    <span className="text-[11px] text-[#70675F]">Polygon Tracked</span>
                  </div>

                  {occupancyEvents.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-[#70675F]">
                      No space occupancy transitions detected.
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-[#DED3C7] max-h-[460px] overflow-y-auto">
                      {occupancyEvents.map((evt: any) => (
                        <div key={evt._id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-[14px] font-bold text-[#241F1B]">
                              Space {evt.slotId?.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-[#70675F]">
                              Floor {evt.floor} · {evt.zone} · {formatTimeSafe(evt.timestamp)}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                              evt.occupancyStatus === "available"
                                ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                                : "bg-[#C93B2F]/10 text-[#C93B2F] border-[#C93B2F]/30"
                            }`}
                          >
                            {evt.occupancyStatus === "available" ? "FREE" : "OCCUPIED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: EXIT CAMERAS ── */}
        {activeTab === "exit" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-4">
              {exitCameras.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
                  <Camera className="w-10 h-10 text-[#70675F]" />
                  <h3 className="text-[16px] font-bold text-[#241F1B]">Camera not configured</h3>
                  <p className="text-[13px] text-[#70675F] max-w-[340px]">
                    No exit gate camera configured. Configure Gate B ANPR stream in{" "}
                    <code className="text-[#241F1B] font-mono">cameras_config.json</code>.
                  </p>
                </div>
              ) : (
                exitCameras.map((cam: any) => (
                  <CctvLivePlayer
                    key={cam._id}
                    cameraId={cam.cameraId}
                    cameraName={cam.name}
                    status={cam.status}
                    fps={cam.fps}
                    webrtcUrl={cam.webrtcUrl}
                    hlsUrl={cam.hlsUrl}
                  />
                ))
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2F7D5A]" />
                    <h3 className="text-[14.5px] font-bold text-[#241F1B]">Outbound Gate Verification</h3>
                  </div>
                  <span className="text-[11px] text-[#70675F]">Gate B Barrier</span>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DED3C7] flex flex-col gap-2 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-[#70675F]">Automatic Barrier Clearance:</span>
                    <span className="font-bold text-[#2F7D5A]">ENABLED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70675F]">Plate Mismatch Operator Prompt:</span>
                    <span className="font-bold text-[#241F1B]">ACTIVE</span>
                  </div>
                  <p className="text-[#70675F] text-[11.5px] mt-1 pt-2 border-t border-[#DED3C7]">
                    Exit ANPR camera compares outbound plate against the verified QR exit pass token. If plates match, barrier lifts automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
