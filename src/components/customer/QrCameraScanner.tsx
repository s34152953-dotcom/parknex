"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  Keyboard,
  ArrowRight,
} from "lucide-react";

export type ScannerStatus =
  | "idle"
  | "requesting_permission"
  | "scanning"
  | "verifying"
  | "confirmed"
  | "invalid_qr"
  | "wrong_mall"
  | "inactive_pillar"
  | "permission_denied";

interface QrCameraScannerProps {
  onConfirmPillar: (codeOrToken: string) => Promise<{ success: boolean; confirmedPillar?: string; error?: string }>;
  assignedPillar?: string;
  assignedSlot?: string;
  assignedFloor?: string;
}

export default function QrCameraScanner({
  onConfirmPillar,
  assignedPillar = "Pillar",
  assignedSlot = "Slot",
  assignedFloor = "B2",
}: QrCameraScannerProps) {
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedDetails, setConfirmedDetails] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Stop all camera tracks
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle scanned raw payload
  const handleDecodedCode = async (rawCode: string) => {
    stopCamera();
    setStatus("verifying");
    setErrorMessage(null);

    try {
      const result = await onConfirmPillar(rawCode);
      if (result.success) {
        setStatus("confirmed");
        setConfirmedDetails(result.confirmedPillar || assignedPillar);
      } else {
        setStatus("invalid_qr");
        setErrorMessage(result.error || "Pillar verification failed. Please try scanning again.");
      }
    } catch (err: any) {
      setStatus("invalid_qr");
      setErrorMessage(err.message || "Network error verifying pillar.");
    }
  };

  // Continuous frame loop for QR decoding
  const scanFrame = useCallback(() => {
    if (!isScanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleDecodedCode(code.data.trim());
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [onConfirmPillar]);

  // Initialize Camera
  const startCamera = async () => {
    setStatus("requesting_permission");
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }

      isScanningRef.current = true;
      setStatus("scanning");
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.warn("Camera permission denied:", err);
      setStatus("permission_denied");
      setErrorMessage("Camera access was denied or is unavailable on this device.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setManualLoading(true);
    setErrorMessage(null);

    try {
      const result = await onConfirmPillar(manualCode.trim().toUpperCase());
      if (result.success) {
        setStatus("confirmed");
        setConfirmedDetails(result.confirmedPillar || manualCode.trim().toUpperCase());
      } else {
        setStatus("invalid_qr");
        setErrorMessage(result.error || "Pillar code does not match active parking space.");
      }
    } catch (err: any) {
      setStatus("invalid_qr");
      setErrorMessage(err.message || "Failed to confirm pillar code.");
    } finally {
      setManualLoading(false);
    }
  };

  const resetScanner = () => {
    stopCamera();
    setStatus("idle");
    setErrorMessage(null);
    setConfirmedDetails(null);
    setManualCode("");
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 sm:p-7 flex flex-col gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DED3C7]">
        <div>
          <h3 className="text-[16px] font-bold text-[#241F1B]">Confirm Pillar Location</h3>
          <p className="text-[12.5px] text-[#70675F]">
            Verify parking position at {assignedPillar} ({assignedSlot})
          </p>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              if (status !== "scanning") resetScanner();
            }}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "camera"
                ? "bg-[#C93B2F] text-white shadow-xs"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              stopCamera();
            }}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "manual"
                ? "bg-[#C93B2F] text-white shadow-xs"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Manual Code</span>
          </button>
        </div>
      </div>

      {/* Confirmed State */}
      {status === "confirmed" && (
        <div className="bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2F7D5A]/15 text-[#2F7D5A] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#2F7D5A]">
              Location Confirmed
            </span>
            <h4 className="text-[20px] font-bold text-[#241F1B] mt-1">
              {confirmedDetails || assignedPillar} Verified
            </h4>
            <p className="text-[13.5px] text-[#70675F] mt-1 max-w-[400px]">
              Your vehicle position has been validated at Floor {assignedFloor} · {assignedSlot}. Find My Car is now active with live walking directions.
            </p>
          </div>
          <button
            type="button"
            onClick={resetScanner}
            className="h-11 px-5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13.5px] font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Again</span>
          </button>
        </div>
      )}

      {/* Verifying State */}
      {status === "verifying" && (
        <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-8 flex flex-col items-center text-center gap-4">
          <Loader2 className="w-10 h-10 text-[#C93B2F] animate-spin" />
          <div>
            <h4 className="text-[17px] font-bold text-[#241F1B]">Validating Pillar Security Signature</h4>
            <p className="text-[13.5px] text-[#70675F] mt-1">
              Confirming cryptographically signed pillar token...
            </p>
          </div>
        </div>
      )}

      {/* Error / Rejected States */}
      {(status === "invalid_qr" ||
        status === "wrong_mall" ||
        status === "inactive_pillar" ||
        status === "permission_denied") && (
        <div className="bg-[#C93B2F]/10 border border-[#C93B2F]/30 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C93B2F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-[15px] font-bold text-[#C93B2F]">
                {status === "permission_denied"
                  ? "Camera Permission Required"
                  : "Invalid Pillar Code"}
              </h4>
              <p className="text-[13px] text-[#70675F] mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={startCamera}
              className="h-11 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Camera</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("manual");
                stopCamera();
              }}
              className="h-11 px-4 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>Enter Pillar Code Manually</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera Scanning View */}
      {activeTab === "camera" && status !== "confirmed" && status !== "verifying" && (
        <div className="flex flex-col items-center gap-4">
          {status === "idle" ? (
            <div className="w-full bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div className="max-w-[420px]">
                <h4 className="text-[18px] font-bold text-[#241F1B]">Activate Pillar Scanner</h4>
                <p className="text-[13.5px] text-[#70675F] mt-1">
                  Point your device camera at the QR sign on {assignedPillar} near your space ({assignedSlot}).
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="h-12 px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14.5px] flex items-center gap-2.5 shadow-[0_4px_16px_rgba(201,59,47,0.25)] transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Start Camera Scanner</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-[500px] aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-[#DED3C7] flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Targeting Overlay Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-[200px] h-[200px] border-2 border-[#C93B2F] rounded-2xl flex items-center justify-center bg-[#C93B2F]/[0.04]">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />
                  <span className="text-[11px] font-mono text-white font-bold bg-black/60 px-2 py-0.5 rounded">
                    SCAN PILLAR QR
                  </span>
                </div>
              </div>

              {/* Stop camera button */}
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Code Entry View */}
      {activeTab === "manual" && status !== "confirmed" && (
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
          <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-5 flex flex-col gap-3">
            <label className="text-[12.5px] font-bold text-[#241F1B] uppercase tracking-wider">
              Enter 4-Character Pillar Code
            </label>
            <p className="text-[12.5px] text-[#70675F]">
              Enter the alphanumeric pillar code printed on the physical column (e.g.{" "}
              <span className="font-mono font-bold text-[#241F1B]">{assignedPillar}</span>).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder={assignedPillar || "P02"}
                maxLength={10}
                className="h-12 px-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[16px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] flex-1"
              />
              <button
                type="submit"
                disabled={manualLoading || !manualCode.trim()}
                className="h-12 px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] disabled:opacity-50 text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer"
              >
                {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Verify</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
