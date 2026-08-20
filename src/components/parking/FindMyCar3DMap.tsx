"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, Line } from "@react-three/drei";
import * as THREE from "three";

// ── Realistic User Luxury Vehicle for Find My Car ────────────────────────────
function UserCarModel() {
  return (
    <group position={[0, 0.22, 0]}>
      {/* Ground Contact Shadow */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 3.8]} />
        <meshBasicMaterial color="#3D3024" transparent opacity={0.4} />
      </mesh>

      {/* Burnt Orange Floor Underglow */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 4.2]} />
        <meshBasicMaterial color="#D84A2B" transparent opacity={0.25} />
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
        <meshStandardMaterial color="#1C2128" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Front Xenon Headlights */}
      {[-0.58, 0.58].map((hx, i) => (
        <mesh key={i} position={[hx, 0.18, 1.66]}>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.4} />
        </mesh>
      ))}

      {/* Rear Red/Orange Lightbar */}
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
function AmbientParkedCar({ position, color = "#334155" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.6, 0.35, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, -0.1]}>
        <boxGeometry args={[1.35, 0.3, 1.7]} />
        <meshStandardMaterial color="#1C2128" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

// ── Burnt Orange Navigation Route Polyline ──────────────────────────────────
function NavigationPath({ points, isNavigating }: { points: [number, number, number][]; isNavigating: boolean }) {
  const linePoints = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);

  return (
    <group>
      {/* Outer Glow Line */}
      <Line
        points={linePoints}
        color="#BA3C20"
        lineWidth={8}
        dashed={false}
      />
      {/* Inner Crisp Burnt Orange Core */}
      <Line
        points={linePoints}
        color="#D84A2B"
        lineWidth={4}
        dashed={false}
      />

      {/* Waypoint turn nodes with pulsing rings */}
      {points.map((pt, i) => (
        <group key={i} position={pt}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.35, 24]} />
            <meshBasicMaterial color="#D84A2B" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#D84A2B" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 3D Navigation Scene ──────────────────────────────────────────────────────
export default function FindMyCar3DMap({
  isNavigating = false,
}: {
  isNavigating?: boolean;
}) {
  // Navigation Route from Mall Entrance Lobby [0, 0.1, 15] to User Car [-4.0, 0.1, 0]
  const routePoints: [number, number, number][] = useMemo(
    () => [
      [0, 0.12, 15],  // Mall Elevator & Glass Lobby
      [0, 0.12, 7],   // Down Central Main Driving Corridor
      [-4.0, 0.12, 7], // Turn Left into Aisle A
      [-4.0, 0.12, 0], // Reached Slot A-18
    ],
    []
  );

  return (
    <div className="relative w-full h-full bg-[#F8F4ED] overflow-hidden select-none">
      <Canvas
        camera={{ position: [11, 15, 17], fov: 34 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#F8F4ED"]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.9} color="#FFF8EF" />
        <directionalLight position={[15, 25, 15]} intensity={1.3} color="#FFF7ED" castShadow />
        <pointLight position={[-4.0, 6, 0]} intensity={1.5} color="#D84A2B" distance={20} />
        <pointLight position={[0, 6, 15]} intensity={1.5} color="#10B981" distance={18} />

        <Suspense fallback={null}>
          {/* Main Floor Slab */}
          <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[42, 40]} />
            <meshStandardMaterial color="#ECE5DA" roughness={0.7} />
          </mesh>

          {/* Central Main Lane */}
          <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.5, 38]} />
            <meshStandardMaterial color="#E4DDD2" roughness={0.6} />
          </mesh>

          {/* Left Aisle Track */}
          <mesh position={[-4.0, -0.04, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.5, 12]} />
            <meshStandardMaterial color="#E4DDD2" roughness={0.6} />
          </mesh>

          {/* Mall Entrance Elevator / Lobby Pavilion */}
          <group position={[0, 0, 15]}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[4.2, 2.4, 2.5]} />
              <meshStandardMaterial color="#FAF5EE" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.8, 32]} />
              <meshBasicMaterial color="#10B981" transparent opacity={0.3} />
            </mesh>
            <Text
              position={[0, 2.7, 0]}
              fontSize={0.42}
              color="#10B981"
              anchorX="center"
              anchorY="bottom"
              letterSpacing={0.08}
            >
              MALL ENTRANCE LOBBY
            </Text>
          </group>

          {/* Glowing Animated Navigation Polyline */}
          <NavigationPath points={routePoints} isNavigating={isNavigating} />

          {/* Destination Slot A-18 & User Vehicle */}
          <group position={[-4.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            {/* Slot Ground Marking */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.2, 4.2]} />
              <meshBasicMaterial color="#D84A2B" wireframe transparent opacity={0.85} />
            </mesh>

            <UserCarModel />

            {/* High-Vis Glowing Orange Beacon Pin */}
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group position={[0, 2.4, 0]}>
                <mesh position={[0, 0.35, 0]}>
                  <sphereGeometry args={[0.35, 24, 24]} />
                  <meshStandardMaterial
                    color="#D84A2B"
                    emissive="#D84A2B"
                    emissiveIntensity={2.0}
                  />
                </mesh>
                <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.2, 0.5, 16]} />
                  <meshStandardMaterial
                    color="#D84A2B"
                    emissive="#D84A2B"
                    emissiveIntensity={2.0}
                  />
                </mesh>
              </group>
            </Float>
          </group>

          {/* Other Ambient Parked Cars in the Garage */}
          <AmbientParkedCar position={[-4.0, 0, -5]} color="#2A324B" />
          <AmbientParkedCar position={[-4.0, 0, -10]} color="#475569" />
          <AmbientParkedCar position={[4.0, 0, 0]} color="#1E293B" />
          <AmbientParkedCar position={[4.0, 0, 5]} color="#52525B" />
          <AmbientParkedCar position={[4.0, 0, -5]} color="#334155" />

          {/* Cream Concrete Pillars with Burnt Orange Accent */}
          <group position={[-6.0, 1.8, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 3.6, 0.8]} />
              <meshStandardMaterial color="#FAF5EE" />
            </mesh>
            <mesh position={[0, -1.45, 0]}>
              <boxGeometry args={[0.82, 0.3, 0.82]} />
              <meshStandardMaterial color="#D84A2B" />
            </mesh>
            <Text position={[0, 0.6, 0.42]} fontSize={0.22} color="#1C1917">
              P18 · ZONE A
            </Text>
          </group>

          <group position={[6.0, 1.8, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 3.6, 0.8]} />
              <meshStandardMaterial color="#FAF5EE" />
            </mesh>
            <mesh position={[0, -1.45, 0]}>
              <boxGeometry args={[0.82, 0.3, 0.82]} />
              <meshStandardMaterial color="#D84A2B" />
            </mesh>
            <Text position={[0, 0.6, -0.42]} rotation={[0, Math.PI, 0]} fontSize={0.22} color="#1C1917">
              P21 · ZONE A
            </Text>
          </group>

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={8}
            maxDistance={40}
            target={[-1.0, 0, 5.0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
