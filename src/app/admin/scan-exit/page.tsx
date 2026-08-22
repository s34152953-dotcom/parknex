"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  CarFront,
  ArrowRight,
  RefreshCw,
  Clock,
  Wrench,
  KeyRound,
} from "lucide-react";

export default function AdminScanExitPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatusMsg, setCameraStatusMsg] = useState("");
  const [manualCodeInput, setManualCodeInput] = useState("");
  const [exitDetectedPlate, setExitDetectedPlate] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedExit, setCompletedExit] = useState<any | null>(null);

  // Operator Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [mismatchData, setMismatchData] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const completeExitMutation = useMutation(api.bookings.completeExitWithVerification);

  // Initialize ZXing code reader
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setErrorMessage("");
      setCameraStatusMsg("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current && codeReaderRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        codeReaderRef.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              const text = result.getText();
              handleProcessPass(text);
            }
          }
        );
      }
      setCameraActive(true);
      setCameraStatusMsg("Camera active. Align customer exit pass QR code.");
    } catch (err: any) {
      console.warn("Camera failed:", err);
      setCameraActive(false);
      setCameraStatusMsg("Camera unavailable — manual code entry required.");
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      // Release scanner
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleProcessPass = async (tokenOrCode: string, overrideReasonText?: string) => {
    if (!tokenOrCode.trim()) return;
    setIsVerifying(true);
    setErrorMessage("");

    try {
      const result = await completeExitMutation({
        tokenOrCode: tokenOrCode.trim(),
        exitDetectedPlate: exitDetectedPlate ? exitDetectedPlate.toUpperCase().trim() : undefined,
        operatorEmail: "operator:gate_b_exit",
        overrideReason: overrideReasonText || undefined,
      });

      if (result.mismatch) {
        setMismatchData(result);
        setOverrideModalOpen(true);
        return;
      }

      stopCamera();
      setCompletedExit(result);
      setOverrideModalOpen(false);
      setMismatchData(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify exit pass");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessPass(manualCodeInput);
  };

  const handleConfirmOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    handleProcessPass(manualCodeInput || mismatchData?.tokenOrCode || completedExit?.exitPassToken || "", overrideReason);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D84A2B] bg-[#D84A2B]/10 px-2 py-0.5 rounded border border-[#D84A2B]/20">
              EXIT TERMINAL
            </span>
            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">· Gate B Outbound Barrier</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#F5F7FA] tracking-tight">
            Scan &amp; Verify Exit Pass
          </h1>
          <p className="text-[13.5px] text-[rgba(245,247,250,0.65)] mt-0.5">
            Single-use exit pass validation, vehicle plate match, and barrier control.
          </p>
        </div>
      </div>

      {!completedExit ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Scanner (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#D84A2B]" />
                  <span className="text-[14px] font-bold text-white">Camera QR Scanner</span>
                </div>
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D84A2B] hover:bg-[#C64024] text-white text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    Start Scanner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-1.5 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    Stop Scanner
                  </button>
                )}
              </div>

              {/* Video Viewport */}
              <div className="relative w-full h-[260px] bg-[#0A0D14] rounded-xl border border-white/[0.06] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  playsInline
                  muted
                />

                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-[rgba(245,247,250,0.5)]">
                    <QrCode className="w-10 h-10 text-white/20 mb-2" />
                    <p className="text-[13.5px] font-semibold text-white/80">Scanner Inactive</p>
                    <p className="text-[11.5px] text-white/50 max-w-[260px] mt-0.5">
                      Press &ldquo;Start Scanner&rdquo; or enter customer fallback code manually.
                    </p>
                  </div>
                )}

                {/* Reticle Target */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-[65%] h-[75%] border-2 border-[#10B981] rounded-xl flex items-center justify-center bg-[#10B981]/[0.03] animate-pulse">
                      <span className="text-[10px] font-mono text-[#10B981] font-bold bg-black/70 px-2 py-0.5 rounded">
                        SCAN PASS QR
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {cameraStatusMsg && (
                <p className="text-[12px] text-[rgba(245,247,250,0.7)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>{cameraStatusMsg}</span>
                </p>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Manual Code Entry & AI Plate Compare (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Manual Entry Box */}
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <KeyRound className="w-4 h-4 text-[#D84A2B]" />
                <h3 className="text-[14px] font-bold text-white">Manual Fallback Pass Entry</h3>
              </div>

              <form onSubmit={handleManualSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[rgba(245,247,250,0.8)]">
                    Fallback Alphanumeric Code or Signed Token
                  </label>
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="e.g. PNX-7A9K2M or paste token"
                    className="w-full bg-[#0A0D14] border border-white/[0.15] rounded-xl px-3.5 py-2.5 text-[14px] font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[rgba(245,247,250,0.8)]">
                    Exit Camera Plate (Optional ANPR Verification)
                  </label>
                  <input
                    type="text"
                    value={exitDetectedPlate}
                    onChange={(e) => setExitDetectedPlate(e.target.value)}
                    placeholder="e.g. MH-02-ZZ-0001"
                    className="w-full bg-[#0A0D14] border border-white/[0.15] rounded-xl px-3.5 py-2.5 text-[14px] font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !manualCodeInput.trim()}
                  className="w-full h-11 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[14px] shadow-[0_2px_12px_rgba(216,74,43,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating Cryptographic Pass...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify &amp; Open Barrier Gate</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Completed Exit Card */
        <div className="bg-[#10151D] border border-white/[0.1] rounded-2xl p-6 sm:p-8 max-w-xl mx-auto flex flex-col items-center text-center gap-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded-full border border-[#10B981]/30">
              EXIT CONFIRMED &amp; BARRIER OPENED
            </span>
            <h2 className="text-[22px] font-black text-white mt-2">
              Vehicle {completedExit.vehicleNumber} Exited
            </h2>
            <p className="text-[13.5px] text-[rgba(245,247,250,0.7)] mt-1">
              Space <strong>Slot {completedExit.slotNumber}</strong> has been released and is now Available.
            </p>
          </div>

          <div className="bg-[#0A0D14] border border-white/[0.08] rounded-xl p-4 w-full text-left text-[12.5px] flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-[rgba(245,247,250,0.6)]">Exit Time:</span>
              <span className="font-mono text-white">{new Date(completedExit.exitTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(245,247,250,0.6)]">Single-Use Token Status:</span>
              <span className="font-bold text-[#10B981]">CONSUMED (Single-Use Locked)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCompletedExit(null);
              setManualCodeInput("");
              setExitDetectedPlate("");
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[13px] transition-colors cursor-pointer"
          >
            <span>Scan Next Vehicle Exit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plate Mismatch & Operator Override Modal */}
      {overrideModalOpen && mismatchData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#10151D] border border-[#EF4444]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-[#EF4444] mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-[17px] font-black text-white">License Plate Mismatch Detected</h3>
            </div>

            <div className="bg-[#0A0D14] border border-white/[0.08] rounded-xl p-3.5 text-[12.5px] flex flex-col gap-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-white/60">Expected Pass Plate:</span>
                <span className="font-mono font-bold text-white">{mismatchData.expectedPlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Camera Detected Plate:</span>
                <span className="font-mono font-bold text-[#EF4444]">{mismatchData.detectedPlate}</span>
              </div>
            </div>

            <p className="text-[12.5px] text-[rgba(245,247,250,0.7)] mb-4">
              To allow this vehicle to exit, enter a mandatory override justification. This action is permanently logged to the audit trail.
            </p>

            <form onSubmit={handleConfirmOverride} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11.5px] font-bold text-white mb-1">
                  Mandatory Override Reason
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified physical vehicle registration documents with driver."
                  required
                  rows={3}
                  className="w-full bg-[#0A0D14] border border-white/[0.15] rounded-xl p-3 text-[13px] text-white focus:outline-none focus:border-[#D84A2B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-white text-[13px] font-semibold hover:bg-white/[0.1] cursor-pointer"
                >
                  Reject Exit
                </button>
                <button
                  type="submit"
                  disabled={!overrideReason.trim()}
                  className="px-4 py-2 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white text-[13px] font-bold cursor-pointer disabled:opacity-50"
                >
                  Approve Override &amp; Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
