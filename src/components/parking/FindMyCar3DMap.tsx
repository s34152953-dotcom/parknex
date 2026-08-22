"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Text, Line } from "@react-three/drei";
import * as THREE from "three";

// ── Realistic User Vehicle for Find My Car ───────────────────────────────────
function UserCarModel() {
  return (
    <group position={[0, 0.22, 0]}>
      {/* Ground Contact Shadow */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 3.8]} />
        <meshBasicMaterial color="#0A0E14" transparent opacity={0.5} />
      </mesh>

      {/* Burnt Orange Floor Underglow */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 4.2]} />
        <meshBasicMaterial color="#D84A2B" transparent opacity={0.35} />
      </mesh>

      {/* Main Body */}
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[1.65, 0.38, 3.3]} />
        <meshStandardMaterial
          color="#D84A2B"
          roughness={0.2}
          metalness={0.4}
          emissive="#D84A2B"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Cabin Roof & Windows */}
      <mesh castShadow position={[0, 0.44, -0.1]}>
        <boxGeometry args={[1.38, 0.34, 1.8]} />
        <meshStandardMaterial color="#10151D" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Front Xenon Headlights */}
      {[-0.58, 0.58].map((hx, i) => (
        <mesh key={i} position={[hx, 0.18, 1.66]}>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.4} />
        </mesh>
      ))}

      {/* Rear Lightbar */}
      <mesh position={[0, 0.2, -1.66]}>
        <boxGeometry args={[1.48, 0.08, 0.02]} />
        <meshStandardMaterial color="#D84A2B" emissive="#D84A2B" emissiveIntensity={2.0} />
      </mesh>

      {/* 4 Alloy Wheels */}
      {[-0.84, 0.84].map((x, i) =>
        [-1.0, 1.0].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, -0.04, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.24, 0.18, 16]} />
              <meshStandardMaterial color="#161D27" roughness={0.9} />
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

// ── Background Parked Vehicles ───────────────────────────────────────────────
function AmbientParkedCar({ position, color = "#1E2530" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.6, 0.35, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, -0.1]}>
        <boxGeometry args={[1.35, 0.3, 1.7]} />
        <meshStandardMaterial color="#0A0E14" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

// ── Burnt Orange Navigation Route Polyline ──────────────────────────────────
function NavigationPath({ points }: { points: [number, number, number][] }) {
  const linePoints = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);

  return (
    <group>
      {/* Outer Glow Line */}
      <Line points={linePoints} color="#BA3C20" lineWidth={6} dashed={false} />
      {/* Inner Crisp Burnt Orange Core */}
      <Line points={linePoints} color="#D84A2B" lineWidth={3.5} dashed={false} />

      {/* Waypoint turn nodes with pulsing rings */}
      {points.map((pt, i) => (
        <group key={i} position={pt}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 24]} />
            <meshBasicMaterial color="#D84A2B" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#D84A2B" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface FindMyCar3DMapProps {
  routePoints?: [number, number, number][];
  isNavigating?: boolean;
  slotNumber?: string;
  floor?: string;
  zone?: string;
  pillar?: string;
  startLandmarkName?: string;
  startLandmarkPos?: [number, number, number];
}

export default function FindMyCar3DMap({
  routePoints,
  isNavigating = false,
  slotNumber = "B-03",
  floor = "B2",
  zone = "Zone B",
  pillar = "Pillar 18",
  startLandmarkName = "Mall Entrance Lobby",
  startLandmarkPos = [0, 0.1, 15],
}: FindMyCar3DMapProps) {
  // Default route points fallback if none provided
  const activeRoutePoints: [number, number, number][] = useMemo(() => {
    if (routePoints && routePoints.length >= 2) return routePoints;
    return [
      startLandmarkPos || [0, 0.12, 15],
      [0, 0.12, 7],
      [-4.0, 0.12, 7],
      [-4.0, 0.12, 0],
    ];
  }, [routePoints, startLandmarkPos]);

  const targetPoint = activeRoutePoints[activeRoutePoints.length - 1] || [-4.0, 0.12, 0];

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[460px] bg-[#0A0E14] overflow-hidden select-none rounded-2xl">
      <Canvas
        camera={{ position: [12, 16, 18], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#0A0E14"]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.6} color="#F5F7FA" />
        <directionalLight position={[15, 25, 15]} intensity={1.1} color="#F5F7FA" castShadow />
        <pointLight position={[targetPoint[0], 6, targetPoint[2]]} intensity={1.8} color="#D84A2B" distance={20} />
        <pointLight position={[startLandmarkPos[0], 6, startLandmarkPos[2]]} intensity={1.5} color="#10B981" distance={18} />

        <Suspense fallback={null}>
          {/* Main Floor Slab */}
          <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 42]} />
            <meshStandardMaterial color="#10151D" roughness={0.7} />
          </mesh>

          {/* Central Main Lane */}
          <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.5, 38]} />
            <meshStandardMaterial color="#161D27" roughness={0.6} />
          </mesh>

          {/* Left & Right Aisle Tracks */}
          <mesh position={[-4.0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 38]} />
            <meshStandardMaterial color="#131922" roughness={0.6} />
          </mesh>
          <mesh position={[4.0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 38]} />
            <meshStandardMaterial color="#131922" roughness={0.6} />
          </mesh>

          {/* Start Landmark Pavilion */}
          <group position={startLandmarkPos}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[3.8, 2.4, 2.2]} />
              <meshStandardMaterial color="#151B24" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.8, 32]} />
              <meshBasicMaterial color="#10B981" transparent opacity={0.25} />
            </mesh>
            <Text
              position={[0, 2.7, 0]}
              fontSize={0.36}
              color="#10B981"
              anchorX="center"
              anchorY="bottom"
              letterSpacing={0.06}
            >
              {startLandmarkName.toUpperCase()}
            </Text>
          </group>

          {/* Dynamic Navigation Polyline */}
          <NavigationPath points={activeRoutePoints} />

          {/* Destination Slot & User Vehicle */}
          <group position={targetPoint} rotation={[0, Math.PI / 2, 0]}>
            {/* Slot Ground Marking */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.2, 4.2]} />
              <meshBasicMaterial color="#D84A2B" wireframe transparent opacity={0.85} />
            </mesh>

            <UserCarModel />

            {/* Glowing Orange Beacon Pin */}
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group position={[0, 2.4, 0]}>
                <mesh position={[0, 0.35, 0]}>
                  <sphereGeometry args={[0.35, 24, 24]} />
                  <meshStandardMaterial
                    color="#D84A2B"
                    emissive="#D84A2B"
                    emissiveIntensity={2.2}
                  />
                </mesh>
                <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.2, 0.5, 16]} />
                  <meshStandardMaterial
                    color="#D84A2B"
                    emissive="#D84A2B"
                    emissiveIntensity={2.2}
                  />
                </mesh>
              </group>
            </Float>
          </group>

          {/* Other Ambient Parked Cars */}
          <AmbientParkedCar position={[-4.0, 0, -6]} color="#1E2530" />
          <AmbientParkedCar position={[-4.0, 0, -11]} color="#252D3A" />
          <AmbientParkedCar position={[4.0, 0, 2]} color="#1A202A" />
          <AmbientParkedCar position={[4.0, 0, 8]} color="#212936" />
          <AmbientParkedCar position={[4.0, 0, -6]} color="#1A202A" />

          {/* Concrete Pillars with Burnt Orange Accent */}
          <group position={[-6.0, 1.8, -4]}>
            <mesh>
              <boxGeometry args={[0.8, 3.6, 0.8]} />
              <meshStandardMaterial color="#161D27" />
            </mesh>
            <mesh position={[0, -1.45, 0]}>
              <boxGeometry args={[0.82, 0.3, 0.82]} />
              <meshStandardMaterial color="#D84A2B" />
            </mesh>
            <Text position={[0, 0.6, 0.42]} fontSize={0.22} color="#F5F7FA">
              P06 · ZONE A
            </Text>
          </group>

          <group position={[-6.0, 1.8, 4]}>
            <mesh>
              <boxGeometry args={[0.8, 3.6, 0.8]} />
              <meshStandardMaterial color="#161D27" />
            </mesh>
            <mesh position={[0, -1.45, 0]}>
              <boxGeometry args={[0.82, 0.3, 0.82]} />
              <meshStandardMaterial color="#D84A2B" />
            </mesh>
            <Text position={[0, 0.6, 0.42]} fontSize={0.22} color="#F5F7FA">
              P18 · ZONE B
            </Text>
          </group>

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={6}
            maxDistance={38}
            target={[targetPoint[0] / 2, 0, (startLandmarkPos[2] + targetPoint[2]) / 2]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
