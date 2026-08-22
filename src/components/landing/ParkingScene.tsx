"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import EnvironmentLighting from "./EnvironmentLighting";
import GarageModel from "./GarageModel";
import ParkingCamera from "./ParkingCamera";

export default function ParkingScene({ onReady }: { onReady?: () => void }) {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDpr(Math.min(window.devicePixelRatio, 1.5));
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [0, 1.62, 16], fov: 48, near: 0.1, far: 65 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          if (onReady) onReady();
        }}
      >
        {/* Background Atmosphere & Atmospheric Underground Falloff Fog */}
        <color attach="background" args={["#24201D"]} />
        <fog attach="fog" args={["#24201D", 12, 54]} />

        {/* Lighting Setup */}
        <EnvironmentLighting />

        {/* 3D Underground Garage Architecture & Parked Cars */}
        <GarageModel />

        {/* Cinematic Stabilized Walking Camera Controller */}
        <ParkingCamera />
      </Canvas>
    </div>
  );
}
