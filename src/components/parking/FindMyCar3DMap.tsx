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
        <meshBasicMaterial color="#3D3024" transparent opacity={0.3} />
      </mesh>

      {/* Deep Red Floor Underglow */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 4.2]} />
        <meshBasicMaterial color="#C93B2F" transparent opacity={0.3} />
      </mesh>

      {/* Main Body */}
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[1.65, 0.38, 3.3]} />
        <meshStandardMaterial
          color="#C93B2F"
          roughness={0.2}
          metalness={0.4}
          emissive="#C93B2F"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Cabin Roof & Windows */}
      <mesh castShadow position={[0, 0.44, -0.1]}>
        <boxGeometry args={[1.38, 0.34, 1.8]} />
        <meshStandardMaterial color="#241F1B" roughness={0.05} metalness={0.95} />
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
        <meshStandardMaterial color="#C93B2F" emissive="#C93B2F" emissiveIntensity={2.0} />
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

// ── Background Parked Vehicles ───────────────────────────────────────────────
function AmbientParkedCar({ position, color = "#70675F" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.6, 0.35, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, -0.1]}>
        <boxGeometry args={[1.35, 0.3, 1.7]} />
        <meshStandardMaterial color="#241F1B" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

// ── Deep Red Navigation Route Polyline ──────────────────────────────────
function NavigationPath({ points }: { points: [number, number, number][] }) {
  const linePoints = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);

  return (
    <group>
      {/* Outer Glow Line */}
      <Line points={linePoints} color="#A92E25" lineWidth={6} dashed={false} />
      {/* Inner Crisp Red Core */}
      <Line points={linePoints} color="#C93B2F" lineWidth={3.5} dashed={false} />

      {/* Waypoint turn nodes with pulsing rings */}
      {points.map((pt, i) => (
        <group key={i} position={pt}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 24]} />
            <meshBasicMaterial color="#C93B2F" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#C93B2F" emissiveIntensity={1.8} />
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
    <div className="relative w-full h-full min-h-[360px] sm:h-[460px] bg-[#FAF7F2] overflow-hidden select-none rounded-2xl border border-[#DED3C7]">
      <Canvas
        camera={{ position: [12, 16, 18], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#FAF7F2"]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} color="#FFFFFF" />
        <directionalLight position={[15, 25, 15]} intensity={1.2} color="#FFFFFF" castShadow />
        <pointLight position={[targetPoint[0], 6, targetPoint[2]]} intensity={1.8} color="#C93B2F" distance={20} />
        <pointLight position={[startLandmarkPos[0], 6, startLandmarkPos[2]]} intensity={1.5} color="#2F7D5A" distance={18} />

        <Suspense fallback={null}>
          {/* Main Floor Slab */}
          <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 42]} />
            <meshStandardMaterial color="#ECE5DA" roughness={0.7} />
          </mesh>

          {/* Central Main Lane */}
          <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.5, 38]} />
            <meshStandardMaterial color="#E4DDD2" roughness={0.6} />
          </mesh>

          {/* Left & Right Aisle Tracks */}
          <mesh position={[-4.0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 38]} />
            <meshStandardMaterial color="#DDD5C9" roughness={0.6} />
          </mesh>
          <mesh position={[4.0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 38]} />
            <meshStandardMaterial color="#DDD5C9" roughness={0.6} />
          </mesh>

          {/* Start Landmark Pavilion */}
          <group position={startLandmarkPos}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[3.8, 2.4, 2.2]} />
              <meshStandardMaterial color="#FAF5EE" roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.8, 32]} />
              <meshBasicMaterial color="#2F7D5A" transparent opacity={0.25} />
            </mesh>
            <Text
              position={[0, 2.7, 0]}
              fontSize={0.36}
              color="#2F7D5A"
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
              <meshBasicMaterial color="#C93B2F" wireframe transparent opacity={0.85} />
            </mesh>

            <UserCarModel />

            {/* Glowing Red Beacon Pin */}
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group position={[0, 2.4, 0]}>
                <mesh position={[0, 0.35, 0]}>
                  <sphereGeometry args={[0.35, 24, 24]} />
                  <meshStandardMaterial
                    color="#C93B2F"
                    emissive="#C93B2F"
                    emissiveIntensity={2.2}
                  />
                </mesh>
                <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.2, 0.5, 16]} />
                  <meshStandardMaterial
                    color="#C93B2F"
                    emissive="#C93B2F"
                    emissiveIntensity={2.2}
                  />
                </mesh>
              </group>
            </Float>
          </group>

          {/* Other Ambient Parked Cars */}
          <AmbientParkedCar position={[-4.0, 0, -6]} color="#70675F" />
          <AmbientParkedCar position={[-4.0, 0, -11]} color="#938980" />
          <AmbientParkedCar position={[4.0, 0, 2]} color="#70675F" />
          <AmbientParkedCar position={[4.0, 0, 8]} color="#938980" />
          <AmbientParkedCar position={[4.0, 0, -6]} color="#70675F" />

          {/* Concrete Pillars with Red Accent */}
          <group position={[-6.0, 1.8, -4]}>
            <mesh>
              <boxGeometry args={[0.8, 3.6, 0.8]} />
              <meshStandardMaterial color="#FAF5EE" />
            </mesh>
            <mesh position={[0, -1.45, 0]}>
              <boxGeometry args={[0.82, 0.3, 0.82]} />
              <meshStandardMaterial color="#C93B2F" />
            </mesh>
            <Text position={[0, 0.6, 0.42]} fontSize={0.22} color="#241F1B">
              P06 · ZONE A
            </Text>
          </group>

          <group position={[-6.0, 1.8, 4]}>
            <mesh>
              <boxGeometry args={[0.8, 3.6, 0.8]} />
              <meshStandardMaterial color="#FAF5EE" />
            </mesh>
            <mesh position={[0, -1.45, 0]}>
              <boxGeometry args={[0.82, 0.3, 0.82]} />
              <meshStandardMaterial color="#C93B2F" />
            </mesh>
            <Text position={[0, 0.6, 0.42]} fontSize={0.22} color="#241F1B">
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
