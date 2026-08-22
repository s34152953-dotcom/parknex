"use client";

import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import { Compass, RotateCcw } from "lucide-react";

/**
 * Robust WebGL feature detector
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// ── Shared Global Geometries and Dark-Themed Materials ──────────────────────
const GEO = {
  carShadow: new THREE.PlaneGeometry(2.0, 3.8),
  carChassis: new THREE.BoxGeometry(1.65, 0.36, 3.3),
  carCabin: new THREE.BoxGeometry(1.38, 0.32, 1.9),
  carWindshield: new THREE.PlaneGeometry(1.34, 0.25),
  carHeadlight: new THREE.BoxGeometry(0.32, 0.1, 0.02),
  carTaillight: new THREE.BoxGeometry(1.48, 0.08, 0.02),
  carWheel: new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16),
  carRim: new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12),
  pillarMain: new THREE.BoxGeometry(0.7, 3.6, 0.7),
  pillarFrame: new THREE.BoxGeometry(0.72, 3.62, 0.72),
  pillarBase: new THREE.BoxGeometry(0.74, 0.4, 0.74),
  slotOutline: new THREE.PlaneGeometry(2.1, 4.0),
  slotTint: new THREE.PlaneGeometry(2.04, 3.94),
  slotBounding: new THREE.BoxGeometry(2.2, 0.8, 4.2),
  floorMain: new THREE.PlaneGeometry(46, 40),
  floorLane: new THREE.PlaneGeometry(7.6, 38),
  floorDashed: new THREE.PlaneGeometry(0.2, 34),
  pinRing: new THREE.RingGeometry(1.1, 1.25, 32),
  pinSphere: new THREE.SphereGeometry(0.32, 20, 20),
  pinCone: new THREE.ConeGeometry(0.18, 0.44, 16),
};

const MAT = {
  carShadow: new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.7 }),
  carCabin: new THREE.MeshStandardMaterial({ color: "#0B0F17", roughness: 0.1, metalness: 0.95 }),
  carWindshield: new THREE.MeshStandardMaterial({ color: "#1E293B", roughness: 0.1, metalness: 0.85 }),
  carHeadlight: new THREE.MeshStandardMaterial({ color: "#60A5FA", emissive: "#60A5FA", emissiveIntensity: 2.0 }),
  carWheel: new THREE.MeshStandardMaterial({ color: "#0F172A", roughness: 0.9 }),
  carRim: new THREE.MeshStandardMaterial({ color: "#94A3B8", metalness: 0.9, roughness: 0.2 }),
  pillarMain: new THREE.MeshStandardMaterial({ color: "#1E2634", roughness: 0.5, metalness: 0.3 }),
  pillarFrame: new THREE.MeshBasicMaterial({ color: "#334155", wireframe: true, transparent: true, opacity: 0.4 }),
  pillarBase: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 0.6 }),
  floorMain: new THREE.MeshStandardMaterial({ color: "#121824", roughness: 0.8, metalness: 0.2 }),
  floorLane: new THREE.MeshStandardMaterial({ color: "#0D121B", roughness: 0.65, metalness: 0.25 }),
  floorDashed: new THREE.MeshBasicMaterial({ color: "#F59E0B", transparent: true, opacity: 0.85 }),
  pinRing: new THREE.MeshBasicMaterial({ color: "#D84A2B", transparent: true, opacity: 0.85 }),
  pinGlow: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 2.5 }),
  boundingHighlight: new THREE.MeshBasicMaterial({ color: "#FFFFFF", wireframe: true, transparent: true, opacity: 0.95 }),
};

// ── Multi-Variant 3D Stylized Car ──────────────────────────────────────────
function StylizedCar({ color = "#3B82F6", isUserCar = false }: { color?: string; isUserCar?: boolean }) {
  const chassisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isUserCar ? "#D84A2B" : color,
        roughness: 0.2,
        metalness: isUserCar ? 0.5 : 0.7,
        emissive: isUserCar ? "#D84A2B" : "#000000",
        emissiveIntensity: isUserCar ? 0.4 : 0,
      }),
    [color, isUserCar]
  );

  const taillightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#EF4444",
        emissive: "#EF4444",
        emissiveIntensity: isUserCar ? 2.5 : 1.5,
      }),
    [isUserCar]
  );

  return (
    <group position={[0, 0.22, 0]}>
      {/* Ground Contact Shadow */}
      <mesh geometry={GEO.carShadow} material={MAT.carShadow} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Main Lower Chassis Body */}
      <mesh geometry={GEO.carChassis} material={chassisMat} castShadow receiveShadow position={[0, 0.14, 0]} />

      {/* Cabin / Greenhouse Upper Body */}
      <mesh geometry={GEO.carCabin} material={MAT.carCabin} castShadow receiveShadow position={[0, 0.42, -0.1]} />

      {/* Front Windshield Angle Highlight */}
      <mesh geometry={GEO.carWindshield} material={MAT.carWindshield} position={[0, 0.38, 1.0]} rotation={[Math.PI / 5, 0, 0]} />

      {/* Front Xenon Headlights */}
      {[-0.58, 0.58].map((hx, idx) => (
        <group key={idx} position={[hx, 0.16, 1.66]}>
          <mesh geometry={GEO.carHeadlight} material={MAT.carHeadlight} />
        </group>
      ))}

      {/* Red/Orange LED Taillight Strip */}
      <mesh geometry={GEO.carTaillight} material={taillightMat} position={[0, 0.18, -1.66]} />

      {/* 4 Alloy Wheels */}
      {[-0.84, 0.84].map((x, i) =>
        [-1.0, 1.0].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, -0.04, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh geometry={GEO.carWheel} material={MAT.carWheel} />
            <mesh geometry={GEO.carRim} material={MAT.carRim} position={[0, i === 0 ? -0.09 : 0.09, 0]} />
          </group>
        ))
      )}
    </group>
  );
}

// ── Individual 3D Parking Space Mesh ───────────────────────────────────────
function ParkingSlot3D({
  slot,
  isSelected,
  isNearest,
  recommendedSlotIds,
  onSelect,
  reducedMotion,
}: {
  slot: ParkingSlot;
  isSelected: boolean;
  isNearest: boolean;
  recommendedSlotIds?: string[];
  onSelect: (slot: ParkingSlot) => void;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isAvailable = slot.status === "available";

  const isRecommended = Boolean(
    (recommendedSlotIds && (recommendedSlotIds.includes(slot.id) || (slot.slotId && recommendedSlotIds.includes(slot.slotId)))) ||
    isNearest
  );

  const statusColor = useMemo(() => {
    if (isRecommended && slot.status === "available") {
      return "#2563EB"; // Vibrant Blue for Recommended
    }
    switch (slot.status) {
      case "available":
        return "#10B981"; // Emerald Green
      case "occupied":
        return "#EF4444"; // Red
      case "reserved":
      case "temporarily_held":
        return "#F59E0B"; // Amber
      case "maintenance":
        return "#6B7280"; // Grey
      default:
        return "#6B7280";
    }
  }, [slot.status, isRecommended]);

  const carColor = useMemo(() => {
    const colors = ["#2563EB", "#DC2626", "#4B5563", "#0F172A", "#D97706", "#059669", "#7C3AED"];
    const hash = slot.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [slot.id]);

  const outlineMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isSelected ? "#FFFFFF" : isNearest ? "#D84A2B" : hovered ? "#10B981" : statusColor,
        wireframe: true,
        transparent: true,
        opacity: isSelected ? 1.0 : isNearest ? 0.95 : hovered ? 0.9 : 0.7,
      }),
    [isSelected, isNearest, hovered, statusColor]
  );

  const tintMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isSelected ? "#FFFFFF" : isNearest ? "#D84A2B" : statusColor,
        transparent: true,
        opacity: isSelected ? 0.35 : isNearest ? 0.25 : hovered ? 0.22 : 0.08,
      }),
    [isSelected, isNearest, hovered, statusColor]
  );

  return (
    <group
      position={[slot.positionX ?? 0, slot.positionY ?? 0, slot.positionZ ?? 0]}
      rotation={[0, slot.rotationY ?? 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(slot);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Floor Slot Outline Rectangle */}
      <mesh
        geometry={GEO.slotOutline}
        material={outlineMat}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Floor Tint Surface */}
      <mesh
        geometry={GEO.slotTint}
        material={tintMat}
        position={[0, 0.012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Bay Label Monospace Text */}
      <Text
        position={[0, 0.02, 1.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.44}
        color={isSelected ? "#FFFFFF" : isRecommended ? "#60A5FA" : isAvailable ? "#10B981" : "#94A3B8"}
        anchorX="center"
        anchorY="middle"
      >
        {slot.slotNumber || slot.id.split("-").pop()?.toUpperCase()}
      </Text>

      {/* 3D Car Model if Occupied */}
      {slot.status === "occupied" && (
        <StylizedCar color={carColor} isUserCar={false} />
      )}

      {/* Recommended / Nearest Pin Marker */}
      {(isRecommended || isNearest) && isAvailable && (
        <group position={[0, 1.4, 0]}>
          {!reducedMotion ? (
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group position={[0, 1.2, 0]}>
                <mesh geometry={GEO.pinSphere} material={MAT.pinGlow} position={[0, 0.45, 0]} />
                <mesh geometry={GEO.pinCone} material={MAT.pinGlow} position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]} />
              </group>
            </Float>
          ) : (
            <group position={[0, 1.2, 0]}>
              <mesh geometry={GEO.pinSphere} material={MAT.pinGlow} position={[0, 0.45, 0]} />
            </group>
          )}
        </group>
      )}

      {/* Selected Slot Bounding Highlight Box */}
      {isSelected && (
        <mesh geometry={GEO.slotBounding} material={MAT.boundingHighlight} position={[0, 0.35, 0]} />
      )}
    </group>
  );
}

// ── Concrete Pillar with Stencil Label & Orange Safety Base ──────────────────
function ConcretePillar({ position, label, sub = "ZONE A" }: { position: [number, number, number]; label: string; sub?: string }) {
  return (
    <group position={position}>
      <mesh geometry={GEO.pillarMain} material={MAT.pillarMain} castShadow receiveShadow position={[0, 1.8, 0]} />
      <mesh geometry={GEO.pillarFrame} material={MAT.pillarFrame} position={[0, 1.8, 0]} />
      <mesh geometry={GEO.pillarBase} material={MAT.pillarBase} position={[0, 0.35, 0]} />

      <Text position={[0, 2.4, 0.48]} fontSize={0.26} color="#FFFFFF" anchorX="center" anchorY="middle">
        {label}
      </Text>
      <Text position={[0, 2.05, 0.48]} fontSize={0.14} color="#94A3B8" anchorX="center" anchorY="middle">
        {sub}
      </Text>
    </group>
  );
}

// ── Complete Garage Floor Surface, Lanes & Directional Markings ───────────────
function ParkingFloorGrid({ floor }: { floor: string }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={GEO.floorMain} material={MAT.floorMain} receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={GEO.floorLane} material={MAT.floorLane} receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={GEO.floorDashed} material={MAT.floorDashed} position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      <group position={[0, 0.01, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text fontSize={0.85} color="#10B981" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          ▲ ▲ ENTRY GATE A · LEVEL {floor}
        </Text>
      </group>
      <group position={[0, 0.01, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text fontSize={0.85} color="#EF4444" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          ▼ ▼ EXIT GATE B · LEVEL {floor}
        </Text>
      </group>
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text fontSize={0.55} color="#64748B" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          MAIN DRIVING AISLE · 6.0M CLEARANCE
        </Text>
      </group>
    </group>
  );
}

// ── Camera Controller & Readiness Notifier ───────────────────────────────────
function CameraRig({ recenterTrigger, onReady }: { recenterTrigger: number; onReady: () => void }) {
  const controlsRef = useRef<any>(null);
  const { invalidate } = useThree();

  useEffect(() => {
    if (controlsRef.current && recenterTrigger > 0) {
      controlsRef.current.reset();
      invalidate();
    }
  }, [recenterTrigger, invalidate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onReady();
      invalidate();
    }, 150);
    return () => clearTimeout(timer);
  }, [onReady, invalidate]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 - 0.08}
      minDistance={10}
      maxDistance={40}
      target={[0, 0, 0]}
      onChange={() => invalidate()}
    />
  );
}

// ── Main Exported Interactive 3D Parking Map ─────────────────────────────────
export default function InteractiveParkingMap3D({
  slots = [],
  selectedSlot,
  nearestSlot,
  recommendedSlotIds,
  onSelectSlot,
  currentFloor = "B2",
  onFallbackTo2D,
}: {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  nearestSlot: ParkingSlot | null;
  recommendedSlotIds?: string[];
  onSelectSlot: (slot: ParkingSlot) => void;
  currentFloor?: string;
  onFallbackTo2D?: () => void;
}) {
  const [recenterCount, setRecenterCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sceneReady, setSceneReady] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] sm:min-h-[550px] lg:min-h-[650px] bg-[#10151D] rounded-3xl overflow-hidden select-none border border-white/10 shadow-xl shadow-black/20">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none transition-opacity duration-300 opacity-100">
        <div className="flex items-center gap-2 bg-[#151B24]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto text-[12px] font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Interactive View ({currentFloor})</span>
        </div>

        <button
          type="button"
          onClick={() => setRecenterCount((c) => c + 1)}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#151B24]/90 backdrop-blur-md border border-white/10 text-white text-[12px] font-bold shadow-lg hover:border-[#D84A2B]/60 transition-colors pointer-events-auto cursor-pointer"
          title="Recenter Camera"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D84A2B]" />
          <span>Recenter Camera</span>
        </button>
      </div>

      {/* Canvas configuration */}
      <Canvas
        camera={{ position: [0, 22, 22], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        shadows
        frameloop="always"
        onCreated={() => setSceneReady(true)}
      >
        <color attach="background" args={["#0A0D14"]} />

        <ambientLight intensity={0.6} color="#94A3B8" />
        <directionalLight position={[15, 25, 15]} intensity={1.4} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-15, 20, -15]} intensity={0.6} color="#38BDF8" />
        <pointLight position={[0, 10, 0]} intensity={1.2} color="#F59E0B" distance={35} />

        <Suspense fallback={null}>
          <ParkingFloorGrid floor={currentFloor} />

          {/* Render All Parking Slots in 3D */}
          {slots.map((slot) => (
            <ParkingSlot3D
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              isNearest={nearestSlot?.id === slot.id}
              recommendedSlotIds={recommendedSlotIds}
              onSelect={onSelectSlot}
              reducedMotion={reducedMotion}
            />
          ))}

          {/* Concrete Pillars */}
          <ConcretePillar position={[-7.5, 0, -10.0]} label="P01" sub="Zone A" />
          <ConcretePillar position={[-4.5, 0, -10.0]} label="P03" sub="Zone A" />
          <ConcretePillar position={[-1.5, 0, -10.0]} label="P05" sub="Zone A" />
          <ConcretePillar position={[1.5, 0, -10.0]} label="P07" sub="Zone A" />
          <ConcretePillar position={[4.5, 0, -10.0]} label="P09" sub="Zone A" />
          <ConcretePillar position={[7.5, 0, -10.0]} label="P11" sub="Zone A" />

          <ConcretePillar position={[-7.5, 0, 2.0]} label="P13" sub="Zone B" />
          <ConcretePillar position={[-4.5, 0, 2.0]} label="P15" sub="Zone B" />
          <ConcretePillar position={[-1.5, 0, 2.0]} label="P17" sub="Zone B" />
          <ConcretePillar position={[1.5, 0, 2.0]} label="P19" sub="Zone B" />
          <ConcretePillar position={[4.5, 0, 2.0]} label="P21" sub="Zone B" />
          <ConcretePillar position={[7.5, 0, 2.0]} label="P23" sub="Zone B" />

          <CameraRig recenterTrigger={recenterCount} onReady={() => setSceneReady(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}
