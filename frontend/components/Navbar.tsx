/**
 * Project TenantPlus — Header & Navigation Component
 * Module: frontend/components/Navbar.tsx
 * 
 * Implements Top Bar Contract with vertically centered elements and calm, empathetic branding.
 */

'use client';

import React from 'react';
import { Scale, RotateCcw, ShieldCheck, PhoneCall } from 'lucide-react';
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Zone 1: Perfectly Centered Brand Wordmark & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Scale className="h-5 w-5 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              Tenant<span className="text-rose-600 font-black">Plus</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
              Eviction Notice Triage
            </span>
          </div>
        </div>

        {/* Zone 2: Quiet Trust Markers (Clean, unboxed metadata) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            100% Confidential
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Zero Landlord Tracking</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Free Legal Aid Tool</span>
        </div>

        {/* Zone 3: Perfectly Centered Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenLegalAid && (
            <button
              type="button"
              onClick={onOpenLegalAid}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
              <span>Legal Hotline</span>
            </button>
          )}

          {hasActiveTriage && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onNewScan}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
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
