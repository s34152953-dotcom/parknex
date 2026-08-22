"use client";

import React from "react";

export default function EnvironmentLighting() {
  return (
    <>
      {/* Cool-neutral ambient underground illumination */}
      <ambientLight intensity={0.55} color="#D6CEBE" />

      {/* Subtle floor bounce light */}
      <directionalLight
        position={[0, -2, 0]}
        intensity={0.2}
        color="#8B8173"
      />

      {/* Primary down-lights along the driving aisle */}
      <directionalLight
        position={[0, 8, 10]}
        intensity={1.2}
        color="#FAF5EE"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Secondary rear fill light for depth */}
      <directionalLight
        position={[5, 6, -20]}
        intensity={0.6}
        color="#E3DDD3"
      />

      {/* Additional aisle accent lights mimicking overhead LED fixtures */}
      <pointLight position={[-4, 3.8, 8]} intensity={1.8} distance={14} color="#FFF8EE" decay={2} />
      <pointLight position={[4, 3.8, 0]} intensity={1.8} distance={14} color="#FFF8EE" decay={2} />
      <pointLight position={[-4, 3.8, -8]} intensity={1.8} distance={14} color="#FFF8EE" decay={2} />
      <pointLight position={[4, 3.8, -16]} intensity={1.8} distance={14} color="#FFF8EE" decay={2} />
      <pointLight position={[-4, 3.8, -24]} intensity={1.8} distance={14} color="#FFF8EE" decay={2} />
    </>
  );
}
