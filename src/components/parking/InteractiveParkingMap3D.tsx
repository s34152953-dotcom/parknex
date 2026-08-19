"use client";

import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { Check, Compass, Layers, Maximize2, Minus, Plus, X } from "lucide-react";

export type SlotStatus = "available" | "occupied" | "reserved" | "my_vehicle";

export interface ParkingSlotData {
  id: string;
  slotNumber: string; // e.g. "Slot A-18"
  pillarName?: string; // e.g. "Pillar 18"
  zoneName: string; // e.g. "Zone A"
  floorName: string; // e.g. "B2"
  status: SlotStatus;
  position: [number, number, number];
  rotationY?: number;
  carModel?: string;
  plateNumber?: string;
}

// ── Low-Poly Stylized 3D Car Model Component ─────────────────────────────────
function CarModel({ color = "#1E293B", hasGlow = false }: { color?: string; hasGlow?: boolean }) {
  return (
    <group position={[0, 0.22, 0]}>
      {/* Car Base Body */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.6, 0.32, 3.2]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.7}
          emissive={hasGlow ? "#0066FF" : "#000000"}
          emissiveIntensity={hasGlow ? 0.35 : 0}
        />
      </mesh>

      {/* Cabin / Roof & Windows */}
      <mesh castShadow receiveShadow position={[0, 0.38, -0.1]}>
        <boxGeometry args={[1.35, 0.28, 1.8]} />
        <meshStandardMaterial
          color="#0B0F17"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Front Headlights */}
      <mesh position={[0.55, 0.15, 1.61]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.55, 0.15, 1.61]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
      </mesh>

      {/* Rear Taillights */}
      <mesh position={[0, 0.16, -1.61]}>
        <boxGeometry args={[1.4, 0.06, 0.02]} />
        <meshStandardMaterial color="#FF2233" emissive="#FF2233" emissiveIntensity={1.5} />
      </mesh>

      {/* Wheels */}
      {[-0.82, 0.82].map((x, i) =>
        [-0.95, 0.95].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, -0.05, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
            <meshStandardMaterial color="#0A0D12" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── Individual 3D Parking Slot Box ────────────────────────────────────────────
function ParkingSlot({
  slot,
  isSelected,
  onSelect,
}: {
  slot: ParkingSlotData;
  isSelected: boolean;
  onSelect: (slot: ParkingSlotData) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const statusColor = useMemo(() => {
    switch (slot.status) {
      case "available":
        return "#10B981"; // emerald green
      case "occupied":
        return "#EF4444"; // red
      case "reserved":
        return "#F59E0B"; // amber
      case "my_vehicle":
        return "#06B6D4"; // electric cyan/blue
      default:
        return "#6B7280";
    }
  }, [slot.status]);

  const carColor = useMemo(() => {
    switch (slot.status) {
      case "occupied":
        return "#1E222D";
      case "reserved":
        return "#2D2418";
      case "my_vehicle":
        return "#0B2A4A";
      default:
        return "#1E222D";
    }
  }, [slot.status]);

  return (
    <group
      position={slot.position}
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
      {/* Slot Ground Outline Box */}
      <group position={[0, 0.02, 0]}>
        {/* Border line box */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 3.8]} />
          <meshBasicMaterial
            color={isSelected ? "#FFFFFF" : hovered ? "#3B82F6" : statusColor}
            wireframe
            transparent
            opacity={isSelected ? 1 : hovered ? 0.9 : 0.65}
          />
        </mesh>

        {/* Semi-transparent filled floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
          <planeGeometry args={[1.96, 3.76]} />
          <meshBasicMaterial
            color={isSelected ? "#146BFF" : statusColor}
            transparent
            opacity={isSelected ? 0.25 : hovered ? 0.15 : 0.04}
          />
        </mesh>
      </group>

      {/* Render Car if Occupied, Reserved, or My Vehicle */}
      {slot.status !== "available" && (
        <CarModel
          color={carColor}
          hasGlow={slot.status === "my_vehicle" || isSelected}
        />
      )}

      {/* Glowing Pin Marker for My Vehicle */}
      {slot.status === "my_vehicle" && (
        <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={[0, 1.8, 0]}>
            {/* Blue Pin Head */}
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.26, 24, 24]} />
              <meshStandardMaterial
                color="#06B6D4"
                emissive="#06B6D4"
                emissiveIntensity={1.2}
              />
            </mesh>
            {/* Pin Needle */}
            <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.15, 0.35, 16]} />
              <meshStandardMaterial
                color="#06B6D4"
                emissive="#06B6D4"
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        </Float>
      )}

      {/* Selected Animated Bounding Box */}
      {isSelected && (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[2.08, 0.6, 3.88]} />
          <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ── Concrete Parking Pillars with Zone Labels ────────────────────────────────
function ConcretePillar({
  position,
  label = "P-A 18",
}: {
  position: [number, number, number];
  label?: string;
}) {
  return (
    <group position={position}>
      {/* Pillar Geometry */}
      <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[0.7, 3.2, 0.7]} />
        <meshStandardMaterial
          color="#161B24"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Edge highlight lines */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.72, 3.22, 0.72]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Pillar Zone Label Text */}
      <Text
        position={[0, 2.2, 0.36]}
        fontSize={0.22}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// ── Floor Surface & Lane Markings ─────────────────────────────────────────────
function ParkingFloorGrid() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Floor Slab */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 36]} />
        <meshStandardMaterial
          color="#080B10"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* Central Driving Lane Asphalt Track */}
      <mesh receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 34]} />
        <meshStandardMaterial
          color="#06080D"
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Lane Center Dashed Line */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 30]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.15} />
      </mesh>

      {/* Floor Text "↑ ↑ ENTRY" in green */}
      <group position={[0, 0.01, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.8}
          color="#10B981"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          ↑ ↑ ENTRY
        </Text>
      </group>

      {/* Floor Text "EXIT ↑" in red */}
      <group position={[0, 0.01, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.8}
          color="#EF4444"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          EXIT ↑
        </Text>
      </group>
    </group>
  );
}

// ── Camera Controller for Smooth Orbit and Centering ─────────────────────────
function CameraRig({ is3D }: { is3D: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={is3D ? Math.PI / 2 - 0.1 : 0.01}
      minDistance={10}
      maxDistance={45}
      target={[0, 0, 0]}
    />
  );
}

// ── Main Exported Interactive 3D Parking Map ─────────────────────────────────
export default function InteractiveParkingMap3D({
  slots = [],
  selectedSlot,
  onSelectSlot,
  is3D = true,
}: {
  slots: ParkingSlotData[];
  selectedSlot: ParkingSlotData | null;
  onSelectSlot: (slot: ParkingSlotData) => void;
  is3D?: boolean;
}) {
  return (
    <div className="relative w-full h-full bg-[#05070A] overflow-hidden select-none">
      <Canvas
        camera={{
          position: is3D ? [14, 22, 22] : [0, 32, 0.1],
          fov: 42,
        }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#05070A"]} />

        {/* Ambient & Directional Lighting matching dark cinematic look */}
        <ambientLight intensity={0.65} color="#B4C6E7" />
        <directionalLight
          position={[15, 25, 15]}
          intensity={1.2}
          color="#FFFFFF"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[0, 8, 0]} intensity={0.8} color="#93C5FD" distance={25} />

        <Suspense fallback={null}>
          <ParkingFloorGrid />

          {/* Render All Parking Slots */}
          {slots.map((slot) => (
            <ParkingSlot
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              onSelect={onSelectSlot}
            />
          ))}

          {/* Concrete Pillars */}
          <ConcretePillar position={[-5.5, 0, 8]} label="P-A 17" />
          <ConcretePillar position={[-5.5, 0, 0]} label="P-A 18" />
          <ConcretePillar position={[-5.5, 0, -8]} label="P-A 19" />
          <ConcretePillar position={[5.5, 0, 8]} label="P-A 20" />
          <ConcretePillar position={[5.5, 0, 0]} label="P-A 21" />
          <ConcretePillar position={[5.5, 0, -8]} label="P-A 22" />

          <CameraRig is3D={is3D} />
        </Suspense>
      </Canvas>
    </div>
  );
}
