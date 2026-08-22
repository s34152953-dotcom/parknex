"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

// ── Shared Shared Static Geometries to guarantee 60 FPS ──────────────────────
const G = {
  floor: new THREE.PlaneGeometry(36, 90),
  ceiling: new THREE.PlaneGeometry(36, 90),
  beam: new THREE.BoxGeometry(36, 0.5, 0.7),
  pillar: new THREE.BoxGeometry(0.85, 4.2, 0.85),
  pillarSkirt: new THREE.BoxGeometry(0.88, 0.4, 0.88),
  pillarSign: new THREE.PlaneGeometry(0.7, 0.4),
  fireExtinguisher: new THREE.CylinderGeometry(0.09, 0.09, 0.45, 16),
  fireCabinet: new THREE.BoxGeometry(0.35, 0.6, 0.18),
  pipeMain: new THREE.CylinderGeometry(0.045, 0.045, 88, 12),
  pipeConduit: new THREE.CylinderGeometry(0.025, 0.025, 88, 12),
  cableTray: new THREE.BoxGeometry(0.35, 0.06, 88),
  lightFixture: new THREE.BoxGeometry(0.18, 0.08, 2.8),
  lightDiffuser: new THREE.BoxGeometry(0.12, 0.02, 2.6),
  stallLine: new THREE.PlaneGeometry(0.1, 5.0),
  stallEndLine: new THREE.PlaneGeometry(2.5, 0.1),
  laneDivider: new THREE.PlaneGeometry(0.12, 1.8),
  arrowShaft: new THREE.PlaneGeometry(0.18, 1.2),
  arrowHead: new THREE.ConeGeometry(0.32, 0.5, 3),
  wheelStop: new THREE.BoxGeometry(1.8, 0.12, 0.16),
  // Vehicle Body Geometries
  carChassis: new THREE.BoxGeometry(1.9, 0.52, 4.2),
  carCabin: new THREE.BoxGeometry(1.68, 0.46, 2.4),
  carWindshieldFront: new THREE.PlaneGeometry(1.6, 0.44),
  carWindshieldRear: new THREE.PlaneGeometry(1.6, 0.42),
  carWheel: new THREE.CylinderGeometry(0.34, 0.34, 0.24, 18),
  carRim: new THREE.CylinderGeometry(0.22, 0.22, 0.25, 14),
  headlight: new THREE.BoxGeometry(0.38, 0.12, 0.04),
  taillight: new THREE.BoxGeometry(0.48, 0.1, 0.04),
  carShadow: new THREE.PlaneGeometry(2.2, 4.5),
};

// ── Realistic PBR Materials ──────────────────────────────────────────────────
const M = {
  floor: new THREE.MeshStandardMaterial({
    color: "#4A4641",
    roughness: 0.42,
    metalness: 0.15,
  }),
  ceiling: new THREE.MeshStandardMaterial({
    color: "#3D3934",
    roughness: 0.88,
    metalness: 0.05,
  }),
  beam: new THREE.MeshStandardMaterial({
    color: "#38342F",
    roughness: 0.85,
  }),
  pillar: new THREE.MeshStandardMaterial({
    color: "#E2DDD5",
    roughness: 0.65,
    metalness: 0.08,
  }),
  pillarSkirt: new THREE.MeshStandardMaterial({
    color: "#D4A017",
    roughness: 0.5,
    metalness: 0.2,
  }),
  pillarSign: new THREE.MeshStandardMaterial({
    color: "#241F1B",
    roughness: 0.4,
  }),
  fireRed: new THREE.MeshStandardMaterial({
    color: "#B3281E",
    roughness: 0.35,
    metalness: 0.4,
  }),
  conduitMetal: new THREE.MeshStandardMaterial({
    color: "#8F9499",
    roughness: 0.3,
    metalness: 0.85,
  }),
  cableTray: new THREE.MeshStandardMaterial({
    color: "#72777D",
    roughness: 0.45,
    metalness: 0.75,
  }),
  lightFixture: new THREE.MeshStandardMaterial({
    color: "#2C2A28",
    roughness: 0.6,
  }),
  lightGlow: new THREE.MeshStandardMaterial({
    color: "#FFFBF2",
    emissive: "#FFFBF2",
    emissiveIntensity: 1.6,
    roughness: 0.2,
  }),
  paintWhite: new THREE.MeshBasicMaterial({
    color: "#FAF7F2",
    transparent: true,
    opacity: 0.85,
  }),
  paintYellow: new THREE.MeshBasicMaterial({
    color: "#E5A922",
    transparent: true,
    opacity: 0.85,
  }),
  wheelStop: new THREE.MeshStandardMaterial({
    color: "#2F2B27",
    roughness: 0.8,
  }),
  carShadow: new THREE.MeshBasicMaterial({
    color: "#181512",
    transparent: true,
    opacity: 0.55,
  }),
  carGlass: new THREE.MeshStandardMaterial({
    color: "#181D24",
    roughness: 0.08,
    metalness: 0.95,
  }),
  carTire: new THREE.MeshStandardMaterial({
    color: "#1E1C1A",
    roughness: 0.92,
  }),
  carRim: new THREE.MeshStandardMaterial({
    color: "#DCE1E6",
    metalness: 0.9,
    roughness: 0.2,
  }),
  headlightGlow: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    emissive: "#FFFFFF",
    emissiveIntensity: 1.8,
  }),
  taillightGlow: new THREE.MeshStandardMaterial({
    color: "#D83A2D",
    emissive: "#D83A2D",
    emissiveIntensity: 1.4,
  }),
};

// ── Realistic Multi-Body Vehicle Component ───────────────────────────────────
function RealisticParkedCar({
  position,
  rotation = [0, 0, 0],
  paintColor = "#FFFFFF",
  metallic = 0.85,
  roughness = 0.18,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  paintColor?: string;
  metallic?: number;
  roughness?: number;
}) {
  const paintMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: paintColor,
        metalness: metallic,
        roughness: roughness,
      }),
    [paintColor, metallic, roughness]
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Contact Shadow */}
      <mesh
        geometry={G.carShadow}
        material={M.carShadow}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Main Body Chassis */}
      <mesh geometry={G.carChassis} material={paintMat} position={[0, 0.48, 0]} castShadow receiveShadow />

      {/* Cabin Roof / Greenhouse */}
      <mesh geometry={G.carCabin} material={paintMat} position={[0, 0.92, -0.2]} castShadow />

      {/* Windshields & Windows */}
      <mesh
        geometry={G.carWindshieldFront}
        material={M.carGlass}
        position={[0, 0.92, 0.95]}
        rotation={[-0.45, 0, 0]}
      />
      <mesh
        geometry={G.carWindshieldRear}
        material={M.carGlass}
        position={[0, 0.92, -1.35]}
        rotation={[0.45, 0, 0]}
      />

      {/* Wheels */}
      {([
        [-0.92, 0.34, 1.25],
        [0.92, 0.34, 1.25],
        [-0.92, 0.34, -1.25],
        [0.92, 0.34, -1.25],
      ] as const).map(([wx, wy, wz], idx) => (
        <group key={idx} position={[wx, wy, wz]}>
          <mesh geometry={G.carWheel} material={M.carTire} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={G.carRim} material={M.carRim} rotation={[0, 0, Math.PI / 2]} />
        </group>
      ))}

      {/* Front Headlights */}
      <mesh geometry={G.headlight} material={M.headlightGlow} position={[-0.65, 0.52, 2.1]} />
      <mesh geometry={G.headlight} material={M.headlightGlow} position={[0.65, 0.52, 2.1]} />

      {/* Rear Taillights */}
      <mesh geometry={G.taillight} material={M.taillightGlow} position={[-0.65, 0.55, -2.1]} />
      <mesh geometry={G.taillight} material={M.taillightGlow} position={[0.65, 0.55, -2.1]} />
    </group>
  );
}

// ── Main Garage Environment ──────────────────────────────────────────────────
export default function GarageModel() {
  // Pillars spaced along Z
  const pillarZPositions = useMemo(() => [16, 8, 0, -8, -16, -24, -32, -40], []);
  // Ceiling Beams spaced along Z
  const beamZPositions = useMemo(() => [20, 12, 4, -4, -12, -20, -28, -36], []);
  // Overhead Linear Light Positions
  const lightPositions = useMemo(
    () => [
      [-2.4, 4.05, 14],
      [2.4, 4.05, 14],
      [-2.4, 4.05, 6],
      [2.4, 4.05, 6],
      [-2.4, 4.05, -2],
      [2.4, 4.05, -2],
      [-2.4, 4.05, -10],
      [2.4, 4.05, -10],
      [-2.4, 4.05, -18],
      [2.4, 4.05, -18],
      [-2.4, 4.05, -26],
      [2.4, 4.05, -26],
      [-2.4, 4.05, -34],
      [2.4, 4.05, -34],
    ],
    []
  );

  // Parking Bays (X: -7.5 left, +7.5 right)
  const parkingStalls = useMemo(() => {
    const stalls: { x: number; z: number; side: "left" | "right" }[] = [];
    for (let z = 18; z >= -42; z -= 3.2) {
      stalls.push({ x: -7.6, z, side: "left" });
      stalls.push({ x: 7.6, z, side: "right" });
    }
    return stalls;
  }, []);

  return (
    <group>
      {/* ── Floor ── */}
      <mesh
        geometry={G.floor}
        material={M.floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -12]}
        receiveShadow
      />

      {/* ── Ceiling ── */}
      <mesh
        geometry={G.ceiling}
        material={M.ceiling}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 4.2, -12]}
      />

      {/* ── Structural Cross-Beams ── */}
      {beamZPositions.map((bz, idx) => (
        <mesh
          key={idx}
          geometry={G.beam}
          material={M.beam}
          position={[0, 3.95, bz]}
          receiveShadow
        />
      ))}

      {/* ── Overhead Utilities (Pipes, Conduits, Trays) ── */}
      {/* Red Fire Safety Sprinkler Pipe */}
      <mesh
        geometry={G.pipeMain}
        material={M.fireRed}
        position={[-3.6, 3.75, -12]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Electrical Conduit */}
      <mesh
        geometry={G.pipeConduit}
        material={M.conduitMetal}
        position={[3.6, 3.8, -12]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Heavy Cable Tray */}
      <mesh
        geometry={G.cableTray}
        material={M.cableTray}
        position={[0, 3.85, -12]}
      />

      {/* ── Overhead Fluorescent / LED Fixtures ── */}
      {lightPositions.map(([lx, ly, lz], idx) => (
        <group key={idx} position={[lx, ly, lz]}>
          <mesh geometry={G.lightFixture} material={M.lightFixture} />
          <mesh geometry={G.lightDiffuser} material={M.lightGlow} position={[0, -0.04, 0]} />
        </group>
      ))}

      {/* ── Concrete Pillars with Hazard Skirts & Zone Signs ── */}
      {pillarZPositions.map((pz, idx) => (
        <React.Fragment key={idx}>
          {/* Left Pillar */}
          <group position={[-5.2, 2.1, pz]}>
            <mesh geometry={G.pillar} material={M.pillar} castShadow receiveShadow />
            <mesh geometry={G.pillarSkirt} material={M.pillarSkirt} position={[0, -1.9, 0]} />
            <mesh
              geometry={G.pillarSign}
              material={M.pillarSign}
              position={[0.44, 0.4, 0]}
              rotation={[0, Math.PI / 2, 0]}
            />
            {/* Fire Cabinet on alternating left pillars */}
            {idx % 2 === 0 && (
              <mesh geometry={G.fireCabinet} material={M.fireRed} position={[0.48, -0.2, 0]} />
            )}
          </group>

          {/* Right Pillar */}
          <group position={[5.2, 2.1, pz]}>
            <mesh geometry={G.pillar} material={M.pillar} castShadow receiveShadow />
            <mesh geometry={G.pillarSkirt} material={M.pillarSkirt} position={[0, -1.9, 0]} />
            <mesh
              geometry={G.pillarSign}
              material={M.pillarSign}
              position={[-0.44, 0.4, 0]}
              rotation={[0, -Math.PI / 2, 0]}
            />
            {/* Fire Extinguisher on alternating right pillars */}
            {idx % 2 === 1 && (
              <mesh geometry={G.fireExtinguisher} material={M.fireRed} position={[-0.48, -0.4, 0]} />
            )}
          </group>
        </React.Fragment>
      ))}

      {/* ── Parking Bay Markings & Wheel Stops ── */}
      {parkingStalls.map((stall, idx) => {
        const isLeft = stall.side === "left";
        const lineX = isLeft ? stall.x + 1.25 : stall.x - 1.25;
        const wheelStopX = isLeft ? stall.x - 1.8 : stall.x + 1.8;

        return (
          <group key={idx}>
            {/* Divider Stall Line */}
            <mesh
              geometry={G.stallLine}
              material={M.paintWhite}
              position={[stall.x, 0.01, stall.z]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            />
            {/* End Boundary Line */}
            <mesh
              geometry={G.stallEndLine}
              material={M.paintWhite}
              position={[lineX, 0.01, stall.z]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            {/* Wheel Stop Block */}
            <mesh
              geometry={G.wheelStop}
              material={M.wheelStop}
              position={[wheelStopX, 0.06, stall.z]}
              rotation={[0, Math.PI / 2, 0]}
            />
          </group>
        );
      })}

      {/* ── Central Lane Markings & Directional Arrows ── */}
      {[-30, -22, -14, -6, 2, 10, 18].map((lz, idx) => (
        <mesh
          key={idx}
          geometry={G.laneDivider}
          material={M.paintWhite}
          position={[0, 0.012, lz]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      ))}

      {/* Directional Floor Guidance Arrows */}
      {[-24, -8, 8].map((az, idx) => (
        <group key={idx} position={[1.4, 0.014, az]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={G.arrowShaft} material={M.paintYellow} position={[0, -0.4, 0]} />
          <mesh geometry={G.arrowHead} material={M.paintYellow} position={[0, 0.4, 0]} />
        </group>
      ))}
      {[-16, 0, 16].map((az, idx) => (
        <group key={idx} position={[-1.4, 0.014, az]} rotation={[-Math.PI / 2, 0, Math.PI]}>
          <mesh geometry={G.arrowShaft} material={M.paintYellow} position={[0, -0.4, 0]} />
          <mesh geometry={G.arrowHead} material={M.paintYellow} position={[0, 0.4, 0]} />
        </group>
      ))}

      {/* ── Realistic Parked Vehicles (Spacious & Distant) ── */}
      {/* Left Bay 1: Pearl White Tata Nexon EV styled SUV */}
      <RealisticParkedCar
        position={[-7.4, 0, 8.5]}
        rotation={[0, Math.PI / 2, 0]}
        paintColor="#FAF9F6"
        metallic={0.7}
        roughness={0.15}
      />

      {/* Left Bay 2: Metallic Charcoal Sedan */}
      <RealisticParkedCar
        position={[-7.4, 0, -7.5]}
        rotation={[0, Math.PI / 2, 0]}
        paintColor="#3A3E45"
        metallic={0.88}
        roughness={0.18}
      />

      {/* Right Bay 1: Silver Metallic Compact Crossover */}
      <RealisticParkedCar
        position={[7.4, 0, 1.5]}
        rotation={[0, -Math.PI / 2, 0]}
        paintColor="#B8BDC4"
        metallic={0.9}
        roughness={0.14}
      />

      {/* Right Bay 2: Deep Crimson Indian SUV */}
      <RealisticParkedCar
        position={[7.4, 0, -21.5]}
        rotation={[0, -Math.PI / 2, 0]}
        paintColor="#7A1C16"
        metallic={0.8}
        roughness={0.2}
      />

      {/* Left Bay 3: Distant Midnight Blue Sedan */}
      <RealisticParkedCar
        position={[-7.4, 0, -30.5]}
        rotation={[0, Math.PI / 2, 0]}
        paintColor="#1B2838"
        metallic={0.85}
        roughness={0.22}
      />
    </group>
  );
}
