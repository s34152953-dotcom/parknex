"use client";

import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import { Maximize2, Compass, RotateCcw } from "lucide-react";

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

// ── Shared Global Geometries and Materials (Prevents UI Freezing) ──────────
const GEO = {
  carShadow: new THREE.PlaneGeometry(1.9, 3.6),
  carChassis: new THREE.BoxGeometry(1.65, 0.36, 3.3),
  carCabin: new THREE.BoxGeometry(1.38, 0.32, 1.9),
  carWindshield: new THREE.PlaneGeometry(1.34, 0.25),
  carHeadlight: new THREE.BoxGeometry(0.32, 0.1, 0.02),
  carTaillight: new THREE.BoxGeometry(1.48, 0.08, 0.02),
  carWheel: new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16),
  carRim: new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12),
  pillarMain: new THREE.BoxGeometry(0.65, 3.6, 0.65),
  pillarFrame: new THREE.BoxGeometry(0.67, 3.62, 0.67),
  pillarBase: new THREE.BoxGeometry(0.68, 0.3, 0.68),
  slotOutline: new THREE.PlaneGeometry(2.1, 4.0),
  slotTint: new THREE.PlaneGeometry(2.04, 3.94),
  slotBounding: new THREE.BoxGeometry(2.18, 0.75, 4.15),
  floorMain: new THREE.PlaneGeometry(44, 38),
  floorLane: new THREE.PlaneGeometry(7.2, 36),
  floorDashed: new THREE.PlaneGeometry(0.18, 32),
  pinRing: new THREE.RingGeometry(1.1, 1.25, 32),
  pinSphere: new THREE.SphereGeometry(0.3, 20, 20),
  pinCone: new THREE.ConeGeometry(0.16, 0.42, 16),
};

const MAT = {
  carShadow: new THREE.MeshBasicMaterial({ color: "#3D3024", transparent: true, opacity: 0.35 }),
  carCabin: new THREE.MeshStandardMaterial({ color: "#1C2128", roughness: 0.1, metalness: 0.9 }),
  carWindshield: new THREE.MeshStandardMaterial({ color: "#2D3748", roughness: 0.1, metalness: 0.8 }),
  carHeadlight: new THREE.MeshStandardMaterial({ color: "#FFFFFF", emissive: "#FFFFFF", emissiveIntensity: 1.2 }),
  carWheel: new THREE.MeshStandardMaterial({ color: "#2B303A", roughness: 0.9 }),
  carRim: new THREE.MeshStandardMaterial({ color: "#E2E8F0", metalness: 0.9, roughness: 0.2 }),
  pillarMain: new THREE.MeshStandardMaterial({ color: "#FAF5EE", roughness: 0.6, metalness: 0.1 }),
  pillarFrame: new THREE.MeshBasicMaterial({ color: "#DDD3C5", wireframe: true, transparent: true, opacity: 0.35 }),
  pillarBase: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 0.4 }),
  floorMain: new THREE.MeshStandardMaterial({ color: "#ECE5DA", roughness: 0.7, metalness: 0.15 }),
  floorLane: new THREE.MeshStandardMaterial({ color: "#E4DDD2", roughness: 0.6, metalness: 0.2 }),
  floorDashed: new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.65 }),
  pinRing: new THREE.MeshBasicMaterial({ color: "#D84A2B", transparent: true, opacity: 0.7 }),
  pinGlow: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 1.8 }),
  boundingHighlight: new THREE.MeshBasicMaterial({ color: "#D84A2B", wireframe: true, transparent: true, opacity: 0.9 }),
};

// ── Multi-Variant 3D Stylized Car ──────────────────────────────────────────
function StylizedCar({ color = "#2D3748", isUserCar = false }: { color?: string; isUserCar?: boolean }) {
  const chassisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isUserCar ? "#D84A2B" : color,
        roughness: 0.2,
        metalness: isUserCar ? 0.4 : 0.6,
        emissive: isUserCar ? "#D84A2B" : "#000000",
        emissiveIntensity: isUserCar ? 0.3 : 0,
      }),
    [color, isUserCar]
  );

  const taillightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D84A2B",
        emissive: "#D84A2B",
        emissiveIntensity: isUserCar ? 2.0 : 1.2,
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
  const slotKey = slot.slotId || slot.id || (slot as any)._id || slot.slotNumber || "slot";

  const isRecommended = Boolean(
    (recommendedSlotIds && (recommendedSlotIds.includes(slotKey) || (slot.slotId && recommendedSlotIds.includes(slot.slotId)))) ||
    isNearest
  );

  const statusColor = useMemo(() => {
    if (isRecommended && slot.status === "available") {
      return "#3569A8"; // Blue for Recommended
    }
    switch (slot.status) {
      case "available":
        return "#2F7D5A"; // Green
      case "occupied":
        return "#C93B2F"; // Red
      case "reserved":
      case "temporarily_held":
        return "#B7791F"; // Amber
      case "maintenance":
        return "#70675F"; // Grey
      default:
        return "#70675F";
    }
  }, [slot.status, isRecommended]);

  const carColor = useMemo(() => {
    const colors = ["#241F1B", "#3D3A35", "#57534E", "#70675F", "#8C827A", "#4A4036"];
    const hash = slotKey.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [slotKey]);

  const outlineMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isSelected ? "#D84A2B" : isNearest ? "#D84A2B" : hovered ? "#10B981" : statusColor,
        wireframe: true,
        transparent: true,
        opacity: isSelected ? 1.0 : isNearest ? 0.95 : hovered ? 0.9 : 0.6,
      }),
    [isSelected, isNearest, hovered, statusColor]
  );

  const tintMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isSelected ? "#D84A2B" : isNearest ? "#D84A2B" : statusColor,
        transparent: true,
        opacity: isSelected ? 0.32 : isNearest ? 0.22 : hovered ? 0.18 : 0.06,
      }),
    [isSelected, isNearest, hovered, statusColor]
  );

  return (
    <group
      position={[slot.positionX, slot.positionY, slot.positionZ]}
      rotation={[0, slot.rotationY || 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (isAvailable) onSelect(slot);
      }}
      onPointerOver={(e) => {
        if (isAvailable) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Ground Marking Outline & Floor Tint */}
      <group position={[0, 0.02, 0]}>
        <mesh geometry={GEO.slotOutline} material={outlineMat} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh geometry={GEO.slotTint} material={tintMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} />

        {/* Stencil Slot Number on Floor */}
        <group position={[0, 0.01, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.24}
            color={isSelected ? "#D84A2B" : isNearest ? "#D84A2B" : statusColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {slot.slotNumber}
          </Text>
        </group>
      </group>

      {/* Render 3D Car if Occupied */}
      {slot.status === "occupied" && <StylizedCar color={carColor} isUserCar={false} />}

      {/* Nearest Recommended Glowing Pin */}
      {isNearest && isAvailable && (
        <group position={[0, 0, 0]}>
          <mesh geometry={GEO.pinRing} material={MAT.pinRing} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} />

          {!reducedMotion ? (
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <group position={[0, 2.0, 0]}>
                <mesh geometry={GEO.pinSphere} material={MAT.pinGlow} position={[0, 0.3, 0]} />
                <mesh geometry={GEO.pinCone} material={MAT.pinGlow} position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]} />
              </group>
            </Float>
          ) : (
            <group position={[0, 2.0, 0]}>
              <mesh geometry={GEO.pinSphere} material={MAT.pinGlow} position={[0, 0.3, 0]} />
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

// ── Concrete Pillar with Stencil Label & Orange Accent Base ──────────────────
function ConcretePillar({ position, label, sub = "ZONE A" }: { position: [number, number, number]; label: string; sub?: string }) {
  return (
    <group position={position}>
      <mesh geometry={GEO.pillarMain} material={MAT.pillarMain} castShadow receiveShadow position={[0, 1.8, 0]} />
      <mesh geometry={GEO.pillarFrame} material={MAT.pillarFrame} position={[0, 1.8, 0]} />
      <mesh geometry={GEO.pillarBase} material={MAT.pillarBase} position={[0, 0.35, 0]} />
      
      <Text position={[0, 2.4, 0.44]} fontSize={0.22} color="#1C1917" anchorX="center" anchorY="middle">
        {label}
      </Text>
      <Text position={[0, 2.1, 0.44]} fontSize={0.12} color="#78716C" anchorX="center" anchorY="middle">
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
          ▲ ▲ MAIN ENTRANCE · LEVEL {floor}
        </Text>
      </group>
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text fontSize={0.6} color="#A8A29E" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          MAX 10 KM/H · PARKNEX NAVIGATION
        </Text>
      </group>
    </group>
  );
}

// ── Camera Controller & Readiness Notifier ───────────────────────────────────
function CameraRig({ recenterTrigger, onReady }: { recenterTrigger: number, onReady: () => void }) {
  const controlsRef = useRef<any>(null);
  const { invalidate } = useThree();

  useEffect(() => {
    if (controlsRef.current && recenterTrigger > 0) {
      controlsRef.current.reset();
      invalidate();
    }
  }, [recenterTrigger, invalidate]);

  useEffect(() => {
    // Notify parent that the scene is fully mounted and ready
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
      maxDistance={45}
      target={[0, 0, -4]}
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
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Strict 3.5s timeout. If `sceneReady` isn't true by then, kill WebGL and fallback.
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!sceneReady) {
        console.warn("[InteractiveParkingMap3D] WebGL initialization timeout. Triggering 2D fallback.");
        onFallbackTo2D?.();
      }
    }, 3500);

    return () => clearTimeout(fallbackTimer);
  }, [sceneReady, onFallbackTo2D]);

  return (
    <div className="relative w-full h-full min-h-[540px] bg-[#F8F4ED] rounded-3xl overflow-hidden select-none border border-[#EAE3D9]">
      {/* Top Floating Controls Bar */}
      <div className={`absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E2D9CC] shadow-xs pointer-events-auto text-[12px] font-semibold text-[#1C1917]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Interactive View ({currentFloor})</span>
        </div>

        <button
          type="button"
          onClick={() => setRecenterCount((c) => c + 1)}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E2D9CC] text-[#1C1917] text-[12px] font-bold shadow-xs hover:border-[#D84A2B]/40 transition-colors pointer-events-auto cursor-pointer"
          title="Recenter Camera"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D84A2B]" />
          <span>Recenter Camera</span>
        </button>
      </div>

      {/* Loading Skeleton displayed strictly before sceneReady */}
      {!sceneReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FAF7F2] animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-3">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <p className="text-[14px] font-bold text-[#1C1917]">Loading Interactive View...</p>
          <p className="text-[12px] text-[#78716C] mt-0.5">Please wait while space geometry compiles</p>
        </div>
      )}

      {/* Canvas configuration: frameloop is set to 'demand' until the scene is fully mounted and ready. */}
      <Canvas
        camera={{ position: [14, 18, 16], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        shadows
        frameloop={sceneReady ? (reducedMotion ? "demand" : "always") : "demand"}
      >
        <color attach="background" args={["#F8F4ED"]} />

        <ambientLight intensity={0.95} color="#FFF8EF" />
        <directionalLight position={[18, 30, 18]} intensity={1.2} color="#FFF7ED" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-18, 25, -18]} intensity={0.4} color="#FDE8D0" />
        <pointLight position={[0, 12, 0]} intensity={1.0} color="#FFEDD5" distance={40} />

        <Suspense fallback={null}>
          <ParkingFloorGrid floor={currentFloor} />

          {/* Render All Parking Slots in 3D */}
          {slots.map((slot) => {
            const slotKey = slot.slotId || slot.id || (slot as any)._id || slot.slotNumber;
            const isSelected = Boolean(
              selectedSlot &&
              (selectedSlot.slotId || selectedSlot.id || (selectedSlot as any)._id) === slotKey
            );
            const isNearest = Boolean(
              nearestSlot &&
              (nearestSlot.slotId || nearestSlot.id || (nearestSlot as any)._id) === slotKey
            );

            return (
              <ParkingSlot3D
                key={slotKey}
                slot={slot}
                isSelected={isSelected}
                isNearest={isNearest}
                recommendedSlotIds={recommendedSlotIds}
                onSelect={onSelectSlot}
                reducedMotion={reducedMotion}
              />
            );
          })}

          {/* Concrete Pillars */}
          <ConcretePillar position={[-7.5, 0, -10.0]} label="P01" sub="Zone A" />
          <ConcretePillar position={[-4.5, 0, -10.0]} label="P03" sub="Zone A" />
          <ConcretePillar position={[-1.5, 0, -10.0]} label="P05" sub="Zone A" />
          <ConcretePillar position={[1.5, 0, -10.0]} label="P07" sub="Zone A" />
          <ConcretePillar position={[4.5, 0, -10.0]} label="P09" sub="Zone A" />
          <ConcretePillar position={[7.5, 0, -10.0]} label="P11" sub="Zone A" />

          <ConcretePillar position={[-7.5, 0, -2.0]} label="P13" sub="Zone B" />
          <ConcretePillar position={[-4.5, 0, -2.0]} label="P15" sub="Zone B" />
          <ConcretePillar position={[-1.5, 0, -2.0]} label="P17" sub="Zone B" />
          <ConcretePillar position={[1.5, 0, -2.0]} label="P19" sub="Zone B" />
          <ConcretePillar position={[4.5, 0, -2.0]} label="P21" sub="Zone B" />
          <ConcretePillar position={[7.5, 0, -2.0]} label="P23" sub="Zone B" />

          <CameraRig recenterTrigger={recenterCount} onReady={() => setSceneReady(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}
