"use client";

import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import { Compass, RotateCcw, MapPin, Layers, CheckCircle2 } from "lucide-react";

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

// ── Shared Global Geometries and Materials (Optimized for Dark Theme) ────────
const GEO = {
  carShadow: new THREE.PlaneGeometry(2.0, 3.8),
  carChassis: new THREE.BoxGeometry(1.68, 0.38, 3.4),
  carCabin: new THREE.BoxGeometry(1.4, 0.34, 2.0),
  carWindshield: new THREE.PlaneGeometry(1.36, 0.28),
  carHeadlight: new THREE.BoxGeometry(0.34, 0.12, 0.04),
  carTaillight: new THREE.BoxGeometry(1.5, 0.1, 0.04),
  carWheel: new THREE.CylinderGeometry(0.26, 0.26, 0.2, 16),
  carRim: new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12),
  pillarMain: new THREE.BoxGeometry(0.68, 3.8, 0.68),
  pillarFrame: new THREE.BoxGeometry(0.7, 3.82, 0.7),
  pillarBase: new THREE.BoxGeometry(0.72, 0.4, 0.72),
  slotOutline: new THREE.PlaneGeometry(2.2, 4.2),
  slotTint: new THREE.PlaneGeometry(2.14, 4.14),
  slotBounding: new THREE.BoxGeometry(2.28, 0.8, 4.28),
  floorMain: new THREE.PlaneGeometry(32, 22),
  floorLane: new THREE.PlaneGeometry(30, 6.6),
  floorDashed: new THREE.PlaneGeometry(28, 0.14),
  gateBarrier: new THREE.BoxGeometry(0.2, 1.2, 4.8),
  gatePost: new THREE.BoxGeometry(0.5, 1.8, 0.5),
  pinSphere: new THREE.SphereGeometry(0.34, 20, 20),
  pinCone: new THREE.ConeGeometry(0.18, 0.48, 16),
};

const MAT = {
  carShadow: new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.55 }),
  carCabin: new THREE.MeshStandardMaterial({ color: "#0F172A", roughness: 0.2, metalness: 0.8 }),
  carWindshield: new THREE.MeshStandardMaterial({ color: "#1E293B", roughness: 0.1, metalness: 0.9 }),
  carHeadlight: new THREE.MeshStandardMaterial({ color: "#E0F2FE", emissive: "#E0F2FE", emissiveIntensity: 1.5 }),
  carWheel: new THREE.MeshStandardMaterial({ color: "#18181B", roughness: 0.9 }),
  carRim: new THREE.MeshStandardMaterial({ color: "#94A3B8", metalness: 0.9, roughness: 0.2 }),
  pillarMain: new THREE.MeshStandardMaterial({ color: "#1E293B", roughness: 0.5, metalness: 0.2 }),
  pillarFrame: new THREE.MeshBasicMaterial({ color: "#334155", wireframe: true, transparent: true, opacity: 0.4 }),
  pillarBase: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 0.5 }),
  floorMain: new THREE.MeshStandardMaterial({ color: "#101622", roughness: 0.65, metalness: 0.2 }),
  floorLane: new THREE.MeshStandardMaterial({ color: "#151D2C", roughness: 0.55, metalness: 0.25 }),
  floorDashed: new THREE.MeshBasicMaterial({ color: "#F8FAFC", transparent: true, opacity: 0.75 }),
  gatePostIn: new THREE.MeshStandardMaterial({ color: "#10B981", emissive: "#10B981", emissiveIntensity: 0.4 }),
  gatePostOut: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 0.4 }),
  gateBarIn: new THREE.MeshStandardMaterial({ color: "#10B981", emissive: "#10B981", emissiveIntensity: 0.6 }),
  gateBarOut: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 0.6 }),
  pinGlow: new THREE.MeshStandardMaterial({ color: "#D84A2B", emissive: "#D84A2B", emissiveIntensity: 2.2 }),
  boundingHighlight: new THREE.MeshBasicMaterial({ color: "#FFFFFF", wireframe: true, transparent: true, opacity: 0.95 }),
};

// ── Multi-Variant 3D Stylized Car ──────────────────────────────────────────
function StylizedCar({ color = "#334155", isUserCar = false }: { color?: string; isUserCar?: boolean }) {
  const chassisMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isUserCar ? "#D84A2B" : color,
        roughness: 0.25,
        metalness: isUserCar ? 0.5 : 0.6,
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
    <group position={[0, 0.24, 0]}>
      {/* Ground Contact Shadow */}
      <mesh geometry={GEO.carShadow} material={MAT.carShadow} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Main Lower Chassis Body */}
      <mesh geometry={GEO.carChassis} material={chassisMat} castShadow receiveShadow position={[0, 0.16, 0]} />

      {/* Cabin / Greenhouse Upper Body */}
      <mesh geometry={GEO.carCabin} material={MAT.carCabin} castShadow receiveShadow position={[0, 0.45, -0.1]} />

      {/* Front Windshield Angle Highlight */}
      <mesh geometry={GEO.carWindshield} material={MAT.carWindshield} position={[0, 0.4, 1.02]} rotation={[Math.PI / 5, 0, 0]} />

      {/* Front Xenon Headlights */}
      {[-0.6, 0.6].map((hx, idx) => (
        <group key={idx} position={[hx, 0.18, 1.7]}>
          <mesh geometry={GEO.carHeadlight} material={MAT.carHeadlight} />
        </group>
      ))}

      {/* Red LED Taillight Strip */}
      <mesh geometry={GEO.carTaillight} material={taillightMat} position={[0, 0.2, -1.7]} />

      {/* 4 Alloy Wheels */}
      {[-0.86, 0.86].map((x, i) =>
        [-1.05, 1.05].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, -0.02, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh geometry={GEO.carWheel} material={MAT.carWheel} />
            <mesh geometry={GEO.carRim} material={MAT.carRim} position={[0, i === 0 ? -0.1 : 0.1, 0]} />
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
      return "#2563EB"; // Blue for Recommended
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
        return "#6B7280"; // Grey Maintenance
      default:
        return "#64748B";
    }
  }, [slot.status, isRecommended]);

  const carColor = useMemo(() => {
    const colors = ["#1E293B", "#334155", "#475569", "#0F172A", "#3B82F6", "#475569", "#64748B"];
    const hash = slot.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [slot.id]);

  const outlineMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isSelected ? "#FFFFFF" : isNearest ? "#2563EB" : hovered ? "#34D399" : statusColor,
        wireframe: true,
        transparent: true,
        opacity: isSelected ? 1.0 : isNearest ? 0.95 : hovered ? 0.9 : 0.65,
      }),
    [isSelected, isNearest, hovered, statusColor]
  );

  const tintMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isSelected ? "#FFFFFF" : isNearest ? "#2563EB" : statusColor,
        transparent: true,
        opacity: isSelected ? 0.35 : isNearest ? 0.28 : hovered ? 0.22 : 0.12,
      }),
    [isSelected, isNearest, hovered, statusColor]
  );

  return (
    <group
      position={[slot.positionX, slot.positionY || 0, slot.positionZ]}
      rotation={[0, slot.rotationY || 0, 0]}
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
      {/* Ground Marking Outline & Floor Tint */}
      <group position={[0, 0.02, 0]}>
        <mesh geometry={GEO.slotOutline} material={outlineMat} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh geometry={GEO.slotTint} material={tintMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} />

        {/* Stencil Slot Number on Floor */}
        <group position={[0, 0.01, 1.65]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.28}
            color={isSelected ? "#FFFFFF" : isNearest ? "#60A5FA" : statusColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
            fontWeight="bold"
          >
            {slot.slotNumber}
          </Text>
        </group>
      </group>

      {/* Render 3D Car if Occupied */}
      {slot.status === "occupied" && <StylizedCar color={carColor} isUserCar={false} />}

      {/* Floating 3D Pin Beacon for Selected Slot */}
      {isSelected && (
        <group position={[0, 0.8, 0]}>
          {!reducedMotion ? (
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group position={[0, 2.2, 0]}>
                <mesh geometry={GEO.pinSphere} material={MAT.pinGlow} position={[0, 0.35, 0]} />
                <mesh geometry={GEO.pinCone} material={MAT.pinGlow} position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]} />
              </group>
            </Float>
          ) : (
            <group position={[0, 2.2, 0]}>
              <mesh geometry={GEO.pinSphere} material={MAT.pinGlow} position={[0, 0.35, 0]} />
            </group>
          )}
        </group>
      )}

      {/* Selected Slot Bounding Highlight Box */}
      {isSelected && (
        <mesh geometry={GEO.slotBounding} material={MAT.boundingHighlight} position={[0, 0.4, 0]} />
      )}
    </group>
  );
}

// ── Concrete Pillar with Stencil Label ──────────────────────────────────────
function ConcretePillar({ position, label, sub = "ZONE A" }: { position: [number, number, number]; label: string; sub?: string }) {
  return (
    <group position={position}>
      <mesh geometry={GEO.pillarMain} material={MAT.pillarMain} castShadow receiveShadow position={[0, 1.9, 0]} />
      <mesh geometry={GEO.pillarFrame} material={MAT.pillarFrame} position={[0, 1.9, 0]} />
      <mesh geometry={GEO.pillarBase} material={MAT.pillarBase} position={[0, 0.2, 0]} />
      
      <Text position={[0, 2.6, 0.46]} fontSize={0.24} color="#F8FAFC" anchorX="center" anchorY="middle" fontWeight="bold">
        {label}
      </Text>
      <Text position={[0, 2.25, 0.46]} fontSize={0.13} color="#94A3B8" anchorX="center" anchorY="middle">
        {sub}
      </Text>
    </group>
  );
}

// ── Complete Garage Floor Surface, Lanes & Directional Markings ───────────────
function ParkingFloorGrid({ floor }: { floor: string }) {
  return (
    <group position={[0, 0, -4]}>
      {/* Main Garage Slab */}
      <mesh geometry={GEO.floorMain} material={MAT.floorMain} receiveShadow position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Central Driving Aisle */}
      <mesh geometry={GEO.floorLane} material={MAT.floorLane} receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Center Dashed White Road Line */}
      <mesh geometry={GEO.floorDashed} material={MAT.floorDashed} position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />

      {/* Road Arrows (Driving Direction: Gate A to Gate B) */}
      {[-8, -2, 4].map((xPos) => (
        <group key={xPos} position={[xPos, 0.01, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <Text fontSize={0.65} color="#F8FAFC" anchorX="center" anchorY="middle" fillOpacity={0.8}>
            ▶ ▶
          </Text>
        </group>
      ))}

      {/* Entrance Gate A (Left) */}
      <group position={[-14.5, 0, 0]}>
        <mesh geometry={GEO.gatePost} material={MAT.gatePostIn} position={[0, 0.9, -2.4]} />
        <mesh geometry={GEO.gatePost} material={MAT.gatePostIn} position={[0, 0.9, 2.4]} />
        <mesh geometry={GEO.gateBarrier} material={MAT.gateBarIn} position={[0, 0.9, 0]} />
        <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <Text fontSize={0.48} color="#10B981" anchorX="center" anchorY="middle" fontWeight="bold">
            ENTRY GATE A · INBOUND
          </Text>
        </group>
      </group>

      {/* Exit Gate B (Right) */}
      <group position={[14.5, 0, 0]}>
        <mesh geometry={GEO.gatePost} material={MAT.gatePostOut} position={[0, 0.9, -2.4]} />
        <mesh geometry={GEO.gatePost} material={MAT.gatePostOut} position={[0, 0.9, 2.4]} />
        <mesh geometry={GEO.gateBarrier} material={MAT.gateBarOut} position={[0, 0.9, 0]} />
        <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <Text fontSize={0.48} color="#D84A2B" anchorX="center" anchorY="middle" fontWeight="bold">
            EXIT GATE B · OUTBOUND
          </Text>
        </group>
      </group>

      {/* Main Elevator Lobby Demarcation at North Center */}
      <group position={[0, 0.01, -7.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text fontSize={0.65} color="#60A5FA" anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.08}>
          MAIN ELEVATOR LOBBY · LEVEL {floor}
        </Text>
      </group>

      {/* Navigation Guidelines at South Center */}
      <group position={[0, 0.01, 7.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text fontSize={0.5} color="#94A3B8" anchorX="center" anchorY="middle" letterSpacing={0.08}>
          SPEED LIMIT 10 KM/H · 6.0M AISLE CLEARANCE
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
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={8}
      maxDistance={35}
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
  const [sceneReady, setSceneReady] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[560px] lg:min-h-[640px] bg-[#0A0D14] rounded-3xl overflow-hidden select-none border border-white/10 shadow-2xl shadow-black/40">
      {/* Top Floating Controls Bar */}
      <div
        className={`absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
          sceneReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 bg-[#10151D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto text-[12px] font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Interactive View ({currentFloor})</span>
        </div>

        <button
          type="button"
          onClick={() => setRecenterCount((c) => c + 1)}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#10151D]/90 backdrop-blur-md border border-white/10 text-white text-[12px] font-bold shadow-lg hover:border-[#D84A2B]/60 hover:bg-[#151B24] transition-all pointer-events-auto cursor-pointer"
          title="Recenter Camera"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D84A2B]" />
          <span>Recenter Camera</span>
        </button>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div
        className={`absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-[#10151D]/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-auto text-[11.5px] font-semibold text-white transition-opacity duration-300 ${
          sceneReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span>Reserved</span>
        </div>
      </div>

      {/* Loading Skeleton displayed strictly before sceneReady */}
      {!sceneReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A0D14] animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-[#D84A2B]/20 border border-[#D84A2B]/40 flex items-center justify-center text-[#D84A2B] mb-3">
            <Compass className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-[14px] font-bold text-white">Compiling 3D Parking Model...</p>
          <p className="text-[12px] text-white/50 mt-0.5">Assembling garage floor and space markers</p>
        </div>
      )}

      {/* Canvas configuration */}
      <Canvas
        camera={{ position: [0, 16, 14], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        shadows
        frameloop="always"
      >
        <color attach="background" args={["#0A0D14"]} />

        <ambientLight intensity={0.7} color="#94A3B8" />
        <directionalLight position={[15, 24, 15]} intensity={1.4} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-15, 20, -15]} intensity={0.5} color="#38BDF8" />
        <pointLight position={[0, 10, -4]} intensity={1.2} color="#FFFFFF" distance={35} />

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
