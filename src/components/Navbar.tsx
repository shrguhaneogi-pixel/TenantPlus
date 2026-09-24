/**
 * Project TenantPlus — Header & Navigation Component
 */

import React from 'react';
import { Scale, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';

interface NavbarProps {
  onNewScan: () => void;
  hasActiveTriage: boolean;
  clinicMode: boolean;
  onToggleClinicMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewScan,
  hasActiveTriage,
  clinicMode,
  onToggleClinicMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewScan}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm ring-1 ring-slate-800">
            <Scale className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 font-serif">
                TENANT<span className="text-red-600 font-sans font-bold">PLUS</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                TRIAGE MVP
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
              Hybrid Deterministic Eviction Defense
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Clinic Mode Toggle */}
          <button
            type="button"
            onClick={onToggleClinicMode}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              clinicMode
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Clinic Mode enables advanced statutory citations and defense argument exports"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Clinic Mode: {clinicMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* New Document Scan Button */}
          {hasActiveTriage && (
            <button
              type="button"
              onClick={onNewScan}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <PlusCircle className="h-4 w-4 text-red-400" />
              <span>Scan Another Notice</span>
            </button>
          )}

          {/* Emergency Badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
            <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
            <span className="font-medium">Confidential &amp; Client-Side Encrypted</span>
          </div>
        </div>
      </div>
    </header>
  );
};
