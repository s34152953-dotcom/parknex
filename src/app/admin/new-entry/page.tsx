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
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  ExternalLink,
  Copy,
  Check,
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
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim()),
      {
        message: "Please enter a valid customer email address (e.g. name@domain.com)",
      }
    ),
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
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number | null>(null);
  const [cameraStatusMsg, setCameraStatusMsg] = useState<string>("");
  const [isProcessingEntry, setIsProcessingEntry] = useState(false);
  const [completedPass, setCompletedPass] = useState<any | null>(null);
  const [isRetryingEmail, setIsRetryingEmail] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
          errorMessage: data.errorMessage || "Online verification is temporarily unavailable.",
          verifiedAt: data.verifiedAt,
        });
      }
    } catch (err: any) {
      setVerificationData({
        status: "UNAVAILABLE",
        normalizedRegistrationNumber: normalizedPlate,
        errorMessage: "Online verification is temporarily unavailable.",
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

  // Gate Check: Can proceed to space assignment?
  const canProceedToAssign = useMemo(() => {
    if (activeBooking) return false;
    return true; // Vehicle verification & physical match are optional
  }, [activeBooking]);

  // Form Submission
  const onSubmit = async (data: EntryFormData) => {
    if (activeBooking) {
      alert("Vehicle already has an active parking session. Duplicate passes cannot be issued.");
      return;
    }

    setIsProcessingEntry(true);
    const cleanEmail = data.email ? data.email.trim().toLowerCase() : undefined;

    try {
      const selectedRec = topRecommendations.find((r) => r.slot.slotId === data.slotId);

      // 1. Commit parking assignment in Convex atomically
      const result = await createWalkInEntryMutation({
        slotId: data.slotId,
        vehicleNumber: normalizedPlate,
        phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : undefined,
        email: cleanEmail,
        vehicleType: data.vehicleType,
        entryType: "walk_in",
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

      // 2. Build secure direct access token link
      const origin = typeof window !== "undefined" ? window.location.origin : "https://parknex.vercel.app";
      const directToken = result.customerAccessToken || result.token;
      const secureDashboardLink = `${origin}/customer/access/${directToken}`;

      // 3. Trigger server-side transactional email if customer email was provided
      let emailStatus = cleanEmail ? "queued" : "not_requested";
      let maskedEmail = "";
      let emailError = "";

      if (cleanEmail) {
        try {
          const emailRes = await fetch("/api/notifications/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: result.bookingId,
              to: cleanEmail,
              vehicleNumber: normalizedPlate,
              slotNumber: result.slotNumber,
              floor: result.floor,
              zone: result.zone,
              pillar: result.pillar,
              mallName: "Central Mall Grand",
              customerAccessToken: directToken,
              fallbackCode: result.fallbackCode,
            }),
          });
          const emailData = await emailRes.json();
          emailStatus = emailData.status || (emailData.success ? "sent" : "failed");
          maskedEmail = emailData.maskedRecipient || cleanEmail;
          emailError = emailData.error || "";
        } catch (e: any) {
          emailStatus = "failed";
          emailError = e.message || "Failed to deliver email notification.";
        }
      }

      setCompletedPass({
        ...result,
        vehicleNumber: normalizedPlate,
        phoneNumber: data.phoneNumber,
        email: cleanEmail,
        maskedEmail,
        emailStatus,
        emailError,
        vehicleType: data.vehicleType,
        dashboardLink: secureDashboardLink,
      });
    } catch (err: any) {
      alert(err.message || "Failed to process entry");
    } finally {
      setIsProcessingEntry(false);
    }
  };

  const handleRetryEmail = async () => {
    if (!completedPass?.bookingId || !completedPass?.email) return;
    setIsRetryingEmail(true);
    try {
      const emailRes = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: completedPass.bookingId,
          to: completedPass.email,
          vehicleNumber: completedPass.vehicleNumber,
          slotNumber: completedPass.slotNumber,
          floor: completedPass.floor,
          zone: completedPass.zone,
          pillar: completedPass.pillar,
          mallName: "Central Mall Grand",
          customerAccessToken: completedPass.customerAccessToken || completedPass.token,
          fallbackCode: completedPass.fallbackCode,
        }),
      });
      const emailData = await emailRes.json();
      setCompletedPass((prev: any) => ({
        ...prev,
        emailStatus: emailData.status || (emailData.success ? "sent" : "failed"),
        maskedEmail: emailData.maskedRecipient || prev.email,
        emailError: emailData.error || "",
      }));
    } catch (err: any) {
      setCompletedPass((prev: any) => ({
        ...prev,
        emailStatus: "failed",
        emailError: err.message || "Retry delivery failed",
      }));
    } finally {
      setIsRetryingEmail(false);
    }
  };

  const handleCopyDashboardLink = () => {
    if (!completedPass?.dashboardLink) return;
    navigator.clipboard.writeText(completedPass.dashboardLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              ENTRY CONTROL
            </span>
            <span className="text-[12px] text-[#70675F]">· Gate A Inbound</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
              Process Vehicle Entry
            </h1>
            <p className="text-[13.5px] text-[#70675F] mt-0.5">
              Two-step vehicle entry, plate verification, and space allocation.
            </p>
          </div>
        </div>
      </div>

      {!completedPass ? (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Camera, Plate Entry & Verification (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">

            {/* Step 1: Camera / Plate Detection Box */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4.5 h-4.5 text-[#C93B2F]" />
                  <span className="text-[14.5px] font-bold text-[#241F1B]">
                    Step 1: Entry Camera &amp; Plate Detection
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!cameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F3EAE0] border border-[#DED3C7] text-[#241F1B] text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Start Camera
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded-lg bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Stop Camera
                    </button>
                  )}
                </div>
              </div>

              {/* Video Viewport / Reticle */}
              <div className="relative w-full h-[200px] bg-[#FAF7F2] rounded-xl border border-[#DED3C7] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  playsInline
                  muted
                />

                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-[#70675F]">
                    <Camera className="w-8 h-8 text-[#938980] mb-2" />
                    <p className="text-[13px] font-bold text-[#241F1B]">Camera Inactive</p>
                    <p className="text-[11.5px] text-[#70675F] max-w-[260px] mt-0.5">
                      Click &ldquo;Start Camera&rdquo; or type vehicle number directly below.
                    </p>
                  </div>
                )}

                {/* Reticle Target Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-[80%] h-[60%] border-2 border-dashed border-[#C93B2F]/70 rounded-lg flex items-center justify-center bg-[#C93B2F]/[0.02]">
                      <span className="text-[10.5px] font-mono text-white font-bold bg-[#241F1B]/80 px-2 py-0.5 rounded">
                        ALIGN NUMBER PLATE
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Number Input Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#241F1B] flex items-center justify-between">
                  <span>Vehicle Number Plate (Mandatory)</span>
                  {normalizedPlate && (
                    <span className="text-[11px] font-mono text-[#2F7D5A] font-bold">
                      Normalized: {normalizedPlate}
                    </span>
                  )}
                </label>
                <input
                  {...register("vehicleNumber")}
                  placeholder="e.g., MH02AB1234 or 22BH1234AA"
                  className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-4 py-3 text-[16px] font-mono font-black text-[#241F1B] uppercase placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                />
                {errors.vehicleNumber && (
                  <p className="text-[11.5px] text-[#C93B2F] font-semibold">{errors.vehicleNumber.message}</p>
                )}
                {formatValidation && !formatValidation.isValid && (
                  <p className="text-[11.5px] text-[#C93B2F] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formatValidation.error}</span>
                  </p>
                )}
              </div>

              {/* Vehicle Type & Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11.5px] font-bold text-[#241F1B] block mb-1">
                    Vehicle Type
                  </label>
                  <select
                    {...register("vehicleType")}
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3 py-2 text-[13px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
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
                    className="w-4 h-4 rounded border-[#DED3C7] text-[#C93B2F] focus:ring-[#C93B2F]"
                  />
                  <label htmlFor="ev-check" className="text-[12.5px] text-[#241F1B] font-medium cursor-pointer">
                    EV Charging
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="handicap-check"
                    {...register("isHandicapped")}
                    className="w-4 h-4 rounded border-[#DED3C7] text-[#C93B2F] focus:ring-[#C93B2F]"
                  />
                  <label htmlFor="handicap-check" className="text-[12.5px] text-[#241F1B] font-medium cursor-pointer">
                    Accessible / Lift
                  </label>
                </div>
              </div>
            </div>

            {/* Active Session Warning Banner */}
            {activeBooking && (
              <div className="bg-[#C93B2F]/10 border border-[#C93B2F]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-[#C93B2F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C93B2F] block">
                      Active Parking Session Detected
                    </span>
                    <h4 className="text-[15px] font-bold text-[#241F1B] mt-0.5">
                      Vehicle {normalizedPlate} already has an active session
                    </h4>
                    <p className="text-[12.5px] text-[#70675F] mt-1">
                      Assigned Space: <span className="font-mono font-bold text-[#241F1B]">{activeBooking.slotDetails?.slotNumber || activeBooking.slotId}</span> (Level {activeBooking.slotDetails?.floor}) · Entered at {new Date(activeBooking.entryTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/active-sessions"
                  className="px-4 py-2 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[12.5px] transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>View Active Session</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* ── VEHICLE REGISTRATION VERIFICATION SECTION ── */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-[#C93B2F]" />
                  <h3 className="text-[15px] font-bold text-[#241F1B]">
                    Vehicle Registration Verification
                    <span className="ml-2 text-[12px] font-normal text-[#70675F]">(Optional)</span>
                  </h3>
                </div>

                {/* Status Badges */}
                <div>
                  {verificationData.status === "NOT_CHECKED" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] text-[11px] font-bold">
                      NOT CHECKED
                    </span>
                  )}
                  {verificationData.status === "CHECKING" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#3569A8]/10 text-[#3569A8] border border-[#3569A8]/30 text-[11px] font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      VERIFYING...
                    </span>
                  )}
                  {verificationData.status === "VERIFIED" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/30 text-[11px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  )}
                  {verificationData.status === "MANUAL_VERIFIED" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#3569A8]/10 text-[#3569A8] border border-[#3569A8]/30 text-[11px] font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      MANUALLY VERIFIED
                    </span>
                  )}
                  {verificationData.status === "UNAVAILABLE" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      SERVICE UNAVAILABLE
                    </span>
                  )}
                  {verificationData.status === "INVALID" && (
                    <span className="px-2.5 py-1 rounded-full bg-[#C93B2F]/10 text-[#C93B2F] border border-[#C93B2F]/30 text-[11px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      INVALID REGISTRATION
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Details Body */}
              {verificationData.status === "NOT_CHECKED" && (
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-bold text-[#241F1B]">
                      Check the vehicle details before assigning a parking space.
                    </p>
                    <p className="text-[12px] text-[#70675F] mt-0.5">
                      Verify registration records for {normalizedPlate || "vehicle"}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyRegistration}
                    disabled={!normalizedPlate || isVerifying || (formatValidation !== null && !formatValidation.isValid)}
                    className="px-4 py-2 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[12.5px] transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                  >
                    Verify Registration
                  </button>
                </div>
              )}

              {verificationData.status === "CHECKING" && (
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-5 flex items-center justify-center gap-3 text-[#70675F]">
                  <RefreshCw className="w-5 h-5 text-[#3569A8] animate-spin" />
                  <span className="text-[13px] font-semibold text-[#241F1B]">Connecting to vehicle verification gateway...</span>
                </div>
              )}

              {verificationData.status === "VERIFIED" && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[12px]">
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                      <span className="text-[#70675F] block text-[10.5px]">Make &amp; Model</span>
                      <span className="font-bold text-[#241F1B]">
                        {verificationData.make || "N/A"} {verificationData.model || ""}
                      </span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                      <span className="text-[#70675F] block text-[10.5px]">Colour</span>
                      <span className="font-bold text-[#241F1B]">{verificationData.colour || "Standard"}</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                      <span className="text-[#70675F] block text-[10.5px]">Vehicle Class</span>
                      <span className="font-bold text-[#241F1B]">{verificationData.vehicleClass || "Motor Car (LMV)"}</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                      <span className="text-[#70675F] block text-[10.5px]">RC Status</span>
                      <span className="font-bold text-[#2F7D5A]">{verificationData.registrationStatus || "ACTIVE"}</span>
                    </div>
                  </div>

                  {/* Physical Vehicle Confirmation Checkbox */}
                  <div
                    onClick={() => setPhysicalMatchConfirmed(!physicalMatchConfirmed)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      physicalMatchConfirmed
                        ? "bg-[#2F7D5A]/10 border-[#2F7D5A]/40 text-[#241F1B]"
                        : "bg-[#FAF7F2] border-[#DED3C7] text-[#241F1B] hover:border-[#CBBCAE]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      physicalMatchConfirmed ? "bg-[#2F7D5A] text-white" : "border border-[#DED3C7] bg-white"
                    }`}>
                      {physicalMatchConfirmed && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-[13px] font-semibold">
                      I confirm the physical vehicle matches the verified make, model, and colour (Optional).
                    </span>
                  </div>
                </div>
              )}

              {verificationData.status === "UNAVAILABLE" && (
                <div className="bg-[#FAF7F2] border border-[#B7791F]/30 rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[13.5px] font-bold text-[#B7791F]">
                      Online verification is temporarily unavailable
                    </p>
                    <p className="text-[12px] text-[#70675F] mt-0.5">
                      {verificationData.errorMessage || "Unable to reach verification service. Authorised operators may proceed with manual RC inspection."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleVerifyRegistration}
                      disabled={isVerifying}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[12px] font-bold hover:bg-[#F3EAE0] transition-colors cursor-pointer shadow-xs"
                    >
                      Retry Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#3569A8] hover:bg-[#25538C] text-white text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Manual RC Verification
                    </button>
                  </div>
                </div>
              )}

              {verificationData.status === "INVALID" && (
                <div className="bg-[#FAF7F2] border border-[#C93B2F]/30 rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[13.5px] font-bold text-[#C93B2F]">
                      Registration Record Not Found
                    </p>
                    <p className="text-[12px] text-[#70675F] mt-0.5">
                      {verificationData.errorMessage || "Vehicle not found in official registry. If this is a newly registered vehicle, use manual verification."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setManualModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#3569A8] hover:bg-[#25538C] text-white text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Manual RC Verification
                    </button>
                  </div>
                </div>
              )}

              {verificationData.status === "MANUAL_VERIFIED" && (
                <div className="bg-[#3569A8]/10 border border-[#3569A8]/30 rounded-xl p-3.5 flex flex-col gap-1 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3569A8] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Manually Verified by Operator (Station 01)
                    </span>
                    <span className="text-[#70675F] text-[11px]">
                      {new Date(verificationData.verifiedAt || "").toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[#241F1B]">
                    Reason: <span className="font-semibold">{verificationData.manualReason}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Contact Verification */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#2F7D5A]" />
                  <span className="text-[14.5px] font-bold text-[#241F1B]">
                    Step 2: Contact Verification &amp; Pass Delivery
                  </span>
                </div>
                <span className="text-[11px] text-[#70675F] font-bold">Digital Delivery</span>
              </div>

              <p className="text-[12.5px] text-[#70675F] leading-relaxed">
                Enter mobile number or email for digital pass delivery, or print on screen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#241F1B] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#70675F]" />
                    <span>Customer Mobile (Optional)</span>
                  </label>
                  <input
                    {...register("phoneNumber")}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3.5 py-2.5 text-[13.5px] font-mono text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
                  />
                  {errors.phoneNumber && (
                    <p className="text-[11px] text-[#C93B2F]">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-bold text-[#241F1B] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#70675F]" />
                    <span>Customer Email Address (Optional)</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="customer@domain.com"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-[#C93B2F] font-semibold">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Space Recommendations & Submit (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
              <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3569A8]" />
                  <h3 className="text-[14.5px] font-bold text-[#241F1B]">Recommended Spaces</h3>
                </div>
                <span className="text-[11px] text-[#3569A8] font-bold bg-[#3569A8]/10 px-2 py-0.5 rounded border border-[#3569A8]/20">
                  Top 3 Ranked
                </span>
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
                            ? "bg-[#F9E3DE] border-[#C93B2F] ring-2 ring-[#C93B2F]/20 shadow-sm"
                            : "bg-[#FAF7F2] border-[#DED3C7] hover:bg-[#F3EAE0]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#3569A8] text-white text-[11px] font-black flex items-center justify-center">
                              #{rec.rank}
                            </span>
                            <span className="font-mono font-black text-[15px] text-[#241F1B]">
                              Space {rec.slot.slotNumber}
                            </span>
                            <span className="text-[11.5px] text-[#70675F]">
                              (Level {rec.slot.floor} · {rec.slot.pillar})
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#3569A8] bg-[#3569A8]/10 px-2 py-0.5 rounded-full border border-[#3569A8]/20">
                            {rec.score}/100 Match
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#70675F] leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-[12.5px] text-[#70675F]">
                  No available spaces match the selected floor.
                </div>
              )}

              {/* All Available Dropdown Fallback */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#DED3C7]">
                <label className="text-[11.5px] font-bold text-[#70675F]">
                  Or Manually Select Any Available Space
                </label>
                <select
                  {...register("slotId")}
                  className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3 py-2.5 text-[13px] text-[#241F1B] font-mono focus:outline-none focus:border-[#C93B2F]"
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
                  <p className="text-[11px] text-[#C93B2F]">{errors.slotId.message}</p>
                )}
              </div>

              {/* Active Booking Notice before submit */}
              {activeBooking && (
                <div className="p-3 rounded-xl bg-[#F3EAE0] border border-[#DED3C7] text-[12px] text-[#70675F] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#C93B2F] shrink-0" />
                  <span>
                    Vehicle already has an active session. Cannot issue duplicate pass.
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessingEntry || !canProceedToAssign}
                className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] disabled:opacity-40 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(201,59,47,0.25)] transition-all cursor-pointer disabled:cursor-not-allowed"
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
        <div className="max-w-[640px] mx-auto bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_8px_24px_rgba(70,48,35,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2F7D5A]/15 text-[#2F7D5A] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2F7D5A]">
                ENTRY CONFIRMED
              </span>
              <h2 className="text-[22px] font-black text-[#241F1B]">Space Assigned &amp; Pass Issued</h2>
            </div>
          </div>

          <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-5 flex flex-col items-center gap-4 text-center">
            <div className="bg-white p-3 rounded-2xl border border-[#DED3C7] shadow-xs">
              <QRCodeSVG value={completedPass.dashboardLink || completedPass.exitPassToken} size={180} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-[#70675F] uppercase">Offline Fallback Code</span>
              <span className="text-[22px] font-mono font-black text-[#C93B2F] tracking-wider">
                {completedPass.fallbackCode}
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-[12.5px] pt-3 border-t border-[#DED3C7] text-left">
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#DED3C7]">
                <span className="text-[#70675F] block text-[11px]">Vehicle Number</span>
                <span className="font-mono font-bold text-[#241F1B]">{completedPass.vehicleNumber}</span>
              </div>
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#DED3C7]">
                <span className="text-[#70675F] block text-[11px]">Assigned Space</span>
                <span className="font-mono font-bold text-[#241F1B]">
                  Space {completedPass.slotNumber} (Level {completedPass.floor})
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Feedback Banner */}
          <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#70675F]">
                Digital Pass Delivery
              </span>
              {completedPass.emailStatus === "sent" && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/30 text-[11px] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  EMAIL DELIVERED
                </span>
              )}
              {completedPass.emailStatus === "failed" && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#C93B2F]/10 text-[#C93B2F] border border-[#C93B2F]/30 text-[11px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  EMAIL FAILED
                </span>
              )}
              {completedPass.emailStatus === "not_requested" && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] text-[11px] font-bold">
                  NO EMAIL PROVIDED
                </span>
              )}
            </div>

            <div className="text-[13px]">
              {completedPass.emailStatus === "sent" && (
                <p className="text-[#2F7D5A] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Assignment email sent to {completedPass.maskedEmail || completedPass.email}.</span>
                </p>
              )}
              {completedPass.emailStatus === "failed" && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-[#C93B2F] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Space assigned, but email delivery failed.</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleRetryEmail}
                    disabled={isRetryingEmail}
                    className="px-3 py-1.5 rounded-lg bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetryingEmail ? "animate-spin" : ""}`} />
                    <span>Retry Email</span>
                  </button>
                </div>
              )}
              {completedPass.emailStatus === "not_requested" && (
                <p className="text-[#70675F]">
                  Parking space assigned successfully. Pass issued for on-screen view or physical print.
                </p>
              )}
            </div>

            {/* Copy Dashboard Link */}
            <div className="pt-2.5 border-t border-[#DED3C7] flex items-center justify-between gap-2">
              <span className="text-[12px] text-[#70675F] truncate max-w-[280px] font-mono">
                {completedPass.dashboardLink}
              </span>
              <button
                type="button"
                onClick={handleCopyDashboardLink}
                className="px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2F7D5A]" />
                    <span className="text-[#2F7D5A]">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#70675F]" />
                    <span>Copy Customer Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 h-11 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
              className="flex-1 h-11 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <CarFront className="w-4 h-4" />
              <span>Process Next Vehicle</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MANUAL VERIFICATION MODAL ── */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#3569A8] bg-[#3569A8]/10 px-2 py-0.5 rounded border border-[#3569A8]/20">
                  AUTHORISED OVERRIDE
                </span>
                <span className="text-[12px] text-[#70675F]">· Operator Station 01</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#241F1B]">Manual Vehicle RC Verification</h3>
              <p className="text-[12.5px] text-[#70675F] mt-0.5">
                Record physical inspection of vehicle registration smart card / documents. This action is permanently logged in the security audit trail.
              </p>
            </div>

            <form onSubmit={handleManualVerificationSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11.5px] font-bold text-[#241F1B] mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={normalizedPlate}
                  readOnly
                  className="w-full bg-[#FAF7F2] border border-[#DED3C7] rounded-xl px-3.5 py-2 text-[13.5px] font-mono font-bold text-[#241F1B]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#241F1B] mb-1">
                  Mandatory Justification / Reason <span className="text-[#C93B2F]">*</span>
                </label>
                <textarea
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g., Physical RC Smart Card inspected at gate; Online service offline"
                  required
                  rows={2}
                  className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3 text-[13px] text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#70675F] mb-1">Physical Make</label>
                  <input
                    type="text"
                    value={manualPhysicalMake}
                    onChange={(e) => setManualPhysicalMake(e.target.value)}
                    placeholder="e.g., Hyundai"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#70675F] mb-1">Physical Model</label>
                  <input
                    type="text"
                    value={manualPhysicalModel}
                    onChange={(e) => setManualPhysicalModel(e.target.value)}
                    placeholder="e.g., Creta"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#70675F] mb-1">Physical Colour</label>
                  <input
                    type="text"
                    value={manualPhysicalColour}
                    onChange={(e) => setManualPhysicalColour(e.target.value)}
                    placeholder="e.g., White"
                    className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DED3C7]">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] text-[#241F1B] text-[12.5px] font-bold hover:bg-[#F3EAE0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting || !manualReason.trim() || manualReason.trim().length < 4}
                  className="px-4 py-2 rounded-xl bg-[#3569A8] hover:bg-[#25538C] text-white text-[12.5px] font-bold transition-colors cursor-pointer disabled:opacity-40"
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
        <div className="p-8 max-w-[1440px] mx-auto flex items-center justify-center text-[#70675F]">
          Loading Entry Control...
        </div>
      }
    >
      <NewEntryContent />
    </Suspense>
  );
}
