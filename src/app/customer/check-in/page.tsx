"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  Car,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Camera,
  Navigation,
  ArrowLeft,
  Building2,
  Info,
} from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

export default function CustomerCheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email || "";

  const user = useQuery(api.users.getUser, userEmail ? { email: userEmail } : "skip");
  const slotsData = useQuery(api.slots.getSlots, {});
  const createCheckInMutation = useMutation(api.bookings.createCustomerCheckIn);

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleType, setVehicleType] = useState<"sedan" | "suv" | "hatchback" | "ev" | "motorcycle">("sedan");
  const [facility, setFacility] = useState("Central Mall Grand");
  const [zone, setZone] = useState("Zone A");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [pillar, setPillar] = useState("Pillar 02");
  const [destination, setDestination] = useState("Food Court");
  const [spaceImageUrl, setSpaceImageUrl] = useState("");
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);

  // Processing & Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Prepopulate vehicle details from profile
  useEffect(() => {
    if (user?.vehicleNumber) {
      setVehicleNumber(user.vehicleNumber);
    }
    if (user?.vehicleModel) {
      setVehicleModel(user.vehicleModel);
    }
    if (user?.vehicleType) {
      setVehicleType(user.vehicleType as any);
    }
  }, [user]);

  // Set default slot when slots load
  useEffect(() => {
    if (slotsData?.slots && slotsData.slots.length > 0 && !selectedSlotId) {
      const available = slotsData.slots.find((s) => s.status === "available" && s.zone === zone);
      if (available) {
        setSelectedSlotId(available.slotId);
        setPillar(available.pillar);
      } else {
        const anyAvailable = slotsData.slots.find((s) => s.status === "available");
        if (anyAvailable) {
          setSelectedSlotId(anyAvailable.slotId);
          setPillar(anyAvailable.pillar);
          setZone(anyAvailable.zone);
        }
      }
    }
  }, [slotsData, zone, selectedSlotId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/customer/login");
    return null;
  }

  const handleSlotChange = (slotId: string) => {
    setSelectedSlotId(slotId);
    const slot = slotsData?.slots.find((s) => s.slotId === slotId);
    if (slot) {
      setPillar(slot.pillar);
      setZone(slot.zone);
    }
  };

  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
    const firstInZone = slotsData?.slots.find(
      (s) => s.status === "available" && s.zone === newZone
    );
    if (firstInZone) {
      setSelectedSlotId(firstInZone.slotId);
      setPillar(firstInZone.pillar);
    }
  };

  const handleSimulatePhoto = () => {
    setIsSimulatingCamera(true);
    setTimeout(() => {
      setSpaceImageUrl(`https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80`);
      setIsSimulatingCamera(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = vehicleNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim();

    if (!cleanPlate || cleanPlate.length < 4) {
      setErrorMessage("Please enter a valid license plate number (e.g. MH02AB1234).");
      return;
    }
    if (!selectedSlotId) {
      setErrorMessage("Please select an available parking space.");
      return;
    }

    setErrorMessage("");
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // 1. Send check-in event through RocketRide parking-verification.pipe via backend API
      const response = await fetch("/api/rocketride/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber: cleanPlate,
          vehicleModel: vehicleModel.trim() || undefined,
          vehicleType,
          facility,
          zone,
          pillar,
          slotId: selectedSlotId,
          phoneNumber: user?.phoneNumber || undefined,
          email: userEmail,
          spaceImageUrl: spaceImageUrl || undefined,
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Verification pipeline failed.");
      }

      const vData = data.data;
      setVerificationResult(vData);

      // 2. If verified and acceptable confidence, persist active session in Convex atomically
      if (vData.verificationStatus === "VERIFIED" || !vData.reviewRequired) {
        await createCheckInMutation({
          vehicleNumber: cleanPlate,
          vehicleModel: vehicleModel.trim() || undefined,
          vehicleType,
          facility,
          zone,
          pillar,
          slotId: selectedSlotId,
          phoneNumber: user?.phoneNumber || undefined,
          email: userEmail,
          spaceImageUrl: spaceImageUrl || undefined,
          destination,
          aiConfidence: vData.confidence,
          verificationStatus: vData.verificationStatus,
          pipelineExecutionId: vData.executionId,
          reviewRequired: vData.reviewRequired,
        });

        setTimeout(() => {
          router.push("/customer/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete parking check-in.");
    } finally {
      setIsVerifying(false);
    }
  };

  const availableSlotsInZone = slotsData?.slots.filter(
    (s) => s.zone === zone && s.status === "available"
  ) || [];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1B] p-4 sm:p-6 lg:p-8 selection:bg-[#F9E3DE] selection:text-[#C93B2F]">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#241F1B]">
                  Customer Parking Check-In
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#C93B2F] text-white tracking-wider">
                  AI POWERED
                </span>
              </div>
              <p className="text-[12px] text-[#70675F]">
                Real-time validation orchestrated by RocketRide pipelines
              </p>
            </div>
          </div>
          <Link
            href="/customer/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DED3C7] text-[13px] font-bold text-[#70675F] hover:text-[#241F1B] hover:bg-[#F3EAE0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[13.5px] font-bold flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-black">Check-In Blocked</div>
              <div className="font-normal mt-0.5">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Verification Success / Review Alert */}
        {verificationResult && (
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-xs ${
              verificationResult.verificationStatus === "VERIFIED"
                ? "bg-[#EBF7F0] border-[#2F7D5A]/40 text-[#2F7D5A]"
                : "bg-[#FEF5E7] border-[#D97706]/40 text-[#92400E]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-[15px]">
                {verificationResult.verificationStatus === "VERIFIED" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2F7D5A]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#D97706]" />
                )}
                <span>
                  {verificationResult.verificationStatus === "VERIFIED"
                    ? "RocketRide Parking Verification Passed"
                    : "Sent to Operator AI Review Queue"}
                </span>
              </div>
              <span className="text-[11.5px] font-mono font-black px-2.5 py-0.5 rounded-full bg-white/80 border">
                {(verificationResult.confidence * 100).toFixed(0)}% Confidence
              </span>
            </div>
            <p className="text-[13px] leading-relaxed">
              {verificationResult.explanation}
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono opacity-80 pt-2 border-t border-current/20">
              <span>Pipeline: parking-verification.pipe</span>
              <span>Exec ID: {verificationResult.executionId}</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_8px_24px_rgba(70,48,35,0.06)]"
        >
          {/* Section 1: Vehicle Details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
              <span className="text-[12px] font-black uppercase text-[#70675F] tracking-wider">
                1. Vehicle Information
              </span>
              <span className="text-[11px] text-[#70675F]">Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                  License Plate Number <span className="text-[#C93B2F]">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH02AB1234"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[14px] font-black uppercase focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Nexon EV, Creta, City"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] font-medium focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                  Vehicle Class
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] font-medium focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV / Crossover</option>
                  <option value="hatchback">Hatchback / Compact</option>
                  <option value="ev">Electric Vehicle (EV)</option>
                  <option value="motorcycle">Two-Wheeler</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                  Destination Inside Facility
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] font-medium focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
                >
                  <option value="Food Court">Food Court (Floor 3)</option>
                  <option value="Cinema">Cinema & IMAX (Floor 4)</option>
                  <option value="Main Entrance">Main Entrance / Lobby</option>
                  <option value="Retail Corridor">Retail Corridor</option>
                  <option value="Hypermarket">Hypermarket & Grocery</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Spatial Parking Space Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
              <span className="text-[12px] font-black uppercase text-[#70675F] tracking-wider">
                2. Parking Facility & Space
              </span>
              <span className="text-[11px] text-[#70675F]">Live Availability</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                  Facility
                </label>
                <input
                  type="text"
                  value={facility}
                  readOnly
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] text-[13.5px] font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                  Parking Zone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleZoneChange("Zone A")}
                    className={`h-11 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                      zone === "Zone A"
                        ? "bg-[#C93B2F] text-white border-[#C93B2F]"
                        : "bg-[#FFFFFF] text-[#241F1B] border-[#DED3C7] hover:bg-[#F3EAE0]"
                    }`}
                  >
                    Zone A (Floor B2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoneChange("Zone B")}
                    className={`h-11 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                      zone === "Zone B"
                        ? "bg-[#C93B2F] text-white border-[#C93B2F]"
                        : "bg-[#FFFFFF] text-[#241F1B] border-[#DED3C7] hover:bg-[#F3EAE0]"
                    }`}
                  >
                    Zone B (Floor B2)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] mb-1.5">
                Select Available Parking Space <span className="text-[#C93B2F]">*</span>
              </label>
              {availableSlotsInZone.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#F9E3DE] border border-[#C93B2F]/20 text-[#C93B2F] text-[13px] font-bold text-center">
                  No spaces currently available in {zone}. Please switch zone.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableSlotsInZone.map((slot) => {
                    const isSelected = selectedSlotId === slot.slotId;
                    return (
                      <button
                        key={slot.slotId}
                        type="button"
                        onClick={() => handleSlotChange(slot.slotId)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#F9E3DE] border-[#C93B2F] text-[#241F1B] ring-2 ring-[#C93B2F]/20"
                            : "bg-[#FFFFFF] border-[#DED3C7] text-[#241F1B] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-[15px]">
                            {slot.slotNumber || slot.slotId}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-[#2F7D5A]" />
                        </div>
                        <span className="text-[11px] text-[#70675F] mt-1 font-medium">
                          {slot.pillar}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Optional Optical Evidence */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
              <span className="text-[12px] font-black uppercase text-[#70675F] tracking-wider">
                3. Optional Optical Evidence
              </span>
              <span className="text-[11px] text-[#70675F]">Enhances Confidence</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSimulatePhoto}
                disabled={isSimulatingCamera}
                className="w-full sm:w-auto h-11 px-4 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#EDE1D4] text-[#241F1B] text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSimulatingCamera ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C93B2F]" />
                ) : (
                  <Camera className="w-4 h-4 text-[#C93B2F]" />
                )}
                <span>{spaceImageUrl ? "Replace Bay Photo" : "Upload Bay Photo"}</span>
              </button>

              {spaceImageUrl && (
                <div className="flex items-center gap-2 text-[12.5px] text-[#2F7D5A] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bay Photo Attached (Central Mall Slot Marker)</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying || !vehicleNumber.trim() || !selectedSlotId}
            className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14.5px] transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying parking session with ParkNex AI…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Verify & Start Parking Session</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
