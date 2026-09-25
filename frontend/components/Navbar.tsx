/**
 * Project TenantPlus — Overhauled Header & Navigation Component
 * Module: frontend/components/Navbar.tsx
 * 
 * Redesigned with:
 * 1. Hardware-accelerated Framer Motion transforms (strictly y, scale, opacity)
 * 2. High-contrast glassmorphism header (backdrop-blur-md with subtle border)
 * 3. Vertically centered brand wordmark, trust markers, and call-to-action controls
 */

'use client';

import React from 'react';
import { Scale, RotateCcw, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onNewScan: () => void;
  hasActiveTriage: boolean;
  onOpenLegalAid?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewScan,
  hasActiveTriage,
  onOpenLegalAid,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 gpu-accelerated">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Zone 1: Brand Wordmark & Tagline */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs"
          >
            <Scale className="h-5 w-5 text-rose-500" />
          </motion.div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              Tenant<span className="text-rose-600 font-black">Plus</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
              Legal Notice Triage
            </span>
          </div>
        </div>

        {/* Zone 2: Quiet Trust Markers */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            100% Confidential
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Zero Landlord Tracking</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Free Defense Tool</span>
        </div>

        {/* Zone 3: Centered Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenLegalAid && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onOpenLegalAid}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
              <span>Legal Hotline</span>
            </motion.button>
          )}

          {hasActiveTriage && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onNewScan}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
              <span>Evaluate Another Notice</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
