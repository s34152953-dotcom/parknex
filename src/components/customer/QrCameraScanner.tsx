"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import {
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
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
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const processScanResult = useCallback(
    async (decodedText: string) => {
      stopCamera();
      setStatus("verifying");
      setErrorMessage(null);

      try {
        const result = await onConfirmPillar(decodedText);
        if (result.success) {
          setStatus("confirmed");
          setConfirmedDetails(result.confirmedPillar || assignedPillar);
        } else {
          const err = result.error || "Invalid pillar QR code";
          if (err.toLowerCase().includes("floor")) {
            setStatus("wrong_mall");
          } else if (err.toLowerCase().includes("inactive")) {
            setStatus("inactive_pillar");
          } else {
            setStatus("invalid_qr");
          }
          setErrorMessage(err);
        }
      } catch (err: any) {
        setStatus("invalid_qr");
        setErrorMessage(err.message || "Failed to confirm parking pillar");
      }
    },
    [onConfirmPillar, assignedPillar, stopCamera]
  );

  // Scan video frame using jsQR
  const scanFrame = useCallback(() => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data && code.data.trim().length > 0) {
          processScanResult(code.data.trim());
          return; // Stop scan loop
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [processScanResult]);

  const startCamera = async () => {
    setErrorMessage(null);
    setStatus("requesting_permission");

    try {
      stopCamera();

      // Request rear camera with ideal facing mode
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
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
      console.error("Camera access error:", err);
      setStatus("permission_denied");
      setErrorMessage(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera access in your browser settings or use manual code entry."
          : "Unable to start camera. Please ensure no other app is using it, or use manual entry below."
      );
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setManualLoading(true);
    setErrorMessage(null);
    setStatus("verifying");

    try {
      const result = await onConfirmPillar(manualCode.trim());
      if (result.success) {
        setStatus("confirmed");
        setConfirmedDetails(result.confirmedPillar || manualCode.trim());
      } else {
        setStatus("invalid_qr");
        setErrorMessage(result.error || "Pillar code does not match");
      }
    } catch (err: any) {
      setStatus("invalid_qr");
      setErrorMessage(err.message || "Failed to confirm pillar code");
    } finally {
      setManualLoading(false);
    }
  };

  const resetScanner = () => {
    stopCamera();
    setStatus("idle");
    setErrorMessage(null);
    setConfirmedDetails(null);
  };

  return (
    <div className="w-full bg-[#10151D] border border-white/[0.08] rounded-2xl p-[20px] sm:p-[24px] flex flex-col gap-[20px]">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] pb-[16px] border-b border-white/[0.08]">
        <div>
          <h3 className="text-[18px] font-bold text-[#F5F7FA] tracking-tight flex items-center gap-[10px]">
            <QrCode className="w-5 h-5 text-[#D84A2B]" />
            <span>Pillar QR Location Verification</span>
          </h3>
          <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[4px]">
            Scan the QR tag mounted on your parking pillar ({assignedPillar} · {assignedSlot})
          </p>
        </div>

        <div className="flex items-center gap-[8px] bg-[#151B24] p-[4px] rounded-xl border border-white/[0.08] self-start">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              if (status === "idle") startCamera();
            }}
            className={`px-[12px] py-[8px] rounded-lg text-[13px] font-semibold transition-all flex items-center gap-[6px] min-h-[36px] ${
              activeTab === "camera"
                ? "bg-[#D84A2B] text-white"
                : "text-[rgba(245,247,250,0.58)] hover:text-[#F5F7FA]"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              stopCamera();
            }}
            className={`px-[12px] py-[8px] rounded-lg text-[13px] font-semibold transition-all flex items-center gap-[6px] min-h-[36px] ${
              activeTab === "manual"
                ? "bg-[#D84A2B] text-white"
                : "text-[rgba(245,247,250,0.58)] hover:text-[#F5F7FA]"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Code</span>
          </button>
        </div>
      </div>

      {/* Confirmed State */}
      {status === "confirmed" && (
        <div className="bg-[#151B24] border border-emerald-500/30 rounded-xl p-[24px] flex flex-col items-center text-center gap-[16px]">
          <div className="w-[56px] h-[56px] rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-400">
              Location Confirmed
            </span>
            <h4 className="text-[22px] font-bold text-white mt-[4px]">
              {confirmedDetails || assignedPillar} Verified
            </h4>
            <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[4px] max-w-[400px]">
              Your vehicle position has been validated at Floor {assignedFloor} · {assignedSlot}. Find My Car is now active with live walking directions.
            </p>
          </div>
          <button
            type="button"
            onClick={resetScanner}
            className="h-[44px] px-[20px] rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-[14px] font-semibold flex items-center gap-[8px] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Again</span>
          </button>
        </div>
      )}

      {/* Verifying State */}
      {status === "verifying" && (
        <div className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[32px] flex flex-col items-center text-center gap-[16px]">
          <Loader2 className="w-10 h-10 text-[#D84A2B] animate-spin" />
          <div>
            <h4 className="text-[18px] font-bold text-white">Validating Pillar Security Signature</h4>
            <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[4px]">
              Confirming cryptographically signed pillar token with Convex...
            </p>
          </div>
        </div>
      )}

      {/* Error / Rejected States */}
      {(status === "invalid_qr" ||
        status === "wrong_mall" ||
        status === "inactive_pillar" ||
        status === "permission_denied") && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-[20px] flex flex-col gap-[12px]">
          <div className="flex items-start gap-[12px]">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-[2px]" />
            <div className="flex-1">
              <h4 className="text-[15px] font-bold text-red-300">
                {status === "wrong_mall"
                  ? "Wrong Floor or Zone Detected"
                  : status === "inactive_pillar"
                  ? "Inactive Pillar Tag"
                  : status === "permission_denied"
                  ? "Camera Permission Required"
                  : "Invalid Pillar Code"}
              </h4>
              <p className="text-[13.5px] text-red-200/80 mt-[2px]">{errorMessage}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[12px] pt-[8px]">
            <button
              type="button"
              onClick={startCamera}
              className="h-[44px] px-[16px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white text-[13px] font-bold flex items-center gap-[8px] transition-all"
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
              className="h-[44px] px-[16px] rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-[13px] font-bold flex items-center gap-[8px] transition-all"
            >
              <Keyboard className="w-4 h-4" />
              <span>Enter Pillar Code Manually</span>
            </button>
          </div>
        </div>
      )}

      {/* Camera Scanning View */}
      {activeTab === "camera" && status !== "confirmed" && status !== "verifying" && (
        <div className="flex flex-col items-center gap-[16px]">
          {status === "idle" ? (
            <div className="w-full bg-[#151B24] border border-white/[0.08] rounded-xl p-[32px] flex flex-col items-center text-center gap-[16px]">
              <div className="w-[64px] h-[64px] rounded-2xl bg-[#D84A2B]/15 border border-[#D84A2B]/30 text-[#D84A2B] flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div className="max-w-[420px]">
                <h4 className="text-[18px] font-bold text-white">Activate Physical Pillar Scanner</h4>
                <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[4px]">
                  Point your device camera at the QR sign on {assignedPillar} near your space ({assignedSlot}).
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="h-[48px] px-[24px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[15px] flex items-center gap-[10px] shadow-lg transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Start Camera Scanner</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-[500px] aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/15 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Targeting Overlay Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-[32px]">
                <div className="relative w-[220px] h-[220px] border-2 border-[#D84A2B]/60 rounded-2xl flex items-center justify-center">
                  {/* Animated Scanning Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-[#D84A2B] shadow-[0_0_8px_#D84A2B] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 bg-black/60 px-2 py-1 rounded">
                    Align Pillar QR
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black transition-all"
                aria-label="Stop Camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Code Entry Tab */}
      {activeTab === "manual" && status !== "confirmed" && (
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <label htmlFor="manualPillarInput" className="text-[13px] font-bold text-white/80 uppercase tracking-wider">
              Enter Pillar or Space Code
            </label>
            <div className="flex gap-[10px]">
              <input
                id="manualPillarInput"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder={`e.g. ${assignedPillar} or ${assignedSlot}`}
                className="flex-1 h-[48px] px-[16px] rounded-xl bg-[#151B24] border border-white/15 text-white placeholder-white/30 text-[15px] font-mono focus:border-[#D84A2B] focus:outline-none transition-colors"
                disabled={manualLoading}
              />
              <button
                type="submit"
                disabled={manualLoading || !manualCode.trim()}
                className="h-[48px] px-[20px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] disabled:opacity-50 text-white font-bold text-[14px] flex items-center gap-[8px] transition-all shrink-0 cursor-pointer"
              >
                {manualLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[12px] text-[rgba(245,247,250,0.58)]">
              Assigned location: <span className="text-white font-semibold">{assignedPillar}</span> ·{" "}
              <span className="text-white font-semibold">Space {assignedSlot}</span> (Floor {assignedFloor})
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
