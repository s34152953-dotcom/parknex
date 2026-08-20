"use client";

import { useEffect, useRef } from "react";

export default function CinematicGarageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();

    let time = 0;

    const render = () => {
      time += 0.012;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const w = width;
      const h = height;

      // ── 1. Warm Ivory Base & Ambient Atmospheric Lighting ────────
      ctx.fillStyle = "#FBF8F3";
      ctx.fillRect(0, 0, w, h);

      // Parallax offsets
      const px = mouseX * 16;
      const py = mouseY * 8;

      // Perspective vanishing point towards mall lobby
      const vpX = w * 0.74 + px * 0.4;
      const vpY = h * 0.38 + py * 0.4;
      const horizonY = h * 0.46 + py * 0.8;

      // Ambient Warm Radiance
      const bgGlow = ctx.createRadialGradient(vpX, vpY, 20, vpX, vpY, Math.max(w, h) * 0.85);
      bgGlow.addColorStop(0, "rgba(255, 248, 238, 0.95)");
      bgGlow.addColorStop(0.35, "rgba(248, 242, 232, 0.9)");
      bgGlow.addColorStop(0.7, "rgba(243, 235, 222, 0.85)");
      bgGlow.addColorStop(1, "#FBF8F3");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // ── 2. Architectural Ceiling with Soft Warm Beams ────────────
      ctx.save();
      const ceilingGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      ceilingGrad.addColorStop(0, "rgba(240, 232, 220, 0.9)");
      ceilingGrad.addColorStop(0.6, "rgba(246, 239, 230, 0.85)");
      ceilingGrad.addColorStop(1, "rgba(251, 248, 243, 0.95)");
      ctx.fillStyle = ceilingGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Overhead Architectural Beams in perspective
      const ceilingBeams = [
        { x: -w * 0.1, w: 20 },
        { x: w * 0.1, w: 18 },
        { x: w * 0.3, w: 16 },
        { x: w * 0.5, w: 14 },
      ];
      ctx.strokeStyle = "rgba(180, 160, 140, 0.12)";
      ctx.lineWidth = 2;
      for (const beam of ceilingBeams) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + beam.x + px * 1.2, 0);
        ctx.lineTo(vpX + beam.x * 0.15, horizonY * 0.7);
        ctx.stroke();
      }
      ctx.restore();

      // ── 3. Overhead Warm-White High-Bay Linear Lights ────────────
      const lightLanes = [
        { xOffset: -w * 0.15, len: 0.88, bright: 0.75 },
        { xOffset: w * 0.06, len: 0.8, bright: 1.0 },
        { xOffset: w * 0.28, len: 0.72, bright: 0.9 },
        { xOffset: w * 0.50, len: 0.6, bright: 0.75 },
      ];

      ctx.save();
      for (const lane of lightLanes) {
        const startX = w * 0.5 + lane.xOffset + px * 1.5;
        const startY = 0;
        const endX = vpX + lane.xOffset * 0.18;
        const endY = horizonY * 0.72;

        // Warm Golden-White Bloom
        const glowGrad = ctx.createLinearGradient(startX, startY, endX, endY);
        glowGrad.addColorStop(0, `rgba(255, 235, 200, ${0.45 * lane.bright})`);
        glowGrad.addColorStop(0.4, `rgba(255, 245, 225, ${0.25 * lane.bright})`);
        glowGrad.addColorStop(0.85, `rgba(255, 250, 240, ${0.08 * lane.bright})`);
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = 18;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Intense Warm White Core
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.98 * lane.bright})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();

      // ── 4. Luxury Mall Entrance Pavilion (Warm Golden Glow) ───────
      const entX = w * 0.80 + px * 0.25;
      const entY = horizonY - h * 0.22;
      const entW = w * 0.18;
      const entH = h * 0.26;

      // Volumetric Warm Amber Ambient Glow
      const warmAmbient = ctx.createRadialGradient(
        entX + entW * 0.5,
        entY + entH * 0.45,
        15,
        entX + entW * 0.5,
        entY + entH * 0.45,
        entW * 2.2
      );
      warmAmbient.addColorStop(0, "rgba(255, 215, 150, 0.35)");
      warmAmbient.addColorStop(0.4, "rgba(245, 185, 110, 0.16)");
      warmAmbient.addColorStop(0.8, "rgba(216, 74, 43, 0.04)");
      warmAmbient.addColorStop(1, "rgba(251, 248, 243, 0)");
      ctx.fillStyle = warmAmbient;
      ctx.fillRect(entX - entW * 1.2, entY - entH * 0.8, entW * 3.4, entH * 2.6);

      // Entrance Glass Atrium Structure
      ctx.fillStyle = "rgba(245, 238, 228, 0.85)";
      ctx.fillRect(entX, entY, entW, entH);

      // Interior Layered Warm Architecture behind glass
      const interiorGrad = ctx.createLinearGradient(entX, entY, entX, entY + entH);
      interiorGrad.addColorStop(0, "rgba(255, 235, 180, 0.4)");
      interiorGrad.addColorStop(0.6, "rgba(255, 210, 140, 0.25)");
      interiorGrad.addColorStop(1, "rgba(240, 180, 100, 0.1)");
      ctx.fillStyle = interiorGrad;
      ctx.fillRect(entX, entY, entW, entH);

      // Glass Vertical Mullions
      ctx.strokeStyle = "rgba(180, 160, 140, 0.25)";
      ctx.lineWidth = 1.5;
      const doorPanels = 4;
      for (let i = 0; i <= doorPanels; i++) {
        const dx = entX + (entW / doorPanels) * i;
        ctx.beginPath();
        ctx.moveTo(dx, entY);
        ctx.lineTo(dx, entY + entH);
        ctx.stroke();
      }

      // Horizontal Glass Spandrel Beam
      ctx.fillStyle = "rgba(230, 220, 205, 0.9)";
      ctx.fillRect(entX, entY + entH * 0.38, entW, 8);
      ctx.strokeStyle = "rgba(216, 74, 43, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(entX, entY + entH * 0.38, entW, 8);

      // "MALL ENTRANCE ↗" Sign Box
      const signW = entW * 0.86;
      const signH = 22;
      const signX = entX + (entW - signW) / 2;
      const signY = entY - 32;

      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(signX, signY, signW, signH);
      ctx.strokeStyle = "rgba(216, 74, 43, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(signX, signY, signW, signH);

      ctx.fillStyle = "#D84A2B";
      ctx.font = "bold 10px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MALL ENTRANCE  ↗", signX + signW / 2, signY + signH / 2);
      ctx.restore();

      // Pedestrians entering lobby
      ctx.fillStyle = "rgba(80, 65, 55, 0.75)";
      const people = [
        { x: entX + entW * 0.3, y: entY + entH - 30, h: 28, w: 7 },
        { x: entX + entW * 0.46, y: entY + entH - 32, h: 30, w: 8 },
        { x: entX + entW * 0.68, y: entY + entH - 26, h: 24, w: 6 },
      ];
      for (const p of people) {
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(p.x, p.y + 7, p.w, p.h - 7);
      }

      // ── 5. Cream-White Concrete Pillars with Burnt Orange Accents ──
      // Positioned cleanly on the right half so typography on the left remains uncluttered
      const pillars = [
        { x: w * 0.54 + px * 0.45, w: 34, topY: h * 0.20, botY: horizonY + h * 0.32, label: "B2", zone: "ZONE A · P19" },
        { x: w * 0.96 + px * 0.15, w: 48, topY: h * 0.10, botY: h * 0.95, label: "B2", zone: "ZONE B · P01" },
      ];

      for (const col of pillars) {
        const colGrad = ctx.createLinearGradient(col.x, 0, col.x + col.w, 0);
        colGrad.addColorStop(0, "#F2EBE0");
        colGrad.addColorStop(0.3, "#FAF6EE");
        colGrad.addColorStop(0.7, "#EAE2D4");
        colGrad.addColorStop(1, "#DFD6C6");

        ctx.fillStyle = colGrad;
        ctx.fillRect(col.x, col.topY, col.w, col.botY - col.topY);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(col.x, col.topY);
        ctx.lineTo(col.x, col.botY);
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "#1C1917";
        ctx.font = "bold 13px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(col.label, col.x + col.w / 2, col.topY + 34);

        ctx.fillStyle = "#78716C";
        ctx.font = "bold 8px Sora, sans-serif";
        ctx.fillText(col.zone, col.x + col.w / 2, col.topY + 50);

        ctx.fillStyle = "#D84A2B";
        ctx.fillRect(col.x + 2, col.topY + 65, 3.5, 30);
        ctx.restore();
      }

      // ── 6. Polished Concrete Garage Floor with Warm Reflections ───
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, "#EDE5DA");
      floorGrad.addColorStop(0.3, "#E8DFD3");
      floorGrad.addColorStop(0.7, "#E2D7C8");
      floorGrad.addColorStop(1, "#DDD1C1");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Floor Wet Warm Specular Light Streaks
      ctx.save();
      for (const lane of lightLanes) {
        const fx = vpX + lane.xOffset * 0.35;
        const fy = horizonY;
        const endFx = w * 0.5 + lane.xOffset * 1.9 + px * 1.1;
        const endFy = h;

        const refGrad = ctx.createLinearGradient(fx, fy, endFx, endFy);
        refGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        refGrad.addColorStop(0.3, `rgba(255, 245, 230, ${0.18 * lane.bright})`);
        refGrad.addColorStop(0.7, `rgba(255, 240, 220, ${0.25 * lane.bright})`);
        refGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = refGrad;
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(endFx, endFy);
        ctx.stroke();
      }

      // Warm Mall Entrance Floor Specular Reflection
      const mallFloorRef = ctx.createRadialGradient(
        entX + entW * 0.5,
        horizonY + 30,
        10,
        entX + entW * 0.5,
        horizonY + 60,
        entW * 1.4
      );
      mallFloorRef.addColorStop(0, "rgba(255, 215, 140, 0.25)");
      mallFloorRef.addColorStop(0.5, "rgba(235, 160, 80, 0.1)");
      mallFloorRef.addColorStop(1, "rgba(251, 248, 243, 0)");
      ctx.fillStyle = mallFloorRef;
      ctx.fillRect(entX - entW * 0.5, horizonY, entW * 2, h * 0.35);
      ctx.restore();

      // Sharp Perspective Lane Markings (Clean White Lines)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";

      const laneDividers = [
        { x1: w * 0.44, y1: horizonY + 15, x2: w * 0.24, y2: h },
        { x1: w * 0.58, y1: horizonY + 15, x2: w * 0.50, y2: h },
        { x1: w * 0.76, y1: horizonY + 15, x2: w * 0.84, y2: h },
      ];
      for (const line of laneDividers) {
        ctx.beginPath();
        ctx.moveTo(line.x1 + px * 0.4, line.y1);
        ctx.lineTo(line.x2 + px * 0.9, line.y2);
        ctx.stroke();
      }

      // Parking Slot Box Dividers
      const bayYs = [horizonY + h * 0.10, horizonY + h * 0.24, horizonY + h * 0.42];
      for (const by of bayYs) {
        ctx.beginPath();
        ctx.moveTo(w * 0.50 + px * 0.5, by);
        ctx.lineTo(w * 0.78 + px * 0.7, by);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();

      // ── 7. Luxury Vehicle (Graphite / Deep Obsidian in Foreground) ──
      const carCenterX = w * 0.70 + px * 0.85;
      const carCenterY = horizonY + h * 0.20 + py * 0.25;
      const carScale = Math.min(w / 1360, 1.08) * 1.05;

      ctx.save();
      ctx.translate(carCenterX, carCenterY);
      ctx.scale(carScale, carScale);

      // Layered Car Ambient Occlusion Ground Contact Shadow
      const shadowGrad = ctx.createRadialGradient(0, 80, 15, 0, 80, 220);
      shadowGrad.addColorStop(0, "rgba(40, 30, 20, 0.65)");
      shadowGrad.addColorStop(0.4, "rgba(60, 45, 30, 0.35)");
      shadowGrad.addColorStop(0.8, "rgba(80, 60, 40, 0.1)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 82, 210, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Taillight Floor Warm Glow
      const tailBounce = ctx.createRadialGradient(0, 95, 8, 0, 105, 140);
      tailBounce.addColorStop(0, "rgba(216, 74, 43, 0.45)");
      tailBounce.addColorStop(0.35, "rgba(216, 74, 43, 0.18)");
      tailBounce.addColorStop(0.7, "rgba(216, 74, 43, 0.04)");
      tailBounce.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = tailBounce;
      ctx.beginPath();
      ctx.ellipse(0, 100, 160, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sculpted Luxury Coupe Body Shell (Deep Obsidian Metallic)
      const bodyGrad = ctx.createLinearGradient(-160, -70, 160, 70);
      bodyGrad.addColorStop(0, "#15181E");
      bodyGrad.addColorStop(0.2, "#242A34");
      bodyGrad.addColorStop(0.5, "#384152");
      bodyGrad.addColorStop(0.8, "#20252F");
      bodyGrad.addColorStop(1, "#12141A");

      // Aerodynamic Silhouette
      ctx.beginPath();
      ctx.moveTo(-148, 65);
      ctx.quadraticCurveTo(-158, 42, -152, 25);
      ctx.quadraticCurveTo(-145, 4, -125, -6);
      ctx.quadraticCurveTo(-95, -48, -55, -68);
      ctx.quadraticCurveTo(0, -76, 55, -68);
      ctx.quadraticCurveTo(95, -48, 125, -6);
      ctx.quadraticCurveTo(145, 4, 152, 25);
      ctx.quadraticCurveTo(158, 42, 148, 65);
      ctx.quadraticCurveTo(0, 74, -148, 65);
      ctx.closePath();
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Rear Windshield Glass
      const glassGrad = ctx.createLinearGradient(0, -74, 0, -5);
      glassGrad.addColorStop(0, "rgba(18, 24, 32, 0.98)");
      glassGrad.addColorStop(0.4, "rgba(35, 45, 60, 0.9)");
      glassGrad.addColorStop(0.75, "rgba(240, 230, 215, 0.35)");
      glassGrad.addColorStop(1, "rgba(15, 20, 28, 0.98)");

      ctx.beginPath();
      ctx.moveTo(-84, -46);
      ctx.quadraticCurveTo(0, -70, 84, -46);
      ctx.quadraticCurveTo(112, -14, 106, -6);
      ctx.quadraticCurveTo(0, 1, -106, -6);
      ctx.quadraticCurveTo(-112, -14, -84, -46);
      ctx.closePath();
      ctx.fillStyle = glassGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Spoiler Edge Highlight
      ctx.beginPath();
      ctx.moveTo(-122, 4);
      ctx.quadraticCurveTo(0, -4, 122, 4);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Continuous Full-Width LED Signature Taillight Lightbar
      ctx.save();
      ctx.shadowColor = "#D84A2B";
      ctx.shadowBlur = 20;

      // Outer Red/Orange Glow
      ctx.beginPath();
      ctx.moveTo(-132, 16);
      ctx.quadraticCurveTo(0, 10, 132, 16);
      ctx.strokeStyle = "rgba(216, 74, 43, 1)";
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Intense White Core Filament
      ctx.beginPath();
      ctx.moveTo(-130, 16);
      ctx.quadraticCurveTo(0, 10, 130, 16);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      // License Plate Recess
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-42, 28, 84, 22);
      ctx.strokeStyle = "rgba(80, 60, 40, 0.2)";
      ctx.strokeRect(-42, 28, 84, 22);

      // Plate Text
      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 9px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PARKNEX", 0, 42);

      // Rear Diffuser
      ctx.fillStyle = "#12151B";
      ctx.fillRect(-118, 54, 236, 14);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.2;
      [-48, -20, 20, 48].forEach((fx) => {
        ctx.beginPath();
        ctx.moveTo(fx, 54);
        ctx.lineTo(fx, 68);
        ctx.stroke();
      });

      ctx.restore();

      // ── 8. Left Ivory Soft Fade Overlay ──────────────────────────
      const leftFade = ctx.createLinearGradient(0, 0, w * 0.55, 0);
      leftFade.addColorStop(0, "rgba(251, 248, 243, 0.98)");
      leftFade.addColorStop(0.35, "rgba(251, 248, 243, 0.92)");
      leftFade.addColorStop(0.65, "rgba(251, 248, 243, 0.55)");
      leftFade.addColorStop(0.9, "rgba(251, 248, 243, 0.10)");
      leftFade.addColorStop(1, "rgba(251, 248, 243, 0)");
      ctx.fillStyle = leftFade;
      ctx.fillRect(0, 0, w * 0.6, h);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: "block" }}
    />
  );
}
