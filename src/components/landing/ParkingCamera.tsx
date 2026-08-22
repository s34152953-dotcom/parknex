"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function ParkingCamera() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalized screen coordinates [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useFrame((_, delta) => {
    // Increment virtual time (slow cinematic speed)
    timeRef.current += delta * 0.22;
    const t = timeRef.current;

    // Smooth dampening for mouse parallax (subtle, non-disorienting)
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

    // Camera travel loop along Z: cycles continuously between +14 and -20 (34m length)
    const cyclePeriod = 36; // seconds per cycle
    const progress = (t % cyclePeriod) / cyclePeriod; // [0, 1]

    // Forward translation from +16 to -22
    const currentZ = 16 - progress * 38;

    // Subtle natural walking drift (very slow sine wave)
    const swayX = Math.sin(t * 0.4) * 0.35;
    const swayY = 1.62 + Math.cos(t * 0.8) * 0.04; // Walking bob around 1.62m height

    // Micro mouse offset
    const parallaxX = mouseRef.current.x * 0.45;
    const parallaxY = mouseRef.current.y * 0.22;

    camera.position.x = swayX + parallaxX;
    camera.position.y = swayY + parallaxY;
    camera.position.z = currentZ;

    // Camera Look-At target ahead down the aisle
    // Towards the middle/end of the cycle, gently glance slightly towards right-hand parking stalls
    const glanceRightAngle = Math.sin(progress * Math.PI) * 0.6; // subtle glance
    const lookAtX = glanceRightAngle + mouseRef.current.x * 0.6;
    const lookAtY = 1.55 + mouseRef.current.y * 0.3;
    const lookAtZ = currentZ - 12; // look 12 meters ahead

    camera.lookAt(lookAtX, lookAtY, lookAtZ);
  });

  return null;
}
