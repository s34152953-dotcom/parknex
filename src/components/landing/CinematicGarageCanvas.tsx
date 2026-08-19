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

      // ── 1. Deep Space Black & Subtle Atmospheric Gradient ─────────
      ctx.fillStyle = "#040608";
      ctx.fillRect(0, 0, w, h);

      // Parallax offsets
      const px = mouseX * 18;
      const py = mouseY * 10;

      // Perspective vanishing point towards the mall entrance on the right
      const vpX = w * 0.72 + px * 0.4;
      const vpY = h * 0.38 + py * 0.4;
      const horizonY = h * 0.46 + py * 0.8;

      // Volumetric Background Radial Ambient Glow
      const bgGlow = ctx.createRadialGradient(vpX, vpY, 10, vpX, vpY, Math.max(w, h) * 0.9);
      bgGlow.addColorStop(0, "rgba(20, 26, 38, 0.95)");
      bgGlow.addColorStop(0.3, "rgba(11, 15, 23, 0.9)");
      bgGlow.addColorStop(0.65, "rgba(6, 8, 13, 0.98)");
      bgGlow.addColorStop(1, "#040608");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // ── 2. Architectural Ceiling with Steel Beams & Cable Trays ─────
      ctx.save();
      // Ceiling slab
      const ceilingGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      ceilingGrad.addColorStop(0, "rgba(8, 11, 16, 0.95)");
      ceilingGrad.addColorStop(0.6, "rgba(6, 9, 13, 0.98)");
      ceilingGrad.addColorStop(1, "rgba(4, 6, 9, 1)");
      ctx.fillStyle = ceilingGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Overhead concrete beams in perspective
      const ceilingBeams = [
        { x: -w * 0.2, w: 22 },
        { x: 0, w: 18 },
        { x: w * 0.2, w: 16 },
        { x: w * 0.4, w: 14 },
        { x: w * 0.6, w: 12 },
      ];
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 2;
      for (const beam of ceilingBeams) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + beam.x + px * 1.2, 0);
        ctx.lineTo(vpX + beam.x * 0.15, horizonY * 0.7);
        ctx.stroke();
      }
      ctx.restore();

      // ── 3. Overhead High-Bay LED Linear Tube Lights ──────────────
      const lightLanes = [
        { xOffset: -w * 0.38, len: 0.92, bright: 0.65 },
        { xOffset: -w * 0.18, len: 0.88, bright: 0.85 },
        { xOffset: w * 0.04, len: 0.8, bright: 1.0 },
        { xOffset: w * 0.26, len: 0.72, bright: 0.85 },
        { xOffset: w * 0.48, len: 0.6, bright: 0.6 },
      ];

      ctx.save();
      for (const lane of lightLanes) {
        const startX = w * 0.5 + lane.xOffset + px * 1.5;
        const startY = 0;
        const endX = vpX + lane.xOffset * 0.18;
        const endY = horizonY * 0.72;

        // Wide Soft Cyan-White Bloom
        const glowGrad = ctx.createLinearGradient(startX, startY, endX, endY);
        glowGrad.addColorStop(0, `rgba(220, 238, 255, ${0.45 * lane.bright})`);
        glowGrad.addColorStop(0.4, `rgba(180, 215, 255, ${0.25 * lane.bright})`);
        glowGrad.addColorStop(0.85, `rgba(140, 190, 255, ${0.08 * lane.bright})`);
        glowGrad.addColorStop(1, "rgba(100, 150, 255, 0)");

        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = 16;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Intense Pure White Light Core
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * lane.bright})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();

      // ── 4. Distant Luxury Mall Entrance Pavilion (Golden/Amber Light) ──
      const entX = w * 0.78 + px * 0.25;
      const entY = horizonY - h * 0.22;
      const entW = w * 0.19;
      const entH = h * 0.26;

      // Volumetric Warm Golden Ambient Glow
      const warmAmbient = ctx.createRadialGradient(
        entX + entW * 0.5,
        entY + entH * 0.45,
        15,
        entX + entW * 0.5,
        entY + entH * 0.45,
        entW * 2.2
      );
      warmAmbient.addColorStop(0, "rgba(255, 205, 130, 0.28)");
      warmAmbient.addColorStop(0.4, "rgba(235, 170, 80, 0.12)");
      warmAmbient.addColorStop(0.8, "rgba(210, 140, 50, 0.03)");
      warmAmbient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = warmAmbient;
      ctx.fillRect(entX - entW * 1.2, entY - entH * 0.8, entW * 3.4, entH * 2.6);

      // Entrance Glass Atrium Structure
      ctx.fillStyle = "rgba(14, 18, 24, 0.92)";
      ctx.fillRect(entX, entY, entW, entH);

      // Interior Layered Warm Architecture behind glass
      const interiorGrad = ctx.createLinearGradient(entX, entY, entX, entY + entH);
      interiorGrad.addColorStop(0, "rgba(255, 225, 160, 0.35)");
      interiorGrad.addColorStop(0.6, "rgba(255, 195, 110, 0.2)");
      interiorGrad.addColorStop(1, "rgba(230, 160, 70, 0.05)");
      ctx.fillStyle = interiorGrad;
      ctx.fillRect(entX, entY, entW, entH);

      // Glass Vertical Mullions & Revolving Doors Frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
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
      ctx.fillStyle = "rgba(10, 14, 20, 0.95)";
      ctx.fillRect(entX, entY + entH * 0.38, entW, 8);
      ctx.strokeStyle = "rgba(255, 215, 140, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(entX, entY + entH * 0.38, entW, 8);

      // "MALL ENTRANCE ↗" Illuminated Backlit Sign Box
      const signW = entW * 0.86;
      const signH = 22;
      const signX = entX + (entW - signW) / 2;
      const signY = entY - 32;

      ctx.save();
      ctx.shadowColor = "rgba(245, 195, 110, 0.6)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(10, 13, 18, 0.95)";
      ctx.fillRect(signX, signY, signW, signH);
      ctx.strokeStyle = "rgba(245, 195, 110, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(signX, signY, signW, signH);

      ctx.fillStyle = "#FFD68A";
      ctx.font = "bold 10px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MALL ENTRANCE  ↗", signX + signW / 2, signY + signH / 2);
      ctx.restore();

      // Pedestrians entering the lobby
      ctx.fillStyle = "rgba(12, 16, 22, 0.85)";
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

      // ── 5. Concrete Parking Pillars with Zone Signage ────────────
      const pillars = [
        { x: w * 0.28 + px * 0.7, w: 38, topY: h * 0.16, botY: horizonY + h * 0.4, label: "B2", zone: "ZONE A · P18" },
        { x: w * 0.54 + px * 0.45, w: 32, topY: h * 0.22, botY: horizonY + h * 0.28, label: "B2", zone: "ZONE A · P19" },
        { x: w * 0.95 + px * 0.15, w: 48, topY: h * 0.1, botY: h * 0.95, label: "B2", zone: "ZONE B · P01" },
      ];

      for (const col of pillars) {
        // High-contrast Concrete Column Shading
        const colGrad = ctx.createLinearGradient(col.x, 0, col.x + col.w, 0);
        colGrad.addColorStop(0, "rgba(20, 24, 32, 0.98)");
        colGrad.addColorStop(0.25, "rgba(38, 45, 58, 1)");
        colGrad.addColorStop(0.7, "rgba(22, 27, 36, 0.98)");
        colGrad.addColorStop(1, "rgba(10, 13, 18, 1)");

        ctx.fillStyle = colGrad;
        ctx.fillRect(col.x, col.topY, col.w, col.botY - col.topY);

        // Crisp Beveled Chamfer Edge Light
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(col.x, col.topY);
        ctx.lineTo(col.x, col.botY);
        ctx.stroke();

        // Stenciled Floor & Pillar Zone Identity
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.font = "bold 13px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(col.label, col.x + col.w / 2, col.topY + 34);

        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.font = "bold 8px Manrope, sans-serif";
        ctx.fillText(col.zone, col.x + col.w / 2, col.topY + 50);

        // Vertical cyan safety accent stripe on pillar
        ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
        ctx.fillRect(col.x + 2, col.topY + 65, 3, 28);
        ctx.restore();
      }

      // ── 6. Polished Wet Concrete Garage Floor with Reflections ─────
      // Floor Deep Gradient Base
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, "#080b10");
      floorGrad.addColorStop(0.25, "#06090e");
      floorGrad.addColorStop(0.65, "#05070a");
      floorGrad.addColorStop(1, "#040508");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Floor Wet Light Reflections (Mirrored Overhead Streaks)
      ctx.save();
      for (const lane of lightLanes) {
        const fx = vpX + lane.xOffset * 0.35;
        const fy = horizonY;
        const endFx = w * 0.5 + lane.xOffset * 1.9 + px * 1.1;
        const endFy = h;

        const refGrad = ctx.createLinearGradient(fx, fy, endFx, endFy);
        refGrad.addColorStop(0, "rgba(200, 230, 255, 0)");
        refGrad.addColorStop(0.25, `rgba(180, 220, 255, ${0.12 * lane.bright})`);
        refGrad.addColorStop(0.65, `rgba(150, 200, 255, ${0.18 * lane.bright})`);
        refGrad.addColorStop(1, "rgba(120, 180, 255, 0)");

        ctx.strokeStyle = refGrad;
        ctx.lineWidth = 55;
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
      mallFloorRef.addColorStop(0, "rgba(255, 200, 110, 0.16)");
      mallFloorRef.addColorStop(0.5, "rgba(220, 150, 60, 0.06)");
      mallFloorRef.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = mallFloorRef;
      ctx.fillRect(entX - entW * 0.5, horizonY, entW * 2, h * 0.35);
      ctx.restore();

      // Sharp Perspective Lane Markings (White Painted Lines)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";

      const laneDividers = [
        { x1: w * 0.36, y1: horizonY + 15, x2: w * 0.16, y2: h },
        { x1: w * 0.52, y1: horizonY + 15, x2: w * 0.46, y2: h },
        { x1: w * 0.72, y1: horizonY + 15, x2: w * 0.82, y2: h },
      ];
      for (const line of laneDividers) {
        ctx.beginPath();
        ctx.moveTo(line.x1 + px * 0.4, line.y1);
        ctx.lineTo(line.x2 + px * 0.9, line.y2);
        ctx.stroke();
      }

      // Parking Slot Box Dividers
      const bayYs = [horizonY + h * 0.08, horizonY + h * 0.2, horizonY + h * 0.36];
      for (const by of bayYs) {
        ctx.beginPath();
        ctx.moveTo(w * 0.46 + px * 0.5, by);
        ctx.lineTo(w * 0.75 + px * 0.7, by);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();

      // ── 7. Luxury Vehicle (Rear 3/4 Perspective in Foreground) ───
      const carCenterX = w * 0.69 + px * 0.85;
      const carCenterY = horizonY + h * 0.18 + py * 0.25;
      const carScale = Math.min(w / 1360, 1.08) * 1.05;

      ctx.save();
      ctx.translate(carCenterX, carCenterY);
      ctx.scale(carScale, carScale);

      // Layered Car Ambient Occlusion Ground Contact Shadow
      const shadowGrad = ctx.createRadialGradient(0, 80, 15, 0, 80, 220);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.98)");
      shadowGrad.addColorStop(0.4, "rgba(1, 2, 4, 0.85)");
      shadowGrad.addColorStop(0.8, "rgba(2, 4, 7, 0.4)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 82, 210, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wet Floor Specular Red Taillight Bounce Reflection
      const tailBounce = ctx.createRadialGradient(0, 95, 8, 0, 105, 140);
      tailBounce.addColorStop(0, "rgba(255, 30, 45, 0.45)");
      tailBounce.addColorStop(0.35, "rgba(220, 15, 30, 0.18)");
      tailBounce.addColorStop(0.7, "rgba(180, 10, 20, 0.04)");
      tailBounce.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = tailBounce;
      ctx.beginPath();
      ctx.ellipse(0, 100, 160, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sculpted Luxury Coupe Body Shell (Deep Obsidian Metallic)
      const bodyGrad = ctx.createLinearGradient(-160, -70, 160, 70);
      bodyGrad.addColorStop(0, "#0a0d13");
      bodyGrad.addColorStop(0.18, "#151b25");
      bodyGrad.addColorStop(0.48, "#252e3e");
      bodyGrad.addColorStop(0.78, "#141a24");
      bodyGrad.addColorStop(1, "#080a0f");

      // Aerodynamic Rear Profile Silhouette
      ctx.beginPath();
      ctx.moveTo(-148, 65); // Lower rear bumper left
      ctx.quadraticCurveTo(-158, 42, -152, 25); // Left wheel arch flare
      ctx.quadraticCurveTo(-145, 4, -125, -6); // Left rear shoulder / haunch
      ctx.quadraticCurveTo(-95, -48, -55, -68); // Left C-pillar slope
      ctx.quadraticCurveTo(0, -76, 55, -68); // Aerodynamic roofline curve
      ctx.quadraticCurveTo(95, -48, 125, -6); // Right C-pillar slope
      ctx.quadraticCurveTo(145, 4, 152, 25); // Right rear haunch
      ctx.quadraticCurveTo(158, 42, 148, 65); // Right wheel arch
      ctx.quadraticCurveTo(0, 74, -148, 65); // Bottom diffuser baseline
      ctx.closePath();
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Rear Windshield Greenhouse (Dark Privacy Glass with Reflection)
      const glassGrad = ctx.createLinearGradient(0, -74, 0, -5);
      glassGrad.addColorStop(0, "rgba(6, 9, 14, 0.98)");
      glassGrad.addColorStop(0.35, "rgba(18, 26, 38, 0.9)");
      glassGrad.addColorStop(0.75, "rgba(190, 220, 255, 0.2)"); // Overhead light streak on glass
      glassGrad.addColorStop(1, "rgba(5, 7, 11, 0.98)");

      ctx.beginPath();
      ctx.moveTo(-84, -46);
      ctx.quadraticCurveTo(0, -70, 84, -46);
      ctx.quadraticCurveTo(112, -14, 106, -6);
      ctx.quadraticCurveTo(0, 1, -106, -6);
      ctx.quadraticCurveTo(-112, -14, -84, -46);
      ctx.closePath();
      ctx.fillStyle = glassGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sharp Metallic Trunk Edge / Spoiler Highlight
      ctx.beginPath();
      ctx.moveTo(-122, 4);
      ctx.quadraticCurveTo(0, -4, 122, 4);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Continuous Full-Width LED Signature Taillight Lightbar
      ctx.save();
      ctx.shadowColor = "#FF1E33";
      ctx.shadowBlur = 24;

      // Outer Ruby Glow
      ctx.beginPath();
      ctx.moveTo(-132, 16);
      ctx.quadraticCurveTo(0, 10, 132, 16);
      ctx.strokeStyle = "rgba(255, 25, 45, 1)";
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

      // Center High-Mounted Stop Lamp (CHMSL) above rear glass
      ctx.save();
      ctx.shadowColor = "#FF1E33";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "rgba(255, 30, 45, 0.9)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-24, -64);
      ctx.lineTo(24, -64);
      ctx.stroke();
      ctx.restore();

      // License Plate Recess
      ctx.fillStyle = "#06080c";
      ctx.fillRect(-42, 28, 84, 22);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeRect(-42, 28, 84, 22);

      // Plate Text
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 9px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SMARTPARK", 0, 42);

      // Rear Diffuser Aerodynamic Fins
      ctx.fillStyle = "#040508";
      ctx.fillRect(-118, 54, 236, 14);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.2;
      [-48, -20, 20, 48].forEach((fx) => {
        ctx.beginPath();
        ctx.moveTo(fx, 54);
        ctx.lineTo(fx, 68);
        ctx.stroke();
      });

      // Metallic Crease Highlights on Rear Bumper
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-142, 36);
      ctx.quadraticCurveTo(0, 26, 142, 36);
      ctx.stroke();

      ctx.restore();

      // ── 8. High-Contrast Vignettes & Gradient Overlays ──────────
      // Heavy Left Gradient Fade for 100% White Typography Readability
      const leftFade = ctx.createLinearGradient(0, 0, w * 0.62, 0);
      leftFade.addColorStop(0, "rgba(4, 6, 8, 0.98)");
      leftFade.addColorStop(0.38, "rgba(4, 6, 8, 0.92)");
      leftFade.addColorStop(0.68, "rgba(4, 6, 8, 0.65)");
      leftFade.addColorStop(0.9, "rgba(4, 6, 8, 0.15)");
      leftFade.addColorStop(1, "rgba(4, 6, 8, 0)");
      ctx.fillStyle = leftFade;
      ctx.fillRect(0, 0, w * 0.7, h);

      // Bottom Seamless Blend into Feature Cards
      const botFade = ctx.createLinearGradient(0, h * 0.74, 0, h);
      botFade.addColorStop(0, "rgba(4, 6, 8, 0)");
      botFade.addColorStop(0.5, "rgba(4, 6, 8, 0.75)");
      botFade.addColorStop(1, "rgba(4, 6, 8, 1)");
      ctx.fillStyle = botFade;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      // Top Navbar Shadow
      const topFade = ctx.createLinearGradient(0, 0, 0, 100);
      topFade.addColorStop(0, "rgba(4, 6, 8, 0.85)");
      topFade.addColorStop(1, "rgba(4, 6, 8, 0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, w, 100);

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
