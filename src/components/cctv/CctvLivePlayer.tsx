"use client";

import React, { useState, useEffect, useRef } from "react";
import { Video, AlertCircle, RefreshCw, Eye, EyeOff, Camera, WifiOff } from "lucide-react";

interface CctvLivePlayerProps {
  cameraId: string;
  cameraName: string;
  streamType?: "webrtc" | "hls" | "fallback";
  webrtcUrl?: string;
  hlsUrl?: string;
  status: "ONLINE" | "OFFLINE" | "NOT_CONFIGURED" | "ERROR";
  fps?: number;
  slotPolygons?: Array<{
    slotId: string;
    polygon: Array<[number, number]>;
    status?: "available" | "occupied" | "maintenance";
  }>;
  showPolygonsDefault?: boolean;
}

export default function CctvLivePlayer({
  cameraId,
  cameraName,
  streamType = "hls",
  webrtcUrl,
  hlsUrl,
  status,
  fps = 0,
  slotPolygons = [],
  showPolygonsDefault = true,
}: CctvLivePlayerProps) {
  const [showPolygons, setShowPolygons] = useState(showPolygonsDefault);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (status !== "ONLINE" || (!webrtcUrl && !hlsUrl)) {
      setIsPlaying(false);
      return;
    }

    setVideoError(false);
    const video = videoRef.current;
    if (!video) return;

    // HLS Stream Playback using native video / HLS
    if (hlsUrl) {
      video.src = hlsUrl;
      video.play().catch(() => {
        // Autoplay may be restricted
      });
    }
  }, [status, hlsUrl, webrtcUrl]);

  return (
    <div className="relative w-full aspect-video bg-[#1C1917] rounded-2xl overflow-hidden border border-[#DED3C7] shadow-inner select-none flex flex-col items-center justify-center">
      {/* Top Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[12px] font-bold pointer-events-auto">
          <span
            className={`w-2 h-2 rounded-full ${
              status === "ONLINE" ? "bg-[#2F7D5A] animate-pulse" : "bg-[#C93B2F]"
            }`}
          />
          <span className="truncate max-w-[200px]">{cameraName}</span>
          {status === "ONLINE" && fps > 0 && (
            <span className="text-[10.5px] text-stone-300 font-mono">({fps} FPS)</span>
          )}
        </div>

        {slotPolygons.length > 0 && status === "ONLINE" && (
          <button
            type="button"
            onClick={() => setShowPolygons(!showPolygons)}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[12px] font-bold transition-colors cursor-pointer pointer-events-auto shadow-xs"
          >
            {showPolygons ? <EyeOff className="w-3.5 h-3.5 text-[#C93B2F]" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPolygons ? "Hide Bays" : "Show Bays"}</span>
          </button>
        )}
      </div>

      {/* Video Element for Active Stream */}
      {status === "ONLINE" && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          onPlaying={() => setIsPlaying(true)}
          onError={() => setVideoError(true)}
        />
      )}

      {/* SVG Canvas for Parking Bay Polygon Overlays */}
      {status === "ONLINE" && showPolygons && Array.isArray(slotPolygons) && slotPolygons.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {slotPolygons.map((slot) => {
            if (!slot || !Array.isArray(slot.polygon) || slot.polygon.length === 0) return null;
            const pointsStr = slot.polygon
              .filter((p) => Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]))
              .map(([x, y]) => `${x * 100},${y * 100}`)
              .join(" ");

            if (!pointsStr) return null;

            const isOccupied = slot.status === "occupied";
            const strokeColor = isOccupied ? "#C93B2F" : "#2F7D5A";
            const fillColor = isOccupied ? "rgba(201, 59, 47, 0.25)" : "rgba(47, 125, 90, 0.20)";

            // Calculate center for label
            const validPoints = slot.polygon.filter((p) => Array.isArray(p) && p.length >= 2);
            const avgX = validPoints.reduce((acc, p) => acc + p[0], 0) / (validPoints.length || 1);
            const avgY = validPoints.reduce((acc, p) => acc + p[1], 0) / (validPoints.length || 1);

            return (
              <g key={slot.slotId || Math.random().toString()}>
                <polygon
                  points={pointsStr}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="0.8"
                  strokeDasharray={isOccupied ? "none" : "2,1"}
                />
                <text
                  x={avgX * 100}
                  y={avgY * 100}
                  fill="#FFFFFF"
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {(slot.slotId || "").toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Status Screen: Not Configured */}
      {status === "NOT_CONFIGURED" && (
        <div className="flex flex-col items-center justify-center p-6 text-center text-stone-400 gap-2">
          <Camera className="w-10 h-10 text-stone-500" />
          <h4 className="text-[14.5px] font-bold text-stone-200">Camera not configured</h4>
          <p className="text-[12px] text-stone-400 max-w-[280px]">
            No RTSP camera feed is configured for {cameraName}. Configure RTSP URL in{" "}
            <code className="text-stone-300 font-mono text-[11px]">cameras_config.json</code>.
          </p>
        </div>
      )}

      {/* Status Screen: Offline */}
      {status === "OFFLINE" && (
        <div className="flex flex-col items-center justify-center p-6 text-center text-stone-400 gap-2">
          <WifiOff className="w-10 h-10 text-[#C93B2F]" />
          <h4 className="text-[14.5px] font-bold text-stone-200">Camera Offline</h4>
          <p className="text-[12px] text-stone-400 max-w-[280px]">
            RTSP connection dropped or camera is unreachable. Edge daemon will auto-reconnect.
          </p>
        </div>
      )}

      {/* Status Screen: Video Error */}
      {status === "ONLINE" && videoError && (
        <div className="absolute inset-0 bg-[#1C1917]/95 flex flex-col items-center justify-center p-6 text-center text-stone-400 gap-2 z-15">
          <AlertCircle className="w-8 h-8 text-[#B7791F]" />
          <h4 className="text-[14px] font-bold text-stone-200">Live Preview Stream Disconnected</h4>
          <p className="text-[11.5px] text-stone-400 max-w-[280px]">
            Edge daemon is processing computer vision locally. MediaMTX streaming bridge is offline.
          </p>
        </div>
      )}
    </div>
  );
}
