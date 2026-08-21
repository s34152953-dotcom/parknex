"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Car,
  Clock,
  MapPin,
  ArrowRight,
  RefreshCw,
  Camera,
  Search,
} from "lucide-react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface VerificationResult {
  isValid: boolean;
  status: "VALID" | "ALREADY_USED" | "INVALID" | "EXPIRED";
  booking?: any;
  message?: string;
}

export default function AdminScanExitPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const convex = useConvex();
  const completeExitMutation = useMutation(api.bookings.completeBooking);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError("Camera access not supported on this browser.");
      }
    } catch (err: any) {
      setCameraError("Camera permission denied or camera unavailable. Use manual token verification below.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Verify Token
  const handleVerify = async (tokenToVerify?: string) => {
    const rawToken = tokenToVerify || tokenInput;
    if (!rawToken.trim()) return;

    setVerifying(true);
    setResult(null);
    setCompletedSuccess(false);

    try {
      const booking = await convex.query(api.bookings.getBookingByToken, { token: rawToken.trim() });
      
      if (booking) {
        if (booking.status === "ACTIVE") {
          setResult({ isValid: true, status: "VALID", booking: { ...booking, id: booking._id, floor: booking.slotDetails?.floor, zone: booking.slotDetails?.zone, slotNumber: booking.slotDetails?.slotNumber } });
        } else {
          setResult({ isValid: false, status: "ALREADY_USED", message: "This pass has already been used to exit." });
        }
      } else {
        setResult({
          isValid: false,
          status: "INVALID",
          message: "No active booking found for this exit pass.",
        });
      }
    } catch (err: any) {
      setResult({
        isValid: false,
        status: "INVALID",
        message: "Network error connecting to exit verification gateway",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Complete Exit
  const handleCompleteExit = async () => {
    if (!result?.booking?.customerAccessToken) return;

    setCompleting(true);
    try {
      await completeExitMutation({ token: result.booking.customerAccessToken });
      setCompletedSuccess(true);
      setResult((prev) => (prev ? { ...prev, isValid: false, status: "ALREADY_USED" } : null));
    } catch (err: any) {
      alert("Error completing exit. Please retry.");
    } finally {
      setCompleting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setTokenInput("");
    setCompletedSuccess(false);
  };

  // Compute duration
  const computeDuration = (entry: string) => {
    const start = new Date(entry).getTime();
    const now = Date.now();
    const diffMins = Math.max(1, Math.round((now - start) / (60 * 1000)));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="w-full p-6 sm:p-8 lg:p-10 max-w-[1200px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-[#D84A2B] uppercase tracking-wider">
              EXIT GATE VALIDATION
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1C1917] tracking-tight">
            Scan Customer Exit Pass QR
          </h1>
          <p className="text-[13.5px] text-[#78716C] mt-0.5">
            Scan the digital Exit Pass QR presented by the customer to verify authorization and free the parking space
          </p>
        </div>

        <button
          onClick={handleReset}
          className="h-11 px-5 rounded-2xl bg-white border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold inline-flex items-center gap-2 hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#D84A2B]" />
          New Scan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Scanner Viewport */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col items-center text-center">
            {/* Viewport Frame */}
            <div className="relative w-full max-w-[340px] aspect-square rounded-3xl bg-[#1C1917] border-4 border-[#EAE3D9] overflow-hidden flex items-center justify-center mb-6 shadow-inner">
              {cameraActive ? (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-white/70">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                    <QrCode className="w-8 h-8 text-[#D84A2B]" />
                  </div>
                  <p className="text-[13px] font-medium text-white/90">Camera Viewport Inactive</p>
                  <p className="text-[11.5px] text-white/60 mt-1">Tap below to activate device optical sensor</p>
                </div>
              )}

              {/* Scanning Crosshair HUD Overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-[#D84A2B]/70 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#D84A2B] animate-pulse" />
              </div>
            </div>

            {/* Camera Switcher Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="h-11 px-6 rounded-2xl bg-[#D84A2B] text-white text-[13.5px] font-bold inline-flex items-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Activate Optical Scanner
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="h-11 px-6 rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold inline-flex items-center gap-2 hover:bg-white transition-all cursor-pointer"
                >
                  Turn Off Camera
                </button>
              )}
            </div>

            {cameraError && (
              <p className="text-[12px] text-[#EF4444] font-medium mt-3">{cameraError}</p>
            )}

            {/* Manual Token Verification fallback */}
            <div className="w-full mt-7 pt-6 border-t border-[#EAE3D9] flex flex-col gap-3 text-left">
              <label className="block text-[12px] font-bold text-[#57534E] uppercase">
                Manual Token Verification
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste or enter QR token..."
                  className="flex-1 h-11 px-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-mono focus:border-[#D84A2B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={verifying || !tokenInput.trim()}
                  className="h-11 px-5 rounded-xl bg-[#1C1917] text-white text-[13px] font-bold hover:bg-[#D84A2B] transition-colors cursor-pointer shrink-0"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Scan Result & Authorization Action */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {completedSuccess ? (
            /* ── Success Completed Card ── */
            <div className="bg-white border border-[#10B981]/30 rounded-3xl p-8 shadow-[0_12px_40px_rgba(16,185,129,0.08)] flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[#10B981] uppercase tracking-wider">
                  EXIT RECORDED & COMPLETED
                </span>
                <h3 className="text-[24px] font-extrabold text-[#1C1917] mt-1">
                  Boom Barrier Authorized
                </h3>
                <p className="text-[13.5px] text-[#78716C] mt-1">
                  Parking space has been marked <strong>AVAILABLE</strong> in the booking system.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full min-h-[50px] rounded-2xl bg-[#D84A2B] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md cursor-pointer"
              >
                Scan Next Vehicle Exit Pass
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : result ? (
            /* ── Verification Result Card ── */
            <div
              className={`bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border flex flex-col gap-6 ${
                result.status === "VALID"
                  ? "border-[#10B981]/40"
                  : result.status === "ALREADY_USED"
                  ? "border-[#F59E0B]/40"
                  : "border-[#EF4444]/40"
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    result.status === "VALID"
                      ? "bg-[#10B981]/15 text-[#10B981]"
                      : result.status === "ALREADY_USED"
                      ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                      : "bg-[#EF4444]/15 text-[#EF4444]"
                  }`}
                >
                  {result.status === "VALID" ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : result.status === "ALREADY_USED" ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      result.status === "VALID"
                        ? "text-[#10B981]"
                        : result.status === "ALREADY_USED"
                        ? "text-[#F59E0B]"
                        : "text-[#EF4444]"
                    }`}
                  >
                    {result.status === "VALID"
                      ? "PASS VERIFIED & VALID"
                      : result.status === "ALREADY_USED"
                      ? "ALREADY COMPLETED"
                      : "VERIFICATION FAILED"}
                  </span>
                  <h3 className="text-[22px] font-extrabold text-[#1C1917] tracking-tight">
                    {result.status === "VALID"
                      ? "EXIT AUTHORIZED"
                      : result.status === "ALREADY_USED"
                      ? "PASS ALREADY USED"
                      : "INVALID EXIT PASS"}
                  </h3>
                </div>
              </div>

              {/* Booking Metadata if Available */}
              {result.booking && (
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col gap-3 text-[13.5px]">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                    <span className="text-[#78716C]">Vehicle Number</span>
                    <span className="text-[#1C1917] font-extrabold font-mono text-[16px]">
                      {result.booking.vehicleNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                    <span className="text-[#78716C]">Parking Space</span>
                    <span className="text-[#D84A2B] font-bold">
                      Floor {result.booking.floor} · {result.booking.zone} · {result.booking.slotNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                    <span className="text-[#78716C]">Entry Time</span>
                    <span className="text-[#1C1917] font-medium">
                      {new Date(result.booking.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C]">Total Duration</span>
                    <span className="text-[#1C1917] font-bold">
                      {computeDuration(result.booking.entryTime)}
                    </span>
                  </div>
                </div>
              )}

              {result.message && (
                <p className="text-[13px] text-[#78716C] leading-relaxed">{result.message}</p>
              )}

              {/* Action Button */}
              {result.status === "VALID" && (
                <button
                  type="button"
                  onClick={handleCompleteExit}
                  disabled={completing}
                  className="w-full min-h-[52px] rounded-2xl bg-[#D84A2B] text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md shadow-[#D84A2B]/20 cursor-pointer"
                >
                  {completing ? "Processing Exit..." : "Complete Exit & Free Parking Space"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* ── Default Scan Prompt ── */
            <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-4 shadow-xs">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-[19px] font-bold text-[#1C1917]">Awaiting Exit Pass Scan</h3>
              <p className="text-[13.5px] text-[#78716C] max-w-[340px] mt-1 leading-relaxed">
                Scan the customer&apos;s phone screen using your optical camera or paste the digital token to authorize boom barrier opening.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
