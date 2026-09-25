/**
 * Project TenantPlus — Layout Skeleton Loader Component
 * Module: frontend/components/SkeletonLoader.tsx
 * 
 * Provides dimension-matched skeleton placeholders for the two-column triage dashboard,
 * preventing Cumulative Layout Shift (CLS) during OCR extraction and analysis.
 */

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, FileSearch, Clock } from 'lucide-react';

interface SkeletonLoaderProps {
  statusMessage?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ statusMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full space-y-6"
    >
      {/* Top Banner Status Notification */}
      <div className="rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50/90 via-white to-slate-50/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
          <FileSearch className="h-5 w-5 text-rose-400 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Analysis in Progress
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            {statusMessage || 'Scanning notice dates, amounts, and legal clauses...'}
          </p>
        </div>
      </div>

      {/* Two-Column Grid matching exact dimensions of DocumentViewer + ResultsDashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Document Viewer Skeleton */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="h-4 w-44 rounded bg-slate-200 animate-shimmer" />
            <div className="h-4 w-24 rounded bg-slate-200 animate-shimmer" />
          </div>
          <div className="p-6 space-y-4 min-h-[480px] flex flex-col justify-center items-center bg-slate-50/50">
            <div className="w-full max-w-sm h-72 rounded-xl bg-slate-200 animate-shimmer border border-slate-300/60 flex items-center justify-center">
              <Clock className="w-10 h-10 text-slate-400/50 animate-spin" />
            </div>
            <div className="w-3/4 h-3 rounded bg-slate-200 animate-shimmer mt-4" />
            <div className="w-1/2 h-3 rounded bg-slate-200 animate-shimmer" />
          </div>
        </div>

        {/* Right Column: Results Dashboard Skeleton */}
        <div className="lg:col-span-6 space-y-5">
          {/* Countdown Card Skeleton */}
          <div className="rounded-2xl border border-rose-200/60 bg-white p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="h-4 w-36 rounded bg-slate-200 animate-shimmer" />
              <div className="h-5 w-24 rounded-full bg-rose-100/80 animate-shimmer" />
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-900/90 animate-shimmer p-2 text-center" />
              ))}
            </div>

            <div className="h-14 rounded-xl bg-slate-100 animate-shimmer" />
          </div>

          {/* Details Card Skeleton */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="h-4 w-32 rounded bg-slate-200 animate-shimmer" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-14 rounded-xl bg-slate-100 animate-shimmer" />
              <div className="h-14 rounded-xl bg-slate-100 animate-shimmer" />
            </div>
          </div>

          {/* Defects Card Skeleton */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="h-4 w-48 rounded bg-slate-200 animate-shimmer" />
            <div className="h-12 rounded-xl bg-slate-100 animate-shimmer" />
            <div className="h-12 rounded-xl bg-slate-100 animate-shimmer" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
