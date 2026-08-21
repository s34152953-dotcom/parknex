"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Car } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { createClient } from "@/lib/supabase/client";

// ── 3D Slot Preview with Green Bounding Box & Car ────────────────────────────
function VehicleInSlotPreview({ carName = "Hyundai Creta" }: { carName: string }) {
  return (
    <Canvas
      camera={{ position: [5, 4.5, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.9} color="#FFF8EF" />
      <directionalLight position={[6, 10, 8]} intensity={1.3} color="#FFF7ED" />
      <pointLight position={[0, 4, 0]} intensity={1} color="#10B981" distance={10} />

      <Suspense fallback={null}>
        {/* Floor Asphalt Base */}
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#EDE5DA" roughness={0.8} />
        </mesh>

        {/* Glowing Green Slot Outline Boundary */}
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 4.4]} />
            <meshBasicMaterial color="#10B981" wireframe />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[2.36, 4.36]} />
            <meshBasicMaterial color="#10B981" transparent opacity={0.16} />
          </mesh>
        </group>

        {/* 3D Car Model */}
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.1}>
          <group position={[0, 0.28, 0]}>
            {/* Chassis */}
            <mesh position={[0, 0.16, 0]}>
              <boxGeometry args={[1.7, 0.38, 3.4]} />
              <meshStandardMaterial color="#D84A2B" roughness={0.2} metalness={0.4} />
            </mesh>
            {/* Cabin Glass */}
            <mesh position={[0, 0.44, -0.1]}>
              <boxGeometry args={[1.4, 0.34, 1.9]} />
              <meshStandardMaterial color="#1C2128" roughness={0.05} metalness={0.95} />
            </mesh>
            {/* Taillights */}
            <mesh position={[0, 0.2, -1.71]}>
              <boxGeometry args={[1.5, 0.08, 0.02]} />
              <meshStandardMaterial color="#D84A2B" emissive="#D84A2B" emissiveIntensity={1.8} />
            </mesh>
            {/* Headlights */}
            <mesh position={[0.6, 0.2, 1.71]}>
              <boxGeometry args={[0.35, 0.08, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
            </mesh>
            <mesh position={[-0.6, 0.2, 1.71]}>
              <boxGeometry args={[0.35, 0.08, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
            </mesh>
          </group>
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.2}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Suspense>
    </Canvas>
  );
}

function ConfirmParkingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const slotId = searchParams.get("slotId") || "slot-18";
  const slotNum = searchParams.get("slotNum") || "Slot A-18";
  const pillar = searchParams.get("pillar") || "Pillar 18";
  const floor = searchParams.get("floor") || "B2";
  const zone = searchParams.get("zone") || "A";

  const [vehicleName, setVehicleName] = useState<string>("Hyundai Creta");
  const [vehiclePlate, setVehiclePlate] = useState<string>("KA-01-MJ-2024");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleConfirmParking = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const { data, error } = await supabase.rpc("confirm_parking_session", {
          p_user_id: userData.user.id,
          p_slot_id: slotId,
        });

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/my-car");
      }, 1200);
    } catch (err: any) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/my-car");
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 sm:p-8 bg-[#FBF8F3]">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(216,74,43,0.04),transparent)] pointer-events-none" />

      {/* Main Confirmation Card */}
      <div className="relative z-10 w-full max-w-[680px] bg-white/95 backdrop-blur-2xl border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 sm:p-10 shadow-[0_16px_48px_rgba(80,50,20,0.04)]">
        {/* Back Link */}
        <Link
          href="/parking"
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors duration-180 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Parking Map
        </Link>

        {/* Selection Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[13px] font-bold text-[#10B981] flex items-center gap-1">
            You selected <Check className="w-3.5 h-3.5 inline text-[#10B981]" />
          </span>
        </div>

        {/* Large Pillar & Slot Heading */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EAE3D9]">
          <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#1C1917] tracking-tight">
            {pillar}
          </h1>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold text-[#D84A2B] tracking-tight">
            {slotNum}
          </h2>
        </div>

        {/* Metadata Details & 3D Car Slot Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-6">
          {/* Left Metadata list */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">
                Floor
              </p>
              <p className="text-[18px] font-extrabold text-[#1C1917] mt-0.5">{floor}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">
                Zone
              </p>
              <p className="text-[18px] font-extrabold text-[#1C1917] mt-0.5">{zone}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">
                Vehicle
              </p>
              <p className="text-[18px] font-extrabold text-[#1C1917] mt-0.5">{vehicleName}</p>
              <p className="text-[12.5px] text-[#78716C] font-mono font-medium">{vehiclePlate}</p>
            </div>
          </div>

          {/* Right 3D Vehicle in Green Slot Visualizer */}
          <div className="relative h-[220px] w-full rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] overflow-hidden shadow-inner">
            <VehicleInSlotPreview carName={vehicleName} />
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <p className="text-[13px] text-[#EF4444] font-semibold mb-4">{errorMsg}</p>
        )}

        {/* Primary CTA Confirm Button */}
        <button
          onClick={handleConfirmParking}
          disabled={isSubmitting || success}
          className={`w-full h-[52px] rounded-xl text-[15px] font-bold tracking-[-0.01em] flex items-center justify-center gap-2 transition-all duration-180 shadow-md cursor-pointer ${
            success
              ? "bg-[#10B981] text-white shadow-[#10B981]/20"
              : "bg-[#D84A2B] text-white hover:bg-[#C23E21] active:scale-[0.98] shadow-[#D84A2B]/20"
          }`}
        >
          {success ? (
            <>
              <Check className="w-5 h-5" />
              Parking Confirmed!
            </>
          ) : isSubmitting ? (
            "Saving Location..."
          ) : (
            "Confirm Parking"
          )}
        </button>

        {/* Bottom Subtitle Note */}
        <p className="text-center text-[12.5px] text-[#78716C] mt-4">
          Your location will be saved and you can navigate back anytime.
        </p>
      </div>
    </div>
  );
}

export default function ParkingConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center text-[#78716C]">
          Loading parking details...
        </div>
      }
    >
      <ConfirmParkingContent />
    </Suspense>
  );
}
