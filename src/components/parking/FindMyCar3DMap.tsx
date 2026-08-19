"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, Line } from "@react-three/drei";
import * as THREE from "three";

// ── Low Poly Car for Find My Car ─────────────────────────────────────────────
function UserCarModel() {
  return (
    <group position={[0, 0.22, 0]}>
      {/* Car Body */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.6, 0.32, 3.2]} />
        <meshStandardMaterial
          color="#0B2A4A"
          roughness={0.2}
          metalness={0.8}
          emissive="#06B6D4"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Cabin Glass */}
      <mesh position={[0, 0.38, -0.1]}>
        <boxGeometry args={[1.35, 0.28, 1.8]} />
        <meshStandardMaterial color="#0B0F17" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Glowing cyan outline around car */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 4.0]} />
        <meshBasicMaterial color="#06B6D4" wireframe transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ── Glowing Animated 3D Navigation Path ─────────────────────────────────────
function NavigationPath({ points }: { points: [number, number, number][] }) {
  const linePoints = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);

  return (
    <group>
      {/* Outer Blue Glow Line */}
      <Line
        points={linePoints}
        color="#146BFF"
        lineWidth={6}
        dashed={false}
      />
      {/* Inner Bright Cyan Line */}
      <Line
        points={linePoints}
        color="#38BDF8"
        lineWidth={3}
        dashed={false}
      />

      {/* Waypoint markers */}
      {points.map((pt, i) => (
        <mesh key={i} position={pt}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#146BFF"
            emissiveIntensity={1.5}
          />
        </mesh>
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
  // Navigation Route from Mall Entrance [0, 0.1, 14] to User Car [-3.6, 0.1, 0]
  const routePoints: [number, number, number][] = useMemo(
    () => [
      [0, 0.12, 14], // Mall Entrance
      [0, 0.12, 6],  // Walk along main corridor
      [-3.6, 0.12, 6], // Turn left into aisle A
      [-3.6, 0.12, 0], // Reached Slot A-18
    ],
    []
  );

  return (
    <div className="relative w-full h-full bg-[#040609] overflow-hidden select-none">
      <Canvas
        camera={{ position: [16, 20, 18], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <color attach="background" args={["#040609"]} />

        {/* Cinematic Isometric Lights */}
        <ambientLight intensity={0.6} color="#94A3B8" />
        <directionalLight position={[12, 22, 12]} intensity={1.4} color="#FFFFFF" castShadow />
        <pointLight position={[-3.6, 5, 0]} intensity={1.5} color="#06B6D4" distance={15} />

        <Suspense fallback={null}>
          {/* Architectural Parking Floor */}
          <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[36, 36]} />
            <meshStandardMaterial color="#080B10" roughness={0.8} />
          </mesh>

          {/* Central Corridor */}
          <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 32]} />
            <meshStandardMaterial color="#05070A" roughness={0.6} />
          </mesh>

          {/* Mall Entrance Marker */}
          <group position={[0, 0.05, 14]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.2, 32]} />
              <meshBasicMaterial color="#10B981" transparent opacity={0.3} />
            </mesh>
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.45}
              color="#10B981"
              anchorX="center"
              anchorY="bottom"
            >
              Mall Entrance
            </Text>
          </group>

          {/* Glowing Animated Navigation Line */}
          <NavigationPath points={routePoints} />

          {/* User's Car at Destination */}
          <group position={[-3.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <UserCarModel />

            {/* Glowing Cyan Location Pin above vehicle */}
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group position={[0, 2.2, 0]}>
                <mesh position={[0, 0.3, 0]}>
                  <sphereGeometry args={[0.3, 24, 24]} />
                  <meshStandardMaterial
                    color="#06B6D4"
                    emissive="#06B6D4"
                    emissiveIntensity={1.5}
                  />
                </mesh>
                <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.18, 0.45, 16]} />
                  <meshStandardMaterial
                    color="#06B6D4"
                    emissive="#06B6D4"
                    emissiveIntensity={1.5}
                  />
                </mesh>
              </group>
            </Float>
          </group>

          {/* Background Ambient Parking Columns */}
          <mesh position={[-5.5, 1.6, 6]}>
            <boxGeometry args={[0.7, 3.2, 0.7]} />
            <meshStandardMaterial color="#131720" />
          </mesh>
          <mesh position={[-5.5, 1.6, -6]}>
            <boxGeometry args={[0.7, 3.2, 0.7]} />
            <meshStandardMaterial color="#131720" />
          </mesh>
          <mesh position={[5.5, 1.6, 6]}>
            <boxGeometry args={[0.7, 3.2, 0.7]} />
            <meshStandardMaterial color="#131720" />
          </mesh>

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 - 0.15}
            minDistance={8}
            maxDistance={35}
            target={[-1.5, 0, 4]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
