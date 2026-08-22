"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CarFront,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Phone,
  Mail,
  QrCode,
  Printer,
  Share2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Layers,
  ArrowRight,
  Send,
  HelpCircle,
  Clock,
  FileCheck,
  CheckSquare,
  Square,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getTop3Recommendations, SlotRecommendationInput } from "@/lib/parking/recommendation";
import { verifyEntryToken } from "../../../../convex/crypto";
import {
  normalizeRegistrationNumber,
  isValidIndianRegistration,
} from "@/lib/verification/plateValidator";

export type VerificationState =
  | "NOT_CHECKED"
  | "CHECKING"
  | "VERIFIED"
  | "INVALID"
  | "MISMATCH"
  | "UNAVAILABLE"
  | "MANUAL_VERIFIED";

export interface VerificationData {
  status: VerificationState;
  normalizedRegistrationNumber: string;
  registrationStatus?: string;
  make?: string;
  model?: string;
  colour?: string;
  vehicleClass?: string;
  fuelType?: string;
  verifiedAt?: string;
  errorMessage?: string;
  manualReason?: string;
}

// Zod Schema for Vehicle Entry Form
const entryFormSchema = z.object({
  vehicleNumber: z
    .string()
    .min(4, "Vehicle plate must have at least 4 characters")
    .max(15, "Vehicle plate is too long"),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  vehicleType: z.enum(["sedan", "suv", "hatchback", "ev", "motorcycle"]),
  slotId: z.string().min(1, "Please select a parking space"),
  isHandicapped: z.boolean(),
  isEV: z.boolean(),
});

type EntryFormData = z.infer<typeof entryFormSchema>;

function NewEntryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSlotId = searchParams.get("slotId") || "";

  // State Management
  const [entryMode, setEntryMode] = useState<"walk_in" | "preregistered">("walk_in");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number | null>(null);
  const [cameraStatusMsg, setCameraStatusMsg] = useState<string>("");
  const [isProcessingEntry, setIsProcessingEntry] = useState(false);
  const [completedPass, setCompletedPass] = useState<any | null>(null);
  const [preregTokenInput, setPreregTokenInput] = useState("");
  const [preregError, setPreregError] = useState("");

  // Verification States
  const [verificationData, setVerificationData] = useState<VerificationData>({
    status: "NOT_CHECKED",
    normalizedRegistrationNumber: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [physicalMatchConfirmed, setPhysicalMatchConfirmed] = useState(false);

  // Manual Verification Modal States
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualReason, setManualReason] = useState("");
  const [manualPhysicalMake, setManualPhysicalMake] = useState("");
  const [manualPhysicalModel, setManualPhysicalModel] = useState("");
  const [manualPhysicalColour, setManualPhysicalColour] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Convex Data
  const slotsData = useQuery(api.slots.getSlots, { floor: undefined });
  const rawSlots = slotsData?.slots || [];
  const createWalkInEntryMutation = useMutation(api.bookings.createWalkInEntry);
  const recordManualVerificationMutation = useMutation(api.bookings.recordManualVehicleVerification);

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      vehicleNumber: "",
      phoneNumber: "",
      email: "",
      vehicleType: "sedan",
      slotId: initialSlotId,
      isHandicapped: false,
      isEV: false,
    },
  });

  const rawVehicleNumber = watch("vehicleNumber");
  const currentVehicleType = watch("vehicleType");
  const currentSlotId = watch("slotId");
  const isEV = watch("isEV");
  const isHandicapped = watch("isHandicapped");

  // Normalized Registration Number
  const normalizedPlate = useMemo(() => {
    return normalizeRegistrationNumber(rawVehicleNumber || "");
  }, [rawVehicleNumber]);

  // Indian Format Validation
  const formatValidation = useMemo(() => {
    if (!normalizedPlate) return null;
    return isValidIndianRegistration(normalizedPlate);
  }, [normalizedPlate]);

  // Duplicate Active Booking Query
  const activeBooking = useQuery(api.bookings.getActiveBookingByVehicle, {
    vehicleNumber: normalizedPlate || "NONE",
  });

  // Recommendation Engine
  const recommendationInputs: SlotRecommendationInput[] = useMemo(() => {
    return rawSlots.map((s) => ({
      slotId: s.slotId,
      slotNumber: s.slotNumber,
      floor: s.floor,
      zone: s.zone,
      pillar: s.pillar,
      status: s.status as any,
      distanceFromEntrance: s.distanceFromEntrance,
      positionX: s.positionX,
      positionZ: s.positionZ,
      vehicleConstraints: s.vehicleConstraints,
    }));
  }, [rawSlots]);

  const topRecommendations = useMemo(() => {
    return getTop3Recommendations(recommendationInputs, {
      vehicleType: currentVehicleType,
      isEV: isEV || currentVehicleType === "ev",
      isHandicapped: isHandicapped,
    });
  }, [recommendationInputs, currentVehicleType, isEV, isHandicapped]);

  // Auto-select #1 recommendation if no initial slot provided
  useEffect(() => {
    if (!initialSlotId && topRecommendations.length > 0 && !currentSlotId) {
      setValue("slotId", topRecommendations[0].slot.slotId);
    }
  }, [initialSlotId, topRecommendations, currentSlotId, setValue]);

  // Reset verification state when plate input changes
  useEffect(() => {
    if (normalizedPlate !== verificationData.normalizedRegistrationNumber) {
      setVerificationData({
        status: "NOT_CHECKED",
        normalizedRegistrationNumber: normalizedPlate,
      });
      setPhysicalMatchConfirmed(false);
    }
  }, [normalizedPlate, verificationData.normalizedRegistrationNumber]);

  // Camera Management
  const startCamera = async () => {
    try {
      setCameraStatusMsg("Initializing camera stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCameraAvailable(true);
      setCameraStatusMsg("Camera active. Align number plate in reticle.");
    } catch (err: any) {
      console.warn("Camera failed to start:", err);
      setCameraActive(false);
      setCameraAvailable(false);
      setCameraStatusMsg("Camera unavailable — manual plate entry required.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Run Plate Recognition
  const runPlateRecognition = async () => {
    if (!videoRef.current && !detectedPlate) {
      setCameraStatusMsg("Querying plate detection service...");
      try {
        const res = await fetch("http://localhost:8000/detect-plate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameraId: "cam_gate_a_01" }),
        });
        if (res.ok) {
          const data = await res.json();
          setDetectedPlate(data.normalizedPlate);
          setDetectionConfidence(data.confidence);
          setValue("vehicleNumber", data.normalizedPlate);
          setCameraStatusMsg(`Plate recognized: ${data.normalizedPlate}`);
          return;
        }
      } catch {
        setCameraStatusMsg("Camera service offline. Enter plate manually.");
      }
    }
  };

  // Perform External Vehicle Verification
  const handleVerifyRegistration = async () => {
    if (!normalizedPlate) return;
    setIsVerifying(true);
    setVerificationData((prev) => ({ ...prev, status: "CHECKING" }));

    try {
      const res = await fetch("/api/vehicle/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: normalizedPlate }),
      });

      const data = await res.json();

      if (data.status === "verified") {
        setVerificationData({
          status: "VERIFIED",
          normalizedRegistrationNumber: normalizedPlate,
          registrationStatus: data.registrationStatus || "ACTIVE",
          make: data.make,
          model: data.model,
          colour: data.colour,
          vehicleClass: data.vehicleClass,
          fuelType: data.fuelType,
          verifiedAt: data.verifiedAt,
        });
        setPhysicalMatchConfirmed(false);
      } else if (data.status === "invalid") {
        setVerificationData({
          status: "INVALID",
          normalizedRegistrationNumber: normalizedPlate,
          errorMessage: data.errorMessage || "Vehicle not found in registry records.",
          verifiedAt: data.verifiedAt,
        });
      } else {
        setVerificationData({
          status: "UNAVAILABLE",
          normalizedRegistrationNumber: normalizedPlate,
          errorMessage: data.errorMessage || "Online verification service is temporarily unavailable.",
          verifiedAt: data.verifiedAt,
        });
      }
    } catch (err: any) {
      setVerificationData({
        status: "UNAVAILABLE",
        normalizedRegistrationNumber: normalizedPlate,
        errorMessage: "Network error connecting to verification service.",
        verifiedAt: new Date().toISOString(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Manual Verification Submit
  const handleManualVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedPlate || !manualReason.trim() || manualReason.trim().length < 4) {
      alert("Please provide a valid mandatory reason for manual verification.");
      return;
    }

    setManualSubmitting(true);
    try {
      const result = await recordManualVerificationMutation({
        vehicleNumber: normalizedPlate,
        operatorEmail: "operator:desk01",
        reason: manualReason.trim(),
        physicalMake: manualPhysicalMake.trim() || undefined,
        physicalModel: manualPhysicalModel.trim() || undefined,
        physicalColour: manualPhysicalColour.trim() || undefined,
      });

      setVerificationData({
        status: "MANUAL_VERIFIED",
        normalizedRegistrationNumber: normalizedPlate,
        make: manualPhysicalMake.trim() || undefined,
        model: manualPhysicalModel.trim() || undefined,
        colour: manualPhysicalColour.trim() || undefined,
        verifiedAt: result.verifiedAt,
        manualReason: manualReason.trim(),
      });

      setPhysicalMatchConfirmed(true);
      setManualModalOpen(false);
      setManualReason("");
    } catch (err: any) {
      alert("Failed to record manual verification: " + err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Handle Preregistered Token Scan
  const handleValidatePreregToken = async () => {
    setPreregError("");
    const token = preregTokenInput.trim();
    if (!token) return;

    const payload = await verifyEntryToken(token);
    if (!payload || !payload.vehicleNumber) {
      setPreregError("Invalid or expired pre-registered entry token.");
      return;
    }

    setValue("vehicleNumber", payload.vehicleNumber);
    if (payload.email) setValue("email", payload.email);
    setDetectedPlate(payload.vehicleNumber);
    setDetectionConfidence(1.0);
    setCameraStatusMsg("Pre-registered token verified successfully.");
  };

  // Gate Check: Can proceed to space assignment?
  const canProceedToAssign = useMemo(() => {
    if (activeBooking) return false;
    if (verificationData.status === "MANUAL_VERIFIED") return true;
    if (verificationData.status === "VERIFIED" && physicalMatchConfirmed) return true;
    return false;
  }, [activeBooking, verificationData.status, physicalMatchConfirmed]);

  // Form Submission
  const onSubmit = async (data: EntryFormData) => {
    if (!canProceedToAssign) {
      alert("Vehicle must be verified and confirmed by operator before space assignment.");
      return;
    }

    setIsProcessingEntry(true);
    try {
      const selectedRec = topRecommendations.find((r) => r.slot.slotId === data.slotId);

      const result = await createWalkInEntryMutation({
        slotId: data.slotId,
        vehicleNumber: normalizedPlate,
        phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : undefined,
        email: data.email ? data.email.trim() : undefined,
        vehicleType: data.vehicleType,
        entryType: entryMode,
        mallName: "Central Mall Grand",
        operatorEmail: "operator:desk01",
        entryPlateConfidence: detectionConfidence || undefined,
        recommendationScore: selectedRec?.score,
        recommendationReason: selectedRec?.reason,
        verificationStatus: verificationData.status,
        vehicleMake: verificationData.make,
        vehicleModel: verificationData.model,
        vehicleColour: verificationData.colour,
        vehicleClass: verificationData.vehicleClass,
        fuelType: verificationData.fuelType,
        verifiedAt: verificationData.verifiedAt,
        manualVerificationReason: verificationData.manualReason,
      });

      stopCamera();
      const origin = typeof window !== "undefined" ? window.location.origin : "https://parknex.vercel.app";
      const dashboardLink = `${origin}/customer/dashboard`;

      setCompletedPass({
        ...result,
        vehicleNumber: normalizedPlate,
        phoneNumber: data.phoneNumber,
        email: data.email,
        vehicleType: data.vehicleType,
        dashboardLink,
      });
    } catch (err: any) {
      alert(err.message || "Failed to process entry");
    } finally {
      setIsProcessingEntry(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-6 select-none text-[#F5F7FA]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D84A2B] bg-[#D84A2B]/10 px-2 py-0.5 rounded border border-[#D84A2B]/20">
              ENTRY CONTROL
            </span>
            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">· Gate A Inbound</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-white tracking-tight">
            Process Vehicle Entry
          </h1>
          <p className="text-[13.5px] text-[rgba(245,247,250,0.65)] mt-0.5">
            Two-step vehicle entry, plate verification, and space allocation.
          </p>
        </div>

        {/* Entry Mode Selector */}
        <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setEntryMode("walk_in")}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              entryMode === "walk_in"
                ? "bg-[#D84A2B] text-white shadow-xs"
                : "text-[rgba(245,247,250,0.6)] hover:text-white"
            }`}
          >
            Walk-In Customer
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("preregistered")}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              entryMode === "preregistered"
                ? "bg-[#D84A2B] text-white shadow-xs"
                : "text-[rgba(245,247,250,0.6)] hover:text-white"
            }`}
          >
            Pre-Registered Pass
          </button>
        </div>
      </div>

      {!completedPass ? (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Camera, Plate Entry & Verification (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Preregistered Token Scan Box if active */}
            {entryMode === "preregistered" && (
              <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#D84A2B]" />
                  <span>Scan or Enter Pre-Registered Pass Token</span>
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preregTokenInput}
                    onChange={(e) => setPreregTokenInput(e.target.value)}
                    placeholder="Paste signed entry token..."
                    className="flex-1 bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                  />
                  <button
                    type="button"
                    onClick={handleValidatePreregToken}
                    className="px-4 py-2.5 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[13px] transition-colors cursor-pointer"
                  >
                    Verify Pass
                  </button>
                </div>
                {preregError && (
                  <p className="text-[12px] text-[#EF4444] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{preregError}</span>
                  </p>
                )}
              </div>
            )}

            {/* Step 1: Camera / Plate Detection Box */}
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4.5 h-4.5 text-[#D84A2B]" />
                  <span className="text-[14px] font-bold text-white">
                    Step 1: Entry Camera &amp; Plate Detection
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!cameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Start Camera
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Stop Camera
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={runPlateRecognition}
                    className="px-3 py-1.5 rounded-lg bg-[#D84A2B]/20 hover:bg-[#D84A2B]/30 border border-[#D84A2B]/40 text-[#D84A2B] text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    Detect Plate
                  </button>
                </div>
              </div>

              {/* Video Viewport / Reticle */}
              <div className="relative w-full h-[200px] bg-[#0A0D14] rounded-xl border border-white/[0.06] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  playsInline
                  muted
                />

                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-[rgba(245,247,250,0.5)]">
                    <Camera className="w-8 h-8 text-white/20 mb-2" />
                    <p className="text-[13px] font-semibold text-white/80">Camera Inactive</p>
                    <p className="text-[11.5px] text-white/50 max-w-[260px] mt-0.5">
                      Click &ldquo;Start Camera&rdquo; or type vehicle number directly below.
                    </p>
                  </div>
                )}

                {/* Reticle Target Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-[80%] h-[60%] border-2 border-dashed border-[#D84A2B]/70 rounded-lg flex items-center justify-center bg-[#D84A2B]/[0.02]">
                      <span className="text-[10.5px] font-mono text-[#D84A2B] font-bold bg-black/60 px-2 py-0.5 rounded">
                        ALIGN NUMBER PLATE
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Number Input Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-white flex items-center justify-between">
                  <span>Vehicle Number Plate (Mandatory)</span>
                  {normalizedPlate && (
                    <span className="text-[11px] font-mono text-[#10B981]">
                      Normalized: {normalizedPlate}
                    </span>
                  )}
                </label>
                <input
                  {...register("vehicleNumber")}
                  placeholder="e.g., MH-02-ZZ-0001 or 22BH1234AA"
                  className="w-full bg-[#0A0D14] border border-white/[0.15] rounded-xl px-4 py-3 text-[16px] font-mono font-black text-white uppercase placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                />
                {errors.vehicleNumber && (
                  <p className="text-[11.5px] text-[#EF4444] font-semibold">{errors.vehicleNumber.message}</p>
                )}
                {formatValidation && !formatValidation.isValid && (
                  <p className="text-[11.5px] text-[#EF4444] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formatValidation.error}</span>
                  </p>
                )}
              </div>

              {/* Vehicle Type & Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11.5px] font-bold text-[rgba(245,247,250,0.8)] block mb-1">
                    Vehicle Type
                  </label>
                  <select
                    {...register("vehicleType")}
                    className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#D84A2B]"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV / 4x4</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="ev">Electric (EV)</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="ev-check"
                    {...register("isEV")}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#D84A2B] focus:ring-[#D84A2B]"
                  />
                  <label htmlFor="ev-check" className="text-[12.5px] text-white/90 font-medium cursor-pointer">
                    EV Charging
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="handicap-check"
                    {...register("isHandicapped")}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#D84A2B] focus:ring-[#D84A2B]"
                  />
                  <label htmlFor="handicap-check" className="text-[12.5px] text-white/90 font-medium cursor-pointer">
                    Accessible / Lift
                  </label>
                </div>
              </div>
            </div>

            {/* Active Session Warning Banner */}
            {activeBooking && (
              <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#EF4444] block">
                      Active Parking Session Detected
                    </span>
                    <h4 className="text-[15px] font-bold text-white mt-0.5">
                      Vehicle {normalizedPlate} already has an active session
                    </h4>
                    <p className="text-[12.5px] text-white/70 mt-1">
                      Assigned Space: <span className="font-mono font-bold text-white">{activeBooking.slotDetails?.slotNumber || activeBooking.slotId}</span> (Level {activeBooking.slotDetails?.floor}) · Entered at {new Date(activeBooking.entryTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/active-sessions"
                  className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-[12.5px] transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>View Active Session</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* ── VEHICLE REGISTRATION VERIFICATION SECTION ── */}
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-[#D84A2B]" />
                  <h3 className="text-[15px] font-bold text-white">
                    Vehicle Registration Verification
                  </h3>
                </div>

                {/* Status Badges */}
                <div>
                  {verificationData.status === "NOT_CHECKED" && (
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60 border border-white/[0.1] text-[11px] font-bold">
                      NOT CHECKED
                    </span>
                  )}
                  {verificationData.status === "CHECKING" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#2563EB]/20 text-[#60A5FA] border border-[#2563EB]/40 text-[11px] font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      VERIFYING...
                    </span>
                  )}
                  {verificationData.status === "VERIFIED" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 text-[11px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  )}
                  {verificationData.status === "MANUAL_VERIFIED" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40 text-[11px] font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      MANUALLY VERIFIED
                    </span>
                  )}
                  {verificationData.status === "UNAVAILABLE" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      UNAVAILABLE
                    </span>
                  )}
                  {verificationData.status === "INVALID" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 text-[11px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      INVALID
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Details Body */}
              {verificationData.status === "NOT_CHECKED" && (
                <div className="bg-[#0A0D14] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      Ready to Verify {normalizedPlate || "Vehicle"}
                    </p>
                    <p className="text-[11.5px] text-white/50 mt-0.5">
                      Query registration records before assigning space.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyRegistration}
                    disabled={!normalizedPlate || isVerifying || (formatValidation !== null && !formatValidation.isValid)}
                    className="px-4 py-2 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[12.5px] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Verify Registration
                  </button>
                </div>
              )}

              {verificationData.status === "CHECKING" && (
                <div className="bg-[#0A0D14] border border-white/[0.06] rounded-xl p-5 flex items-center justify-center gap-3 text-white/80">
                  <RefreshCw className="w-5 h-5 text-[#2563EB] animate-spin" />
                  <span className="text-[13px] font-semibold">Connecting to vehicle verification gateway...</span>
                </div>
              )}

              {verificationData.status === "VERIFIED" && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[12px]">
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-white/40 block text-[10.5px]">Make &amp; Model</span>
                      <span className="font-semibold text-white">
                        {verificationData.make || "N/A"} {verificationData.model || ""}
                      </span>
                    </div>
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-white/40 block text-[10.5px]">Colour</span>
                      <span className="font-semibold text-white">{verificationData.colour || "Standard"}</span>
                    </div>
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-white/40 block text-[10.5px]">Vehicle Class</span>
                      <span className="font-semibold text-white">{verificationData.vehicleClass || "Motor Car (LMV)"}</span>
                    </div>
                    <div className="bg-[#0A0D14] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-white/40 block text-[10.5px]">RC Status</span>
                      <span className="font-semibold text-[#10B981]">{verificationData.registrationStatus || "ACTIVE"}</span>
                    </div>
                  </div>

                  {/* Physical Vehicle Confirmation Checkbox */}
                  <div
                    onClick={() => setPhysicalMatchConfirmed(!physicalMatchConfirmed)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      physicalMatchConfirmed
                        ? "bg-[#10B981]/10 border-[#10B981]/30 text-white"
                        : "bg-[#0A0D14] border-white/[0.1] text-white/80 hover:border-white/20"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      physicalMatchConfirmed ? "bg-[#10B981] text-white" : "border border-white/30"
                    }`}>
                      {physicalMatchConfirmed && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-[12.5px] font-medium">
                      I confirm the physical vehicle matches the verified make, model, and colour.
                    </span>
                  </div>
                </div>
              )}

              {verificationData.status === "UNAVAILABLE" && (
                <div className="bg-[#0A0D14] border border-[#F59E0B]/30 rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-[#F59E0B]">
                      Online verification is temporarily unavailable
                    </p>
                    <p className="text-[11.5px] text-white/60 mt-0.5">
                      {verificationData.errorMessage || "Unable to reach verification service. Authorised operators may proceed with manual RC inspection."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleVerifyRegistration}
                      disabled={isVerifying}
                      className="px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                    >
                      Retry Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-[#C4B5FD] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Manual RC Verification
                    </button>
                  </div>
                </div>
              )}

              {verificationData.status === "INVALID" && (
                <div className="bg-[#0A0D14] border border-[#EF4444]/30 rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-[#EF4444]">
                      Registration Record Not Found
                    </p>
                    <p className="text-[11.5px] text-white/60 mt-0.5">
                      {verificationData.errorMessage || "Vehicle not found in official registry. If this is a newly registered vehicle, use manual verification."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setManualModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-[#C4B5FD] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Manual RC Verification
                    </button>
                  </div>
                </div>
              )}

              {verificationData.status === "MANUAL_VERIFIED" && (
                <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl p-3.5 flex flex-col gap-1.5 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C4B5FD] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Manually Verified by Operator (Station 01)
                    </span>
                    <span className="text-white/50 text-[11px]">
                      {new Date(verificationData.verifiedAt || "").toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white/80">
                    Reason: <span className="font-medium">{verificationData.manualReason}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Contact Verification */}
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#10B981]" />
                  <span className="text-[14px] font-bold text-white">
                    Step 2: Contact Verification &amp; Pass Delivery
                  </span>
                </div>
                <span className="text-[11px] text-white/50">Digital Delivery</span>
              </div>

              <p className="text-[12.5px] text-[rgba(245,247,250,0.65)] leading-relaxed">
                Enter mobile number or email for digital pass delivery, or print on screen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-white flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[rgba(245,247,250,0.5)]" />
                    <span>Customer Mobile (Optional)</span>
                  </label>
                  <input
                    {...register("phoneNumber")}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-[13.5px] font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                  />
                  {errors.phoneNumber && (
                    <p className="text-[11px] text-[#EF4444]">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[rgba(245,247,250,0.5)]" />
                    <span>Customer Email (Optional)</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="customer@domain.com"
                    className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-[#EF4444]">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Space Recommendations & Submit (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-[14px] font-bold text-white">Recommended Spaces</h3>
                </div>
                <span className="text-[11px] text-[#60A5FA] font-bold">Top 3 Ranked</span>
              </div>

              {topRecommendations.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {topRecommendations.map((rec) => {
                    const isSelected = currentSlotId === rec.slot.slotId;
                    return (
                      <div
                        key={rec.slot.slotId}
                        onClick={() => setValue("slotId", rec.slot.slotId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? "bg-[#151B24] border-[#2563EB] ring-2 ring-[#2563EB]/40 shadow-lg"
                            : "bg-[#0A0D14] border-white/[0.08] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[11px] font-black flex items-center justify-center">
                              #{rec.rank}
                            </span>
                            <span className="font-mono font-black text-[15px] text-white">
                              Space {rec.slot.slotNumber}
                            </span>
                            <span className="text-[11px] text-[rgba(245,247,250,0.6)]">
                              (Level {rec.slot.floor} · {rec.slot.pillar})
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#60A5FA] bg-[#2563EB]/15 px-2.5 py-0.5 rounded-full border border-[#2563EB]/30">
                            {rec.score}/100 Match
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[rgba(245,247,250,0.8)] leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-[12.5px] text-[rgba(245,247,250,0.5)]">
                  No available spaces match the selected floor.
                </div>
              )}

              {/* All Available Dropdown Fallback */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
                <label className="text-[11.5px] font-bold text-[rgba(245,247,250,0.7)]">
                  Or Manually Select Any Available Space
                </label>
                <select
                  {...register("slotId")}
                  className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3 py-2.5 text-[13px] text-white font-mono focus:outline-none focus:border-[#D84A2B]"
                >
                  <option value="">-- Choose Space --</option>
                  {rawSlots
                    .filter((s) => s.status === "available")
                    .map((s) => (
                      <option key={s.slotId} value={s.slotId}>
                        Space {s.slotNumber} · Level {s.floor} ({s.zone} · {s.pillar})
                      </option>
                    ))}
                </select>
                {errors.slotId && (
                  <p className="text-[11px] text-[#EF4444]">{errors.slotId.message}</p>
                )}
              </div>

              {/* Verification Gate Notice before submit */}
              {!canProceedToAssign && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[12px] text-white/60 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>
                    {activeBooking
                      ? "Vehicle already has an active session. Cannot issue duplicate pass."
                      : "Complete vehicle verification and confirm physical match to issue pass."}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessingEntry || !canProceedToAssign}
                className="w-full h-12 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] disabled:opacity-40 disabled:hover:bg-[#D84A2B] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(216,74,43,0.3)] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isProcessingEntry ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Entry...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Entry &amp; Issue Exit Pass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Completed Pass State */
        <div className="max-w-[640px] mx-auto bg-[#10151D] border border-white/[0.12] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#10B981]">
                ENTRY CONFIRMED
              </span>
              <h2 className="text-[22px] font-black text-white">Space Assigned &amp; Pass Issued</h2>
            </div>
          </div>

          <div className="bg-[#0A0D14] border border-white/[0.08] rounded-2xl p-5 flex flex-col items-center gap-4 text-center">
            <div className="bg-white p-3 rounded-2xl">
              <QRCodeSVG value={completedPass.dashboardLink || completedPass.exitPassToken} size={180} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-white/50 uppercase">Offline Fallback Code</span>
              <span className="text-[22px] font-mono font-black text-[#D84A2B] tracking-wider">
                {completedPass.fallbackCode}
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-[12.5px] pt-3 border-t border-white/[0.06] text-left">
              <div className="bg-[#151B24] p-3 rounded-xl">
                <span className="text-white/50 block text-[11px]">Vehicle Number</span>
                <span className="font-mono font-bold text-white">{completedPass.vehicleNumber}</span>
              </div>
              <div className="bg-[#151B24] p-3 rounded-xl">
                <span className="text-white/50 block text-[11px]">Assigned Space</span>
                <span className="font-mono font-bold text-white">
                  Space {completedPass.slotNumber} (Level {completedPass.floor})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCompletedPass(null);
                setValue("vehicleNumber", "");
                setValue("phoneNumber", "");
                setValue("email", "");
                setVerificationData({ status: "NOT_CHECKED", normalizedRegistrationNumber: "" });
                setPhysicalMatchConfirmed(false);
              }}
              className="flex-1 h-11 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CarFront className="w-4 h-4" />
              <span>Process Next Vehicle</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MANUAL VERIFICATION MODAL ── */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#10151D] border border-white/[0.15] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/15 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
                  AUTHORISED OVERRIDE
                </span>
                <span className="text-[12px] text-white/50">· Operator Station 01</span>
              </div>
              <h3 className="text-[18px] font-bold text-white">Manual Vehicle RC Verification</h3>
              <p className="text-[12.5px] text-white/60 mt-0.5">
                Record physical inspection of vehicle registration smart card / documents. This action is permanently logged in the security audit trail.
              </p>
            </div>

            <form onSubmit={handleManualVerificationSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11.5px] font-bold text-white/80 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={normalizedPlate}
                  readOnly
                  className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3.5 py-2 text-[13.5px] font-mono font-bold text-white/80"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-white/80 mb-1">
                  Mandatory Justification / Reason <span className="text-[#D84A2B]">*</span>
                </label>
                <textarea
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g., Physical RC Smart Card inspected at gate; Online service offline"
                  required
                  rows={2}
                  className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl p-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Physical Make</label>
                  <input
                    type="text"
                    value={manualPhysicalMake}
                    onChange={(e) => setManualPhysicalMake(e.target.value)}
                    placeholder="e.g., Hyundai"
                    className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-[12.5px] text-white focus:outline-none focus:border-[#D84A2B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Physical Model</label>
                  <input
                    type="text"
                    value={manualPhysicalModel}
                    onChange={(e) => setManualPhysicalModel(e.target.value)}
                    placeholder="e.g., Creta"
                    className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-[12.5px] text-white focus:outline-none focus:border-[#D84A2B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Physical Colour</label>
                  <input
                    type="text"
                    value={manualPhysicalColour}
                    onChange={(e) => setManualPhysicalColour(e.target.value)}
                    placeholder="e.g., White"
                    className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-[12.5px] text-white focus:outline-none focus:border-[#D84A2B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-white text-[12.5px] font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting || !manualReason.trim() || manualReason.trim().length < 4}
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[12.5px] font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  {manualSubmitting ? "Recording..." : "Confirm Manual Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-[1280px] mx-auto flex items-center justify-center text-white/50">
          Loading Entry Control...
        </div>
      }
    >
      <NewEntryContent />
    </Suspense>
  );
}
