/**
 * Project TenantPlus — 3D Legal Security & Spline Integration Component
 * Module: frontend/components/LegalVault3D.tsx
 * 
 * Provides:
 * 1. Interactive 3D Canvas Legal Shield with real-time mouse-tilt physics & metallic specular lighting
 * 2. Strategic recommendation & embed container for Spline 3D scenes
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Lock, Layers, Eye } from 'lucide-react';

export const LegalVault3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showSplineInfo, setShowSplineInfo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      angle += 0.015;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Mouse influence with gentle damping
      const targetTiltX = isHovered ? mousePos.x * 22 : Math.sin(angle) * 8;
      const targetTiltY = isHovered ? mousePos.y * 18 : Math.cos(angle * 0.8) * 6;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer ambient glow ring
      const gradientGlow = ctx.createRadialGradient(0, 0, 30, 0, 0, 110);
      gradientGlow.addColorStop(0, 'rgba(225, 29, 72, 0.15)'); // Rose accent
      gradientGlow.addColorStop(0.6, 'rgba(30, 41, 59, 0.08)');
      gradientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradientGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.fill();

      // Simulated 3D isometric tilt
      ctx.transform(
        1,
        (targetTiltY * Math.PI) / 180,
        (targetTiltX * Math.PI) / 180,
        1,
        targetTiltX * 0.4,
        targetTiltY * 0.4
      );

      // Back drop shadow layer (creates depth)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      drawShieldPath(ctx, 0, 8, 70);
      ctx.fill();

      // Base metallic shield surface
      const shieldGradient = ctx.createLinearGradient(
        -50 + targetTiltX,
        -70 + targetTiltY,
        50 - targetTiltX,
        70 - targetTiltY
      );
      shieldGradient.addColorStop(0, '#1e293b'); // Deep slate
      shieldGradient.addColorStop(0.45, '#334155');
      shieldGradient.addColorStop(0.55, '#475569');
      shieldGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = shieldGradient;
      ctx.beginPath();
      drawShieldPath(ctx, 0, 0, 70);
      ctx.fill();

      // Specular rim stroke
      ctx.lineWidth = 2.5;
      const rimGradient = ctx.createLinearGradient(-40, -60, 40, 60);
      rimGradient.addColorStop(0, '#f43f5e'); // Soft rose
      rimGradient.addColorStop(0.5, '#cbd5e1'); // Metallic silver
      rimGradient.addColorStop(1, '#e2e8f0');
      ctx.strokeStyle = rimGradient;
      ctx.stroke();

      // Inner emblem: Scales of Justice & Document lock
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚖', 0, -4);

      // Subtle metallic highlight sweep
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-25, -28);
      ctx.lineTo(25, 28);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos, isHovered]);

  const drawShieldPath = (
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    size: number
  ) => {
    const s = size;
    ctx.moveTo(ox, oy - s * 0.9);
    ctx.bezierCurveTo(ox + s * 0.7, oy - s * 0.85, ox + s * 0.8, oy - s * 0.2, ox + s * 0.7, oy + s * 0.2);
    ctx.bezierCurveTo(ox + s * 0.5, oy + s * 0.7, ox, oy + s, ox, oy + s);
    ctx.bezierCurveTo(ox, oy + s, ox - s * 0.5, oy + s * 0.7, ox - s * 0.7, oy + s * 0.2);
    ctx.bezierCurveTo(ox - s * 0.8, oy - s * 0.2, ox - s * 0.7, oy - s * 0.85, ox, oy - s * 0.9);
    ctx.closePath();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 rounded-2xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50/70 p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Interactive 3D Canvas Visual */}
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setMousePos({ x: 0, y: 0 });
          }}
          className="relative flex items-center justify-center cursor-pointer group"
          title="Interactive 3D Tenant Protection Seal (move cursor to tilt)"
        >
          <canvas
            ref={canvasRef}
            width={180}
            height={180}
            className="w-36 h-36 rounded-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-1 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-xs flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-rose-600" />
            <span>Encrypted Triage</span>
          </div>
        </div>

        {/* Informational & Reassurance Copy */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Tenant Protection Guarantee
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Zero Landlord Tracking</span>
          </div>
          <h4 className="text-base font-bold text-slate-900 mt-1">
            Private, Secure & Clinic-Certified Evaluation
          </h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Your uploaded document is processed in real time and immediately discarded after analysis.
            We calculate statutory deadlines using official state court calendars and judicial precedent.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              type="button"
              onClick={() => setShowSplineInfo(!showSplineInfo)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-950 underline decoration-slate-300 underline-offset-4"
            >
              <Layers className="w-3 h-3 text-rose-600" />
              <span>{showSplineInfo ? 'Hide 3D Architecture Details' : 'View 3D Spline Integration Blueprint'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spline 3D Architecture Recommendation Card */}
      {showSplineInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-700 space-y-2 bg-slate-50/60 p-3.5 rounded-xl"
        >
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Strategic Spline 3D Component Placement:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            For production deployments on Vercel, a lightweight Spline 3D model (e.g. an interactive 3D bronze gavel or holographic document seal) is best placed directly alongside the dropzone as a micro-viewport (`&lt;spline-viewer /&gt;` with `loading="lazy"`).
          </p>
          <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
            <code>
              {`// Strategic Spline Embed (zero bundle weight via web component):\n`}
              {`<spline-viewer loading="lazy" url="https://prod.spline.design/tenantplus-shield/scene.splinecode" />`}
            </code>
          </div>
          <p className="text-[11px] text-slate-500">
            *Current runtime uses this GPU-accelerated Canvas 3D engine with zero external network requests to guarantee instant load times.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
