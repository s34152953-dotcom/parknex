"use client";

import React from "react";

export default function EnvironmentLighting() {
  return (
    <>
      {/* Bright, clean ambient underground illumination */}
      <ambientLight intensity={0.9} color="#EDE4D8" />

      {/* Subtle floor bounce light */}
      <directionalLight
        position={[0, -2, 0]}
        intensity={0.3}
        color="#B0A696"
      />

      {/* Primary bright down-lights along the driving aisle */}
      <directionalLight
        position={[0, 8, 12]}
        intensity={1.8}
        color="#FFFDF9"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* Secondary rear fill light for depth */}
      <directionalLight
        position={[5, 6, -18]}
        intensity={0.9}
        color="#F5EFE6"
      />

      {/* Bright overhead LED tube point lights along the driveway aisle */}
      <pointLight position={[-3.6, 3.9, 14]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[3.6, 3.9, 14]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[-3.6, 3.9, 4]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[3.6, 3.9, 4]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[-3.6, 3.9, -6]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[3.6, 3.9, -6]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[-3.6, 3.9, -16]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[3.6, 3.9, -16]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[-3.6, 3.9, -26]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
      <pointLight position={[3.6, 3.9, -26]} intensity={3.5} distance={18} color="#FFFBF2" decay={1.8} />
    </>
  );
}
