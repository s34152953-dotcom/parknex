"use client";

import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";

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
  carColor?: string;
  plateNumber?: string;
}

// ── Realistic Multi-Variant 3D Car Model ────────────────────────────────────
function StylizedCar({
  color = "#1E293B",
  isUserCar = false,
  bodyType = "sedan",
}: {
  color?: string;
  isUserCar?: boolean;
  bodyType?: "sedan" | "suv" | "coupe";
}) {
  const heightMult = bodyType === "suv" ? 1.25 : bodyType === "coupe" ? 0.9 : 1.0;
  const cabinLength = bodyType === "coupe" ? 1.5 : 1.9;

  return (
    <group position={[0, 0.22, 0]}>
      {/* Ground Contact Shadow */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 3.6]} />
        <meshBasicMaterial color="#020305" transparent opacity={0.85} />
      </mesh>

      {/* Main Lower Chassis Body */}
      <mesh castShadow receiveShadow position={[0, 0.14 * heightMult, 0]}>
        <boxGeometry args={[1.65, 0.36 * heightMult, 3.3]} />
        <meshStandardMaterial
          color={isUserCar ? "#0D2C54" : color}
          roughness={0.2}
          metalness={0.75}
          emissive={isUserCar ? "#0066FF" : "#000000"}
          emissiveIntensity={isUserCar ? 0.3 : 0}
        />
      </mesh>

      {/* Wheel Arches Flares */}
      {[-0.82, 0.82].map((x, i) => (
        <mesh key={i} position={[x, 0.08 * heightMult, 0]}>
          <boxGeometry args={[0.08, 0.22 * heightMult, 3.1]} />
          <meshStandardMaterial color={isUserCar ? "#0A2244" : color} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}

      {/* Cabin / Greenhouse Upper Body */}
      <mesh castShadow receiveShadow position={[0, (0.42 * heightMult), -0.1]}>
        <boxGeometry args={[1.38, 0.32 * heightMult, cabinLength]} />
        <meshStandardMaterial
          color="#080C14"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Front Windshield Angle Highlight */}
      <mesh position={[0, 0.38 * heightMult, cabinLength * 0.52]} rotation={[Math.PI / 5, 0, 0]}>
        <planeGeometry args={[1.34, 0.25]} />
        <meshStandardMaterial color="#0A0E18" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Front Xenon Headlights */}
      {[-0.58, 0.58].map((hx, idx) => (
        <group key={idx} position={[hx, 0.16 * heightMult, 1.66]}>
          <mesh>
            <boxGeometry args={[0.32, 0.1, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}

      {/* Continuous Red LED Taillight Strip */}
      <mesh position={[0, 0.18 * heightMult, -1.66]}>
        <boxGeometry args={[1.48, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#FF1E33"
          emissive="#FF1E33"
          emissiveIntensity={isUserCar ? 2.0 : 1.2}
        />
      </mesh>

      {/* 4 Alloy Wheels */}
      {[-0.84, 0.84].map((x, i) =>
        [-1.0, 1.0].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, -0.04, z]} rotation={[0, 0, Math.PI / 2]}>
            {/* Rubber Tire */}
            <mesh>
              <cylinderGeometry args={[0.24, 0.24, 0.18, 16]} />
              <meshStandardMaterial color="#0A0D12" roughness={0.9} />
            </mesh>
            {/* Silver Rim */}
            <mesh position={[0, i === 0 ? -0.09 : 0.09, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// ── Individual Parking Slot ──────────────────────────────────────────────────
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
        return "#10B981"; // Vibrant Emerald Green
      case "occupied":
        return "#EF4444"; // Vivid Red
      case "reserved":
        return "#F59E0B"; // Bright Amber
      case "my_vehicle":
        return "#06B6D4"; // Electric Cyan
      default:
        return "#64748B";
    }
  }, [slot.status]);

  const carColor = useMemo(() => {
    if (slot.carColor) return slot.carColor;
    const colors = ["#1E293B", "#0F172A", "#334155", "#475569", "#1E1B4B", "#312E81", "#7F1D1D"];
    const hash = slot.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [slot.carColor, slot.id]);

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
      {/* Slot Ground Marking Box */}
      <group position={[0, 0.02, 0]}>
        {/* Perimeter Painted Outline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 4.0]} />
          <meshBasicMaterial
            color={isSelected ? "#FFFFFF" : hovered ? "#38BDF8" : statusColor}
            wireframe
            transparent
            opacity={isSelected ? 1 : hovered ? 0.9 : 0.6}
          />
        </mesh>

        {/* Semi-transparent Tinted Floor Zone */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
          <planeGeometry args={[2.04, 3.94]} />
          <meshBasicMaterial
            color={isSelected ? "#0284C7" : statusColor}
            transparent
            opacity={isSelected ? 0.35 : hovered ? 0.22 : 0.06}
          />
        </mesh>

        {/* Stenciled Slot Number Label on Floor */}
        <group position={[0, 0.01, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.22}
            color={isSelected ? "#FFFFFF" : statusColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
          >
            {slot.slotNumber.replace("Slot ", "")}
          </Text>
        </group>
      </group>

      {/* Render 3D Car if not available */}
      {slot.status !== "available" && (
        <StylizedCar
          color={carColor}
          isUserCar={slot.status === "my_vehicle"}
        />
      )}

      {/* Glowing 3D Beacon for User's Vehicle */}
      {slot.status === "my_vehicle" && (
        <group position={[0, 0, 0]}>
          {/* Floor Pulsing Cyan Ring */}
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.25, 32]} />
            <meshBasicMaterial color="#06B6D4" transparent opacity={0.8} />
          </mesh>

          {/* Floating High-Vis Pin Marker */}
          <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={[0, 2.2, 0]}>
              {/* Spherical Head */}
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.32, 24, 24]} />
                <meshStandardMaterial
                  color="#06B6D4"
                  emissive="#06B6D4"
                  emissiveIntensity={1.8}
                />
              </mesh>
              {/* Pointer Cone */}
              <mesh position={[0, 0.06, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.18, 0.45, 16]} />
                <meshStandardMaterial
                  color="#06B6D4"
                  emissive="#06B6D4"
                  emissiveIntensity={1.8}
                />
              </mesh>
            </group>
          </Float>
        </group>
      )}

      {/* Selected Slot Bounding Highlight Box */}
      {isSelected && (
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2.18, 0.7, 4.08]} />
          <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

// ── Concrete Pillar with Stencil Label & Accent Stripe ────────────────────────
function ConcretePillar({
  position,
  label = "P-A 18",
  sub = "ZONE A",
}: {
  position: [number, number, number];
  label?: string;
  sub?: string;
}) {
  return (
    <group position={position}>
      {/* Main Structural Column */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
        <boxGeometry args={[0.85, 3.6, 0.85]} />
        <meshStandardMaterial
          color="#151A23"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      {/* Beveled Chamfer Frame Wireframe */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.87, 3.62, 0.87]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Safety Yellow/Cyan Accent Base Strip */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.88, 0.3, 0.88]} />
        <meshStandardMaterial color="#0EA5E9" emissive="#0284C7" emissiveIntensity={0.4} />
      </mesh>

      {/* Pillar ID Text Front */}
      <Text
        position={[0, 2.4, 0.44]}
        fontSize={0.24}
        color="#F8FAFC"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, 2.1, 0.44]}
        fontSize={0.13}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        {sub}
      </Text>

      {/* Pillar ID Text Back */}
      <Text
        position={[0, 2.4, -0.44]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.24}
        color="#F8FAFC"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, 2.1, -0.44]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.13}
        color="#94A3B8"
        anchorX="center"
        anchorY="middle"
      >
        {sub}
      </Text>
    </group>
  );
}

// ── Complete Garage Floor Surface, Lanes & Directional Markings ───────────────
function ParkingFloorGrid() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Concrete Floor Slab */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[48, 40]} />
        <meshStandardMaterial
          color="#070A0F"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Main Driving Center Lane */}
      <mesh receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.2, 38]} />
        <meshStandardMaterial
          color="#05070B"
          roughness={0.65}
          metalness={0.3}
        />
      </mesh>

      {/* Left Driving Aisle */}
      <mesh receiveShadow position={[-14, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 38]} />
        <meshStandardMaterial
          color="#05070B"
          roughness={0.65}
          metalness={0.3}
        />
      </mesh>

      {/* Right Driving Aisle */}
      <mesh receiveShadow position={[14, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 38]} />
        <meshStandardMaterial
          color="#05070B"
          roughness={0.65}
          metalness={0.3}
        />
      </mesh>

      {/* Center Dashed Lane Divider */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 34]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
      </mesh>

      {/* Speed Limit Stencil on Floor */}
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.7}
          color="#64748B"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          MAX 10 KM/H
        </Text>
      </group>

      {/* Directional ENTRY Markings */}
      <group position={[0, 0.01, 16]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.85}
          color="#10B981"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          ▲ ▲ ENTRY
        </Text>
      </group>

      {/* Directional EXIT Markings */}
      <group position={[0, 0.01, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <Text
          fontSize={0.85}
          color="#EF4444"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          EXIT ▲ ▲
        </Text>
      </group>
    </group>
  );
}

// ── Camera Controller ────────────────────────────────────────────────────────
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
      maxPolarAngle={is3D ? Math.PI / 2 - 0.08 : 0.01}
      minDistance={10}
      maxDistance={50}
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
    <div className="relative w-full h-full bg-[#040608] overflow-hidden select-none">
      <Canvas
        camera={{
          position: is3D ? [15, 24, 24] : [0, 34, 0.1],
          fov: 40,
        }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#040608"]} />

        {/* Atmospheric Lighting matching reference */}
        <ambientLight intensity={0.75} color="#CBD5E1" />
        <directionalLight
          position={[18, 30, 18]}
          intensity={1.4}
          color="#FFFFFF"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-18, 25, -18]}
          intensity={0.6}
          color="#93C5FD"
        />
        <pointLight position={[0, 10, 0]} intensity={1.2} color="#60A5FA" distance={35} />

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

          {/* Concrete Columns with Zone Badges */}
          <ConcretePillar position={[-5.8, 0, 10]} label="P17" sub="ZONE A" />
          <ConcretePillar position={[-5.8, 0, 0]} label="P18" sub="ZONE A" />
          <ConcretePillar position={[-5.8, 0, -10]} label="P19" sub="ZONE A" />

          <ConcretePillar position={[5.8, 0, 10]} label="P20" sub="ZONE A" />
          <ConcretePillar position={[5.8, 0, 0]} label="P21" sub="ZONE A" />
          <ConcretePillar position={[5.8, 0, -10]} label="P22" sub="ZONE A" />

          <ConcretePillar position={[-16.5, 0, 6]} label="P14" sub="ZONE B" />
          <ConcretePillar position={[-16.5, 0, -6]} label="P15" sub="ZONE B" />
          <ConcretePillar position={[16.5, 0, 6]} label="P24" sub="ZONE C" />
          <ConcretePillar position={[16.5, 0, -6]} label="P25" sub="ZONE C" />

          <CameraRig is3D={is3D} />
        </Suspense>
      </Canvas>
    </div>
  );
}
