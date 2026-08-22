"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

// ── Optimized Shared Geometries (Expanded for Ultra-Wide Full Bleed) ─────────
const G = {
  floor: new THREE.PlaneGeometry(160, 160),
  ceiling: new THREE.PlaneGeometry(160, 160),
  wallSide: new THREE.PlaneGeometry(160, 4.6),
  wallBack: new THREE.PlaneGeometry(160, 4.6),
  beam: new THREE.BoxGeometry(160, 0.5, 0.7),
  pillar: new THREE.BoxGeometry(0.85, 4.2, 0.85),
  pillarSkirt: new THREE.BoxGeometry(0.88, 0.4, 0.88),
  pillarSign: new THREE.PlaneGeometry(0.7, 0.38),
  fireExtinguisher: new THREE.CylinderGeometry(0.09, 0.09, 0.45, 16),
  fireCabinet: new THREE.BoxGeometry(0.35, 0.6, 0.18),
  pipeMain: new THREE.CylinderGeometry(0.045, 0.045, 150, 12),
  pipeConduit: new THREE.CylinderGeometry(0.025, 0.025, 150, 12),
  cableTray: new THREE.BoxGeometry(0.35, 0.06, 150),
  lightFixture: new THREE.BoxGeometry(0.18, 0.08, 2.8),
  lightDiffuser: new THREE.BoxGeometry(0.12, 0.02, 2.6),
  stallLine: new THREE.PlaneGeometry(0.1, 5.2),
  stallEndLine: new THREE.PlaneGeometry(2.5, 0.1),
  laneDivider: new THREE.PlaneGeometry(0.12, 1.8),
  arrowShaft: new THREE.PlaneGeometry(0.18, 1.2),
  arrowHead: new THREE.ConeGeometry(0.32, 0.5, 3),
  wheelStop: new THREE.BoxGeometry(1.8, 0.12, 0.16),
  // Vehicle Body Geometries
  carChassis: new THREE.BoxGeometry(1.9, 0.52, 4.3),
  carCabin: new THREE.BoxGeometry(1.68, 0.46, 2.5),
  carWindshieldFront: new THREE.PlaneGeometry(1.6, 0.46),
  carWindshieldRear: new THREE.PlaneGeometry(1.6, 0.44),
  carWheel: new THREE.CylinderGeometry(0.34, 0.34, 0.24, 18),
  carRim: new THREE.CylinderGeometry(0.22, 0.22, 0.25, 14),
  headlight: new THREE.BoxGeometry(0.38, 0.12, 0.04),
  taillight: new THREE.BoxGeometry(0.48, 0.1, 0.04),
  carShadow: new THREE.PlaneGeometry(2.2, 4.6),
};

// ── Realistic PBR Materials ──────────────────────────────────────────────────
const M = {
  floor: new THREE.MeshStandardMaterial({
    color: "#524E48",
    roughness: 0.38,
    metalness: 0.18,
  }),
  ceiling: new THREE.MeshStandardMaterial({
    color: "#3F3A34",
    roughness: 0.85,
    metalness: 0.05,
  }),
  wall: new THREE.MeshStandardMaterial({
    color: "#59544D",
    roughness: 0.75,
    metalness: 0.08,
  }),
  beam: new THREE.MeshStandardMaterial({
    color: "#423D37",
    roughness: 0.8,
  }),
  pillar: new THREE.MeshStandardMaterial({
    color: "#ECE6DC",
    roughness: 0.6,
    metalness: 0.08,
  }),
  pillarSkirt: new THREE.MeshStandardMaterial({
    color: "#D99B14",
    roughness: 0.45,
    metalness: 0.2,
  }),
  pillarSign: new THREE.MeshStandardMaterial({
    color: "#2C2621",
    roughness: 0.35,
  }),
  fireRed: new THREE.MeshStandardMaterial({
    color: "#C22E22",
    roughness: 0.35,
    metalness: 0.4,
  }),
  conduitMetal: new THREE.MeshStandardMaterial({
    color: "#9EA4AA",
    roughness: 0.3,
    metalness: 0.85,
  }),
  cableTray: new THREE.MeshStandardMaterial({
    color: "#7E848A",
    roughness: 0.45,
    metalness: 0.75,
  }),
  lightFixture: new THREE.MeshStandardMaterial({
    color: "#33302C",
    roughness: 0.6,
  }),
  lightGlow: new THREE.MeshStandardMaterial({
    color: "#FFFBF2",
    emissive: "#FFFBF2",
    emissiveIntensity: 1.8,
    roughness: 0.2,
  }),
  paintWhite: new THREE.MeshBasicMaterial({
    color: "#FAF7F2",
    transparent: true,
    opacity: 0.88,
  }),
  paintYellow: new THREE.MeshBasicMaterial({
    color: "#F0B429",
    transparent: true,
    opacity: 0.88,
  }),
  wheelStop: new THREE.MeshStandardMaterial({
    color: "#302B27",
    roughness: 0.8,
  }),
  carShadow: new THREE.MeshBasicMaterial({
    color: "#181512",
    transparent: true,
    opacity: 0.6,
  }),
  carGlass: new THREE.MeshStandardMaterial({
    color: "#1B2129",
    roughness: 0.08,
    metalness: 0.95,
  }),
  carTire: new THREE.MeshStandardMaterial({
    color: "#201E1B",
    roughness: 0.92,
  }),
  carRim: new THREE.MeshStandardMaterial({
    color: "#E2E7EC",
    metalness: 0.9,
    roughness: 0.2,
  }),
  headlightGlow: new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    emissive: "#FFFFFF",
    emissiveIntensity: 2.0,
  }),
  taillightGlow: new THREE.MeshStandardMaterial({
    color: "#E0382B",
    emissive: "#E0382B",
    emissiveIntensity: 1.5,
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
      <mesh geometry={G.carCabin} material={paintMat} position={[0, 0.94, -0.15]} castShadow />

      {/* Windshields & Windows */}
      <mesh
        geometry={G.carWindshieldFront}
        material={M.carGlass}
        position={[0, 0.94, 1.05]}
        rotation={[-0.45, 0, 0]}
      />
      <mesh
        geometry={G.carWindshieldRear}
        material={M.carGlass}
        position={[0, 0.94, -1.35]}
        rotation={[0.45, 0, 0]}
      />

      {/* Wheels */}
      {([
        [-0.94, 0.34, 1.25],
        [0.94, 0.34, 1.25],
        [-0.94, 0.34, -1.25],
        [0.94, 0.34, -1.25],
      ] as const).map(([wx, wy, wz], idx) => (
        <group key={idx} position={[wx, wy, wz]}>
          <mesh geometry={G.carWheel} material={M.carTire} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={G.carRim} material={M.carRim} rotation={[0, 0, Math.PI / 2]} />
        </group>
      ))}

      {/* Front Headlights */}
      <mesh geometry={G.headlight} material={M.headlightGlow} position={[-0.65, 0.52, 2.15]} />
      <mesh geometry={G.headlight} material={M.headlightGlow} position={[0.65, 0.52, 2.15]} />

      {/* Rear Taillights */}
      <mesh geometry={G.taillight} material={M.taillightGlow} position={[-0.65, 0.55, -2.15]} />
      <mesh geometry={G.taillight} material={M.taillightGlow} position={[0.65, 0.55, -2.15]} />
    </group>
  );
}

// ── Main Garage Environment ──────────────────────────────────────────────────
export default function GarageModel() {
  // Pillars spaced along Z
  const pillarZPositions = useMemo(() => [24, 16, 8, 0, -8, -16, -24, -32, -40, -48], []);
  // Ceiling Beams spaced along Z
  const beamZPositions = useMemo(() => [28, 20, 12, 4, -4, -12, -20, -28, -36, -44, -52], []);
  
  // Overhead Linear Light Positions (Central & Side Aisles)
  const lightPositions = useMemo(
    () => [
      [-2.4, 4.05, 20], [2.4, 4.05, 20],
      [-2.4, 4.05, 12], [2.4, 4.05, 12],
      [-2.4, 4.05, 4], [2.4, 4.05, 4],
      [-2.4, 4.05, -4], [2.4, 4.05, -4],
      [-2.4, 4.05, -12], [2.4, 4.05, -12],
      [-2.4, 4.05, -20], [2.4, 4.05, -20],
      [-2.4, 4.05, -28], [2.4, 4.05, -28],
      [-2.4, 4.05, -36], [2.4, 4.05, -36],
      [-2.4, 4.05, -44], [2.4, 4.05, -44],
      // Outer aisle lights for edge illumination
      [-10.5, 4.05, 12], [10.5, 4.05, 12],
      [-10.5, 4.05, -4], [10.5, 4.05, -4],
      [-10.5, 4.05, -20], [10.5, 4.05, -20],
      [-10.5, 4.05, -36], [10.5, 4.05, -36],
    ],
    []
  );

  // Parking Bays (X: -7.6 left, +7.6 right, plus outer bays)
  const parkingStalls = useMemo(() => {
    const stalls: { x: number; z: number; side: "left" | "right" }[] = [];
    for (let z = 22; z >= -50; z -= 3.2) {
      stalls.push({ x: -7.6, z, side: "left" });
      stalls.push({ x: 7.6, z, side: "right" });
      stalls.push({ x: -15.8, z, side: "left" });
      stalls.push({ x: 15.8, z, side: "right" });
    }
    return stalls;
  }, []);

  return (
    <group>
      {/* ── Floor (Wide 160x160m to prevent edge gaps on any screen) ── */}
      <mesh
        geometry={G.floor}
        material={M.floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -15]}
        receiveShadow
      />

      {/* ── Ceiling (Wide 160x160m) ── */}
      <mesh
        geometry={G.ceiling}
        material={M.ceiling}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 4.2, -15]}
      />

      {/* ── Perimeter Boundary Walls (Closes all open edges) ── */}
      {/* Left Wall */}
      <mesh
        geometry={G.wallSide}
        material={M.wall}
        position={[-35, 2.1, -15]}
        rotation={[0, Math.PI / 2, 0]}
      />
      {/* Right Wall */}
      <mesh
        geometry={G.wallSide}
        material={M.wall}
        position={[35, 2.1, -15]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      {/* Back Wall */}
      <mesh
        geometry={G.wallBack}
        material={M.wall}
        position={[0, 2.1, -65]}
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
        position={[-3.6, 3.75, -15]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={G.pipeMain}
        material={M.fireRed}
        position={[11.6, 3.75, -15]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Electrical Conduit */}
      <mesh
        geometry={G.pipeConduit}
        material={M.conduitMetal}
        position={[3.6, 3.8, -15]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={G.pipeConduit}
        material={M.conduitMetal}
        position={[-11.6, 3.8, -15]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Heavy Cable Tray */}
      <mesh
        geometry={G.cableTray}
        material={M.cableTray}
        position={[0, 3.85, -15]}
      />
      <mesh
        geometry={G.cableTray}
        material={M.cableTray}
        position={[15.2, 3.85, -15]}
      />

      {/* ── Overhead Fluorescent / LED Fixtures ── */}
      {lightPositions.map(([lx, ly, lz], idx) => (
        <group key={idx} position={[lx, ly, lz]}>
          <mesh geometry={G.lightFixture} material={M.lightFixture} />
          <mesh geometry={G.lightDiffuser} material={M.lightGlow} position={[0, -0.04, 0]} />
        </group>
      ))}

      {/* ── Concrete Pillars across Central and Outer Bays ── */}
      {pillarZPositions.map((pz, idx) => (
        <React.Fragment key={idx}>
          {/* Inner Left Pillar */}
          <group position={[-5.2, 2.1, pz]}>
            <mesh geometry={G.pillar} material={M.pillar} castShadow receiveShadow />
            <mesh geometry={G.pillarSkirt} material={M.pillarSkirt} position={[0, -1.9, 0]} />
            <mesh
              geometry={G.pillarSign}
              material={M.pillarSign}
              position={[0.44, 0.4, 0]}
              rotation={[0, Math.PI / 2, 0]}
            />
            {idx % 2 === 0 && (
              <mesh geometry={G.fireCabinet} material={M.fireRed} position={[0.48, -0.2, 0]} />
            )}
          </group>

          {/* Inner Right Pillar */}
          <group position={[5.2, 2.1, pz]}>
            <mesh geometry={G.pillar} material={M.pillar} castShadow receiveShadow />
            <mesh geometry={G.pillarSkirt} material={M.pillarSkirt} position={[0, -1.9, 0]} />
            <mesh
              geometry={G.pillarSign}
              material={M.pillarSign}
              position={[-0.44, 0.4, 0]}
              rotation={[0, -Math.PI / 2, 0]}
            />
            {idx % 2 === 1 && (
              <mesh geometry={G.fireExtinguisher} material={M.fireRed} position={[-0.48, -0.4, 0]} />
            )}
          </group>

          {/* Outer Left Pillar for ultra-wide coverage */}
          <group position={[-18.5, 2.1, pz]}>
            <mesh geometry={G.pillar} material={M.pillar} castShadow receiveShadow />
            <mesh geometry={G.pillarSkirt} material={M.pillarSkirt} position={[0, -1.9, 0]} />
          </group>

          {/* Outer Right Pillar for ultra-wide coverage */}
          <group position={[18.5, 2.1, pz]}>
            <mesh geometry={G.pillar} material={M.pillar} castShadow receiveShadow />
            <mesh geometry={G.pillarSkirt} material={M.pillarSkirt} position={[0, -1.9, 0]} />
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
      {[-44, -36, -28, -20, -12, -4, 4, 12, 20].map((lz, idx) => (
        <mesh
          key={idx}
          geometry={G.laneDivider}
          material={M.paintWhite}
          position={[0, 0.012, lz]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      ))}

      {/* Directional Floor Guidance Arrows */}
      {[-32, -16, 0, 16].map((az, idx) => (
        <group key={idx} position={[1.4, 0.014, az]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={G.arrowShaft} material={M.paintYellow} position={[0, -0.4, 0]} />
          <mesh geometry={G.arrowHead} material={M.paintYellow} position={[0, 0.4, 0]} />
        </group>
      ))}
      {[-24, -8, 8, 24].map((az, idx) => (
        <group key={idx} position={[-1.4, 0.014, az]} rotation={[-Math.PI / 2, 0, Math.PI]}>
          <mesh geometry={G.arrowShaft} material={M.paintYellow} position={[0, -0.4, 0]} />
          <mesh geometry={G.arrowHead} material={M.paintYellow} position={[0, 0.4, 0]} />
        </group>
      ))}

      {/* ── Realistic Parked Vehicles (Spacious & Believable) ── */}
      {/* Left Bay: Pearl White Tata Nexon EV styled SUV */}
      <RealisticParkedCar
        position={[-7.4, 0, 8.5]}
        rotation={[0, Math.PI / 2, 0]}
        paintColor="#FAF9F6"
        metallic={0.7}
        roughness={0.15}
      />

      {/* Left Bay: Metallic Charcoal Indian Sedan */}
      <RealisticParkedCar
        position={[-7.4, 0, -7.5]}
        rotation={[0, Math.PI / 2, 0]}
        paintColor="#3A3E45"
        metallic={0.88}
        roughness={0.18}
      />

      {/* Right Bay: Silver Metallic Compact Crossover */}
      <RealisticParkedCar
        position={[7.4, 0, 1.5]}
        rotation={[0, -Math.PI / 2, 0]}
        paintColor="#B8BDC4"
        metallic={0.9}
        roughness={0.14}
      />

      {/* Right Bay: Deep Crimson SUV */}
      <RealisticParkedCar
        position={[7.4, 0, -21.5]}
        rotation={[0, -Math.PI / 2, 0]}
        paintColor="#7A1C16"
        metallic={0.8}
        roughness={0.2}
      />

      {/* Outer Left Bay: Deep Blue Metallic Vehicle */}
      <RealisticParkedCar
        position={[-15.6, 0, -14.5]}
        rotation={[0, Math.PI / 2, 0]}
        paintColor="#1B2838"
        metallic={0.85}
        roughness={0.22}
      />

      {/* Outer Right Bay: Bronze Gold Crossover */}
      <RealisticParkedCar
        position={[15.6, 0, -6.5]}
        rotation={[0, -Math.PI / 2, 0]}
        paintColor="#8C6E48"
        metallic={0.82}
        roughness={0.2}
      />
    </group>
  );
}
