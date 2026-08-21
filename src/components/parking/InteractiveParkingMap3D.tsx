"use client";

import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import { Sparkles, Maximize2, Compass, RotateCcw } from "lucide-react";

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

// ── Multi-Variant 3D Stylized Car ──────────────────────────────────────────
function StylizedCar({
  color = "#2D3748",
  isUserCar = false,
}: {
  color?: string;
  isUserCar?: boolean;
}) {
  return (
    <group position={[0, 0.22, 0]}>
      {/* Ground Contact Shadow */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 3.6]} />
        <meshBasicMaterial color="#3D3024" transparent opacity={0.35} />
      </mesh>

      {/* Main Lower Chassis Body */}
      <mesh castShadow receiveShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[1.65, 0.36, 3.3]} />
        <meshStandardMaterial
          color={isUserCar ? "#D84A2B" : color}
          roughness={0.2}
          metalness={isUserCar ? 0.4 : 0.6}
          emissive={isUserCar ? "#D84A2B" : "#000000"}
          emissiveIntensity={isUserCar ? 0.3 : 0}
        />
      </mesh>

      {/* Cabin / Greenhouse Upper Body */}
      <mesh castShadow receiveShadow position={[0, 0.42, -0.1]}>
        <boxGeometry args={[1.38, 0.32, 1.9]} />
        <meshStandardMaterial color="#1C2128" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Front Windshield Angle Highlight */}
      <mesh position={[0, 0.38, 1.0]} rotation={[Math.PI / 5, 0, 0]}>
        <planeGeometry args={[1.34, 0.25]} />
        <meshStandardMaterial color="#2D3748" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Front Xenon Headlights */}
      {[-0.58, 0.58].map((hx, idx) => (
        <group key={idx} position={[hx, 0.16, 1.66]}>
          <mesh>
            <boxGeometry args={[0.32, 0.1, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}

      {/* Red/Orange LED Taillight Strip */}
      <mesh position={[0, 0.18, -1.66]}>
        <boxGeometry args={[1.48, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#D84A2B"
          emissive="#D84A2B"
          emissiveIntensity={isUserCar ? 2.0 : 1.2}
        />
      </mesh>

      {/* 4 Alloy Wheels */}
      {[-0.84, 0.84].map((x, i) =>
        [-1.0, 1.0].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, -0.04, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.24, 0.18, 16]} />
              <meshStandardMaterial color="#2B303A" roughness={0.9} />
            </mesh>
            <mesh position={[0, i === 0 ? -0.09 : 0.09, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
            </mesh>
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
  onSelect,
  reducedMotion,
}: {
  slot: ParkingSlot;
  isSelected: boolean;
  isNearest: boolean;
  onSelect: (slot: ParkingSlot) => void;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isAvailable = slot.status === "available";

  const statusColor = useMemo(() => {
    switch (slot.status) {
      case "available":
        return "#10B981"; // Emerald Green
      case "occupied":
        return "#EF4444"; // Red / Coral
      case "reserved":
        return "#F59E0B"; // Amber
      default:
        return "#78716C";
    }
  }, [slot.status]);

  const carColor = useMemo(() => {
    const colors = ["#1E293B", "#334155", "#475569", "#1E1B4B", "#2A324B", "#3D3A45", "#52525B"];
    const hash = slot.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [slot.id]);

  const pos: [number, number, number] = [slot.positionX, slot.positionY, slot.positionZ];

  return (
    <group
      position={pos}
      rotation={[0, slot.rotationY || 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (isAvailable) {
          onSelect(slot);
        }
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
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 4.0]} />
          <meshBasicMaterial
            color={isSelected ? "#D84A2B" : isNearest ? "#D84A2B" : hovered ? "#10B981" : statusColor}
            wireframe
            transparent
            opacity={isSelected ? 1.0 : isNearest ? 0.95 : hovered ? 0.9 : 0.6}
          />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
          <planeGeometry args={[2.14, 3.94]} />
          <meshBasicMaterial
            color={isSelected ? "#D84A2B" : isNearest ? "#D84A2B" : statusColor}
            transparent
            opacity={isSelected ? 0.32 : isNearest ? 0.22 : hovered ? 0.18 : 0.06}
          />
        </mesh>

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
      {slot.status === "occupied" && (
        <StylizedCar color={carColor} isUserCar={false} />
      )}

      {/* Nearest Recommended Glowing Pin */}
      {isNearest && isAvailable && (
        <group position={[0, 0, 0]}>
          {/* Ground Pulsing Orange Ring */}
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.25, 32]} />
            <meshBasicMaterial color="#D84A2B" transparent opacity={0.7} />
          </mesh>

          {!reducedMotion ? (
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <group position={[0, 2.0, 0]}>
                <mesh position={[0, 0.3, 0]}>
                  <sphereGeometry args={[0.3, 20, 20]} />
                  <meshStandardMaterial color="#D84A2B" emissive="#D84A2B" emissiveIntensity={1.8} />
                </mesh>
                <mesh position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.16, 0.42, 16]} />
                  <meshStandardMaterial color="#D84A2B" emissive="#D84A2B" emissiveIntensity={1.8} />
                </mesh>
              </group>
            </Float>
          ) : (
            <group position={[0, 2.0, 0]}>
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.3, 20, 20]} />
                <meshStandardMaterial color="#D84A2B" emissive="#D84A2B" emissiveIntensity={1.8} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* Selected Slot Bounding Highlight Box */}
      {isSelected && (
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2.28, 0.75, 4.15]} />
          <meshBasicMaterial color="#D84A2B" wireframe transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

// ── Concrete Pillar with Stencil Label & Orange Accent Base ──────────────────
function ConcretePillar({
  position,
  label,
  sub = "ZONE A",
}: {
  position: [number, number, number];
  label: string;
  sub?: string;
}) {
  return (
    <group position={position}>
      {/* Main Structural Column */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[0.85, 3.6, 0.85]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Beveled Chamfer Frame */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.87, 3.62, 0.87]} />
        <meshBasicMaterial color="#DDD3C5" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Burnt-Orange Safety Accent Base Band */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.88, 0.3, 0.88]} />
        <meshStandardMaterial color="#D84A2B" emissive="#D84A2B" emissiveIntensity={0.4} />
      </mesh>

      {/* Pillar ID Text Front */}
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
      {/* Main Concrete Floor Slab */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 38]} />
        <meshStandardMaterial color="#ECE5DA" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Main Driving Center Lane */}
      <mesh receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.2, 36]} />
        <meshStandardMaterial color="#E4DDD2" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Center Dashed Lane Divider */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.65} />
      </mesh>

      {/* Floor Stencil on Concrete */}
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

// ── Camera Controller ────────────────────────────────────────────────────────
function CameraRig({
  recenterTrigger,
}: {
  recenterTrigger: number;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current && recenterTrigger > 0) {
      controlsRef.current.reset();
    }
  }, [recenterTrigger]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 - 0.08}
      minDistance={10}
      maxDistance={45}
      target={[0, 0, -4]}
    />
  );
}

// ── Main Exported Interactive 3D Parking Map ─────────────────────────────────
export default function InteractiveParkingMap3D({
  slots = [],
  selectedSlot,
  nearestSlot,
  onSelectSlot,
  currentFloor = "B2",
}: {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  nearestSlot: ParkingSlot | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  currentFloor?: string;
}) {
  const [recenterCount, setRecenterCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[540px] bg-[#F8F4ED] rounded-3xl overflow-hidden select-none border border-[#EAE3D9]">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E2D9CC] shadow-xs pointer-events-auto text-[12px] font-semibold text-[#1C1917]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>3D Interactive WebGL Map ({currentFloor})</span>
        </div>

        <button
          type="button"
          onClick={() => setRecenterCount((c) => c + 1)}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E2D9CC] text-[#1C1917] text-[12px] font-bold shadow-xs hover:border-[#D84A2B]/40 transition-colors pointer-events-auto cursor-pointer"
          title="Recenter 3D Camera"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D84A2B]" />
          <span>Recenter Camera</span>
        </button>
      </div>

      <Canvas
        camera={{ position: [14, 18, 16], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#F8F4ED"]} />

        <ambientLight intensity={0.95} color="#FFF8EF" />
        <directionalLight
          position={[18, 30, 18]}
          intensity={1.2}
          color="#FFF7ED"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-18, 25, -18]} intensity={0.4} color="#FDE8D0" />
        <pointLight position={[0, 12, 0]} intensity={1.0} color="#FFEDD5" distance={40} />

        <Suspense fallback={null}>
          <ParkingFloorGrid floor={currentFloor} />

          {/* Render All Parking Slots in 3D */}
          {slots.map((slot) => (
            <ParkingSlot3D
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              isNearest={nearestSlot?.id === slot.id}
              onSelect={onSelectSlot}
              reducedMotion={reducedMotion}
            />
          ))}

          {/* Concrete Pillars with Dynamic Pillar IDs */}
          <ConcretePillar position={[-6.0, 0, -8.0]} label="P02" sub="Zone A" />
          <ConcretePillar position={[-3.0, 0, -8.0]} label="P04" sub="Zone A" />
          <ConcretePillar position={[0.0, 0, -8.0]} label="P06" sub="Zone A" />
          <ConcretePillar position={[3.0, 0, -8.0]} label="P08" sub="Zone A" />
          <ConcretePillar position={[6.0, 0, -8.0]} label="P10" sub="Zone A" />

          <ConcretePillar position={[-6.0, 0, 0.0]} label="P14" sub="Zone B" />
          <ConcretePillar position={[-3.0, 0, 0.0]} label="P16" sub="Zone B" />
          <ConcretePillar position={[0.0, 0, 0.0]} label="P18" sub="Zone B" />
          <ConcretePillar position={[3.0, 0, 0.0]} label="P20" sub="Zone B" />
          <ConcretePillar position={[6.0, 0, 0.0]} label="P22" sub="Zone B" />

          <CameraRig recenterTrigger={recenterCount} />
        </Suspense>
      </Canvas>
    </div>
  );
}
