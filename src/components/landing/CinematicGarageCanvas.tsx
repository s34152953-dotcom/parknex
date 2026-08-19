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
      time += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const w = width;
      const h = height;

      // ── 1. Clear & Deep Dark Base ───────────────────────
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      // Parallax offsets
      const px = mouseX * 15;
      const py = mouseY * 8;

      // Perspective Vanishing Point (towards the mall entrance on the right)
      const vpX = w * 0.68 + px * 0.5;
      const vpY = h * 0.38 + py * 0.5;

      // ── 2. Atmospheric Ceiling & Floor Gradient ─────────
      const bgGrad = ctx.createRadialGradient(vpX, vpY, 20, vpX, vpY, Math.max(w, h));
      bgGrad.addColorStop(0, "rgba(22, 28, 38, 0.95)");
      bgGrad.addColorStop(0.35, "rgba(12, 16, 23, 0.9)");
      bgGrad.addColorStop(0.7, "rgba(6, 8, 12, 0.98)");
      bgGrad.addColorStop(1, "#050505");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Floor Horizon Line
      const horizonY = h * 0.44 + py;

      // ── 3. Ceiling Linear LED Strip Lights ──────────────
      // Overhead linear perspective light tubes
      const lightLanes = [
        { xOffset: -w * 0.35, len: 0.9, bright: 0.7 },
        { xOffset: -w * 0.15, len: 0.85, bright: 0.9 },
        { xOffset: w * 0.05, len: 0.75, bright: 1.0 },
        { xOffset: w * 0.25, len: 0.65, bright: 0.8 },
        { xOffset: w * 0.45, len: 0.55, bright: 0.6 },
      ];

      ctx.save();
      for (const lane of lightLanes) {
        const startX = w * 0.5 + lane.xOffset + px * 1.5;
        const startY = 0;
        const endX = vpX + lane.xOffset * 0.15;
        const endY = horizonY * 0.65;

        // Linear glow
        const glowGrad = ctx.createLinearGradient(startX, startY, endX, endY);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * lane.bright})`);
        glowGrad.addColorStop(0.5, `rgba(210, 230, 255, ${0.25 * lane.bright})`);
        glowGrad.addColorStop(1, "rgba(200, 220, 255, 0.0)");

        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Core white light
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * lane.bright})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();

      // ── 4. Distant Mall Entrance Glow (Golden / Warm Glass) ───
      const entX = w * 0.76 + px * 0.3;
      const entY = horizonY - h * 0.18;
      const entW = w * 0.18;
      const entH = h * 0.22;

      // Warm glow behind entrance
      const warmGlow = ctx.createRadialGradient(
        entX + entW * 0.5,
        entY + entH * 0.5,
        10,
        entX + entW * 0.5,
        entY + entH * 0.5,
        entW * 1.8
      );
      warmGlow.addColorStop(0, "rgba(240, 195, 120, 0.22)");
      warmGlow.addColorStop(0.5, "rgba(220, 160, 80, 0.08)");
      warmGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = warmGlow;
      ctx.fillRect(entX - entW, entY - entH, entW * 3, entH * 3);

      // Entrance Glass Frame
      ctx.fillStyle = "rgba(18, 22, 28, 0.85)";
      ctx.fillRect(entX, entY, entW, entH);

      // Glass door vertical frames
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      const doorCols = 4;
      for (let i = 0; i <= doorCols; i++) {
        const dx = entX + (entW / doorCols) * i;
        ctx.beginPath();
        ctx.moveTo(dx, entY);
        ctx.lineTo(dx, entY + entH);
        ctx.stroke();
      }

      // Interior warm light through glass
      const glassLight = ctx.createLinearGradient(entX, entY, entX, entY + entH);
      glassLight.addColorStop(0, "rgba(255, 220, 160, 0.25)");
      glassLight.addColorStop(0.7, "rgba(255, 200, 120, 0.15)");
      glassLight.addColorStop(1, "rgba(255, 180, 90, 0.02)");
      ctx.fillStyle = glassLight;
      ctx.fillRect(entX, entY, entW, entH);

      // "MALL ENTRANCE →" Sign Box
      const signW = entW * 0.85;
      const signH = 18;
      const signX = entX + (entW - signW) / 2;
      const signY = entY - 26;

      ctx.fillStyle = "rgba(10, 14, 20, 0.9)";
      ctx.fillRect(signX, signY, signW, signH);
      ctx.strokeStyle = "rgba(240, 195, 120, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(signX, signY, signW, signH);

      // Sign text with warm amber glow
      ctx.fillStyle = "#F6C878";
      ctx.font = "bold 9px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("◉ MALL ENTRANCE  →", signX + signW / 2, signY + signH / 2);

      // Subtle people silhouettes near entrance
      ctx.fillStyle = "rgba(10, 12, 16, 0.7)";
      const people = [
        { x: entX + entW * 0.35, y: entY + entH - 24, h: 22, w: 6 },
        { x: entX + entW * 0.48, y: entY + entH - 26, h: 24, w: 7 },
        { x: entX + entW * 0.65, y: entY + entH - 20, h: 18, w: 5 },
      ];
      for (const p of people) {
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(p.x, p.y + 6, p.w, p.h - 6);
      }

      // ── 5. Concrete Parking Pillars ──────────────────────
      const pillars = [
        { x: w * 0.32 + px * 0.8, w: 34, topY: h * 0.18, botY: horizonY + h * 0.35, label: "B2", zone: "P18" },
        { x: w * 0.52 + px * 0.5, w: 28, topY: h * 0.24, botY: horizonY + h * 0.25, label: "B2", zone: "P2" },
        { x: w * 0.94 + px * 0.2, w: 42, topY: h * 0.12, botY: h * 0.9, label: "B2", zone: "P1" },
      ];

      for (const col of pillars) {
        // Pillar shadow
        const colGrad = ctx.createLinearGradient(col.x, 0, col.x + col.w, 0);
        colGrad.addColorStop(0, "rgba(22, 26, 34, 0.95)");
        colGrad.addColorStop(0.3, "rgba(35, 42, 54, 0.98)");
        colGrad.addColorStop(0.7, "rgba(20, 24, 32, 0.95)");
        colGrad.addColorStop(1, "rgba(8, 10, 14, 0.98)");

        ctx.fillStyle = colGrad;
        ctx.fillRect(col.x, col.topY, col.w, col.botY - col.topY);

        // Pillar bevel edge light
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(col.x, col.topY);
        ctx.lineTo(col.x, col.botY);
        ctx.stroke();

        // Pillar zone label text
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "bold 11px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(col.label, col.x + col.w / 2, col.topY + 30);

        ctx.font = "9px Manrope, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillText(col.zone, col.x + col.w / 2, col.topY + 45);
      }

      // ── 6. Wet Reflective Asphalt Floor ─────────────────
      // Floor base
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, "#0a0d14");
      floorGrad.addColorStop(0.3, "#080b10");
      floorGrad.addColorStop(0.7, "#06080d");
      floorGrad.addColorStop(1, "#050505");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Floor wet light reflections (overhead light streaks mirrored on floor)
      ctx.save();
      for (const lane of lightLanes) {
        const fx = vpX + lane.xOffset * 0.4;
        const fy = horizonY;
        const endFx = w * 0.5 + lane.xOffset * 1.8 + px;
        const endFy = h;

        const refGrad = ctx.createLinearGradient(fx, fy, endFx, endFy);
        refGrad.addColorStop(0, "rgba(200, 225, 255, 0.0)");
        refGrad.addColorStop(0.3, `rgba(180, 215, 255, ${0.08 * lane.bright})`);
        refGrad.addColorStop(0.7, `rgba(160, 200, 255, ${0.12 * lane.bright})`);
        refGrad.addColorStop(1, "rgba(140, 180, 240, 0.0)");

        ctx.strokeStyle = refGrad;
        ctx.lineWidth = 45;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(endFx, endFy);
        ctx.stroke();
      }
      ctx.restore();

      // Lane Markings (White painted parking lines in perspective)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      // Perspective lane divider lines
      const laneLines = [
        { x1: w * 0.38, y1: horizonY + 20, x2: w * 0.2, y2: h },
        { x1: w * 0.52, y1: horizonY + 20, x2: w * 0.48, y2: h },
        { x1: w * 0.68, y1: horizonY + 20, x2: w * 0.78, y2: h },
      ];
      for (const line of laneLines) {
        ctx.beginPath();
        ctx.moveTo(line.x1 + px * 0.5, line.y1);
        ctx.lineTo(line.x2 + px, line.y2);
        ctx.stroke();
      }

      // Parking bay horizontal dividers
      const bayYs = [horizonY + h * 0.1, horizonY + h * 0.22, horizonY + h * 0.38];
      for (const by of bayYs) {
        ctx.beginPath();
        ctx.moveTo(w * 0.48 + px * 0.6, by);
        ctx.lineTo(w * 0.72 + px * 0.7, by);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // ── 7. Sleek Dark Luxury Car (Center-Right in Foreground) ─
      const carCenterX = w * 0.68 + px * 0.9;
      const carCenterY = horizonY + h * 0.19 + py * 0.3;
      const carScale = Math.min(w / 1400, 1.05) * 1.0;

      ctx.save();
      ctx.translate(carCenterX, carCenterY);
      ctx.scale(carScale, carScale);

      // Car Cast Shadow (multiple soft layers)
      const shadowGrad = ctx.createRadialGradient(0, 75, 20, 0, 75, 200);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.95)");
      shadowGrad.addColorStop(0.5, "rgba(2, 3, 5, 0.8)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 75, 190, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wet floor reflection of red taillights
      const tailGlow = ctx.createRadialGradient(0, 85, 5, 0, 95, 110);
      tailGlow.addColorStop(0, "rgba(255, 40, 40, 0.35)");
      tailGlow.addColorStop(0.4, "rgba(220, 20, 20, 0.12)");
      tailGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = tailGlow;
      ctx.beginPath();
      ctx.ellipse(0, 90, 140, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Car Body (Rear-Quarter Perspective Silhouette & Highlights)
      // Main Chassis Body Base
      const bodyGrad = ctx.createLinearGradient(-150, -60, 150, 60);
      bodyGrad.addColorStop(0, "#0d1017");
      bodyGrad.addColorStop(0.2, "#181d26");
      bodyGrad.addColorStop(0.5, "#222936");
      bodyGrad.addColorStop(0.8, "#151922");
      bodyGrad.addColorStop(1, "#0a0c10");

      // Draw aerodynamic coupe/sedan rear profile
      ctx.beginPath();
      ctx.moveTo(-140, 60); // bottom left bumper
      ctx.quadraticCurveTo(-148, 40, -145, 25); // wheel arch rear-left
      ctx.quadraticCurveTo(-140, 5, -120, -5); // rear fender
      ctx.quadraticCurveTo(-90, -45, -50, -65); // rear roof pillar / C-pillar
      ctx.quadraticCurveTo(0, -72, 50, -65); // roofline
      ctx.quadraticCurveTo(90, -45, 120, -5); // right C-pillar
      ctx.quadraticCurveTo(140, 5, 145, 25); // right fender
      ctx.quadraticCurveTo(148, 40, 140, 60); // right bottom
      ctx.quadraticCurveTo(0, 68, -140, 60); // bumper bottom line
      ctx.closePath();
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Car Rear Window / Greenhouse Glass
      const glassGrad = ctx.createLinearGradient(0, -70, 0, -10);
      glassGrad.addColorStop(0, "rgba(10, 14, 20, 0.95)");
      glassGrad.addColorStop(0.4, "rgba(25, 35, 50, 0.85)");
      glassGrad.addColorStop(0.8, "rgba(180, 210, 255, 0.15)"); // ceiling light reflection on glass
      glassGrad.addColorStop(1, "rgba(8, 10, 15, 0.95)");

      ctx.beginPath();
      ctx.moveTo(-80, -42);
      ctx.quadraticCurveTo(0, -66, 80, -42);
      ctx.quadraticCurveTo(105, -12, 100, -5);
      ctx.quadraticCurveTo(0, 2, -100, -5);
      ctx.quadraticCurveTo(-105, -12, -80, -42);
      ctx.closePath();
      ctx.fillStyle = glassGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rear Trunk Lid / Ducktail Spoiler Curve
      ctx.beginPath();
      ctx.moveTo(-115, 5);
      ctx.quadraticCurveTo(0, -2, 115, 5);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)"; // sharp metallic top highlight
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Continuous LED Red Taillight Strip (Modern Signature Light Bar)
      ctx.save();
      ctx.shadowColor = "#FF2233";
      ctx.shadowBlur = 18;

      // Outer glow bar
      ctx.beginPath();
      ctx.moveTo(-125, 16);
      ctx.quadraticCurveTo(0, 11, 125, 16);
      ctx.strokeStyle = "rgba(255, 30, 45, 0.95)";
      ctx.lineWidth = 4.5;
      ctx.stroke();

      // Inner intense core
      ctx.beginPath();
      ctx.moveTo(-123, 16);
      ctx.quadraticCurveTo(0, 11, 123, 16);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // License Plate Recess
      ctx.fillStyle = "#07090d";
      ctx.fillRect(-38, 28, 76, 20);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.strokeRect(-38, 28, 76, 20);

      // License plate text
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 8px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SPK 2024", 0, 41);

      // Rear Diffuser & Exhaust Tips
      ctx.fillStyle = "#050608";
      ctx.fillRect(-110, 52, 220, 12);

      // Diffuser fins
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      [-40, -15, 15, 40].forEach((fx) => {
        ctx.beginPath();
        ctx.moveTo(fx, 52);
        ctx.lineTo(fx, 64);
        ctx.stroke();
      });

      // Metallic Body Reflections / Crease Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-135, 35);
      ctx.quadraticCurveTo(0, 26, 135, 35);
      ctx.stroke();

      ctx.restore();

      // ── 8. Cinematic Vignette & Edge Fades ──────────────
      // Heavy left fade for high-contrast white text readability
      const leftFade = ctx.createLinearGradient(0, 0, w * 0.58, 0);
      leftFade.addColorStop(0, "rgba(5, 5, 5, 0.98)");
      leftFade.addColorStop(0.35, "rgba(5, 5, 5, 0.92)");
      leftFade.addColorStop(0.65, "rgba(5, 5, 5, 0.65)");
      leftFade.addColorStop(0.88, "rgba(5, 5, 5, 0.2)");
      leftFade.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = leftFade;
      ctx.fillRect(0, 0, w * 0.65, h);

      // Bottom fade for seamless transition into feature strip
      const botFade = ctx.createLinearGradient(0, h * 0.72, 0, h);
      botFade.addColorStop(0, "rgba(5, 5, 5, 0)");
      botFade.addColorStop(0.5, "rgba(5, 5, 5, 0.7)");
      botFade.addColorStop(1, "rgba(5, 5, 5, 1)");
      ctx.fillStyle = botFade;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      // Top fade for navbar readability
      const topFade = ctx.createLinearGradient(0, 0, 0, 110);
      topFade.addColorStop(0, "rgba(5, 5, 5, 0.85)");
      topFade.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, w, 110);

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
