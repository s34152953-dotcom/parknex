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
  const isProcessingRef = useRef<boolean>(false);

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
            if (result && !isProcessingRef.current) {
              const text = result.getText();
              if (text && text.trim()) {
                isProcessingRef.current = true;
                handleProcessPass(text);
              }
            }
          }
        );
      }
      setCameraActive(true);
      setCameraStatusMsg("Camera active. Align customer exit pass QR code.");
    } catch (err: any) {
      console.warn("Camera failed:", err);
      setCameraActive(false);
      setCameraStatusMsg("Camera unavailable — manual parking slot entry required.");
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        (codeReaderRef.current as any).reset?.();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleProcessPass = async (tokenOrCode: string, overrideReasonText?: string) => {
    const rawInput = (tokenOrCode || "").trim();
    if (!rawInput) {
      isProcessingRef.current = false;
      return;
    }
    isProcessingRef.current = true;
    setIsVerifying(true);
    setErrorMessage("");

    try {
      const result = await completeExitMutation({
        tokenOrCode: rawInput,
        exitDetectedPlate: exitDetectedPlate.trim() || undefined,
        operatorEmail: "operator:desk01",
        overrideReason: overrideReasonText,
      });

      if (!result.success) {
        if (result.mismatch) {
          // Plate mismatch detected — prompt operator override
          setMismatchData({
            tokenOrCode: rawInput,
            expectedPlate: result.expectedPlate || "Assigned Plate",
            detectedPlate: result.detectedPlate || exitDetectedPlate.toUpperCase(),
          });
          setOverrideModalOpen(true);
        } else {
          setErrorMessage(result.error || "Failed to validate exit pass.");
        }
      } else {
        stopCamera();
        setCompletedExit(result);
        setOverrideModalOpen(false);
        setOverrideReason("");
        setMismatchData(null);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to process exit";
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleProcessPass(manualCodeInput);
  };

  const handleConfirmOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mismatchData || !overrideReason.trim()) return;
    handleProcessPass(mismatchData.tokenOrCode, overrideReason);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              EXIT GATE CONTROL
            </span>
            <span className="text-[12px] text-[#70675F]">· Gate B Outbound Barrier</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Gate Scanner &amp; Barrier Control
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Scan digital exit passes, validate plate tokens, and lift exit barrier gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/25 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2F7D5A] animate-pulse" />
            Barrier Gate Online
          </span>
        </div>
      </div>

      {!completedExit ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Scanner Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4.5 h-4.5 text-[#C93B2F]" />
                  <span className="text-[14.5px] font-bold text-[#241F1B]">
                    Optical Pass Scanner
                  </span>
                </div>
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F3EAE0] border border-[#DED3C7] text-[#241F1B] text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Activate Camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-1.5 rounded-lg bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    Deactivate
                  </button>
                )}
              </div>

              {/* Viewport */}
              <div className="relative w-full h-[280px] bg-[#FAF7F2] rounded-xl border border-[#DED3C7] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  playsInline
                  muted
                />

                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#70675F]">
                    <QrCode className="w-10 h-10 text-[#938980] mb-2" />
                    <p className="text-[14px] font-bold text-[#241F1B]">Scanner Standby</p>
                    <p className="text-[12px] text-[#70675F] max-w-[280px] mt-0.5">
                      Click &ldquo;Activate Camera&rdquo; or enter parking slot name (e.g. B12) manually.
                    </p>
                  </div>
                )}

                {/* Reticle Target */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-[65%] h-[75%] border-2 border-[#C93B2F] rounded-xl flex items-center justify-center bg-[#C93B2F]/[0.03]">
                      <span className="text-[10px] font-mono text-white font-bold bg-[#241F1B]/80 px-2 py-0.5 rounded">
                        SCAN PASS QR
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {cameraStatusMsg && (
                <p className="text-[12px] text-[#70675F] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A]" />
                  <span>{cameraStatusMsg}</span>
                </p>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[13px] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Manual Parking Slot Entry (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Manual Entry Box */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DED3C7]">
                <KeyRound className="w-4 h-4 text-[#C93B2F]" />
                <h3 className="text-[14.5px] font-bold text-[#241F1B]">Manual Parking Slot &amp; Pass Approval</h3>
              </div>

              <form onSubmit={handleManualSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#241F1B]">
                    Parking Slot Name / Space Identifier
                  </label>
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="e.g. B12, B-12, A-01 or Vehicle Plate"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3.5 py-2.5 text-[14px] font-mono text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#241F1B]">
                    Exit Camera Plate (Optional Plate Verification)
                  </label>
                  <input
                    type="text"
                    value={exitDetectedPlate}
                    onChange={(e) => setExitDetectedPlate(e.target.value)}
                    placeholder="e.g. MH02AB1234"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3.5 py-2.5 text-[14px] font-mono text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !manualCodeInput.trim()}
                  className="w-full h-11 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating Exit...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Exit &amp; Open Barrier Gate</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Completed Exit Card */
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-8 max-w-xl mx-auto flex flex-col items-center text-center gap-6 shadow-[0_8px_24px_rgba(70,48,35,0.08)]">
          <div className="w-14 h-14 rounded-2xl bg-[#2F7D5A]/15 text-[#2F7D5A] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2F7D5A] bg-[#2F7D5A]/10 px-2.5 py-1 rounded-full border border-[#2F7D5A]/30">
              EXIT CONFIRMED &amp; BARRIER OPENED
            </span>
            <h2 className="text-[22px] font-black text-[#241F1B] mt-2">
              Vehicle {completedExit.vehicleNumber} Exited
            </h2>
            <p className="text-[13.5px] text-[#70675F] mt-1">
              Space <strong>Slot {completedExit.slotNumber}</strong> has been released and is now Available.
            </p>
          </div>

          <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 w-full text-left text-[12.5px] flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-[#70675F]">Exit Time:</span>
              <span className="font-mono text-[#241F1B] font-bold">{new Date(completedExit.exitTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#70675F]">Single-Use Token Status:</span>
              <span className="font-bold text-[#2F7D5A]">CONSUMED (Single-Use Locked)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCompletedExit(null);
              setManualCodeInput("");
              setExitDetectedPlate("");
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[13px] transition-colors cursor-pointer shadow-xs"
          >
            <span>Scan Next Vehicle Exit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plate Mismatch & Operator Override Modal */}
      {overrideModalOpen && mismatchData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#C93B2F]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-[#C93B2F] mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-[17px] font-black text-[#241F1B]">License Plate Mismatch Detected</h3>
            </div>

            <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 text-[12.5px] flex flex-col gap-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-[#70675F]">Expected Pass Plate:</span>
                <span className="font-mono font-bold text-[#241F1B]">{mismatchData.expectedPlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70675F]">Camera Detected Plate:</span>
                <span className="font-mono font-bold text-[#C93B2F]">{mismatchData.detectedPlate}</span>
              </div>
            </div>

            <p className="text-[12.5px] text-[#70675F] mb-4">
              To allow this vehicle to exit, enter a mandatory override justification. This action is permanently logged to the audit trail.
            </p>

            <form onSubmit={handleConfirmOverride} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11.5px] font-bold text-[#241F1B] mb-1">
                  Mandatory Override Reason
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified physical vehicle registration documents with driver."
                  required
                  rows={3}
                  className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3 text-[13px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-semibold cursor-pointer"
                >
                  Reject Exit
                </button>
                <button
                  type="submit"
                  disabled={!overrideReason.trim()}
                  className="px-4 py-2 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold cursor-pointer disabled:opacity-50"
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
