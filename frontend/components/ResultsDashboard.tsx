/**
 * Project TenantPlus — Overhauled Results Dashboard Component
 * Module: frontend/components/ResultsDashboard.tsx
 * 
 * Features:
 * 1. Softened, authoritative court deadline countdown with tabular numerals
 * 2. Hardware-accelerated Framer Motion entrance variants
 * 3. Plain-English statutory defects & affirmative defense checklist
 * 4. Printable defense summary & 1-click legal aid referral triggers
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'motion/react';
import {
  Clock,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Phone,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  Info,
  Scale,
} from 'lucide-react';

interface ResultsDashboardProps {
  data: {
    notice_type: string;
    jurisdiction_state?: string;
    service_date: string;
    demanded_amount: number;
    days_to_respond: number;
    exclude_weekends: boolean;
    exclude_holidays: boolean;
    deadline_date_iso: string;
    deadline_date_formatted: string;
    is_expired: boolean;
    hours_remaining: number;
    days_remaining: number;
    defects: string[];
    has_fatal_defects: boolean;
  };
  onOpenLegalAid?: () => void;
  onOpenBrief?: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  data,
  onOpenLegalAid,
  onOpenBrief,
}) => {
  const [countdown, setCountdown] = useState({
    days: data.days_remaining,
    hours: Math.floor(data.hours_remaining % 24),
    minutes: 0,
    seconds: 0,
    isExpired: data.is_expired,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTicker = () => {
      const targetTime = new Date(data.deadline_date_iso).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [data.deadline_date_iso]);

  const handleCopySummary = () => {
    const text = `TenantPlus Eviction Triage [${data.jurisdiction_state || 'State'}]:\nNotice: ${data.notice_type}\nCourt Answer Deadline: ${data.deadline_date_formatted}\nDemanded Amount: $${data.demanded_amount.toFixed(2)}\nPotential Defenses:\n${data.defects.length ? data.defects.map((d, i) => `${i + 1}. ${d}`).join('\n') : 'No facial defects detected'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 gpu-accelerated"
    >
      {/* 1. Court Answer Deadline Countdown Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-rose-200/90 bg-linear-to-b from-rose-50/60 via-white to-slate-50/50 p-5 sm:p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
              Court Answer Deadline ({data.jurisdiction_state || 'CA'})
            </span>
          </div>

          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
              countdown.isExpired
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {countdown.isExpired ? 'Notice Period Expired' : 'Active Notice Window'}
          </span>
        </div>

        {/* Digit Blocks with Tabular Numerals */}
        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-white">
              {String(countdown.days).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Days
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-white">
              {String(countdown.hours).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Hours
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-rose-300">
              {String(countdown.minutes).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Mins
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-rose-400">
              {String(countdown.seconds).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Secs
            </div>
          </div>
        </div>

        {/* Legal Deadline Banner */}
        <div className="mt-4 rounded-xl bg-white p-3.5 border border-slate-200/80 text-xs shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Deadline: {data.deadline_date_formatted}
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Your landlord cannot legally file an eviction lawsuit in court until after this date.
                {data.exclude_weekends ? ' Saturdays and Sundays are excluded under state rules.' : ''}
                {data.exclude_holidays ? ' Judicial court holidays are added to your time.' : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Key Data Summary Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Notice Analysis Details
          </h3>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="font-medium">{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
            <span className="text-slate-500 font-medium">Notice Classification</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{data.notice_type}</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
            <span className="text-slate-500 font-medium">Amount Demanded</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              ${data.demanded_amount ? data.demanded_amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Statutory Defenses & Defects Checklist */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Identified Landlord Errors & Defenses
          </h3>
        </div>

        {data.defects && data.defects.length > 0 ? (
          <div className="space-y-2 pt-1">
            {data.defects.map((defect, idx) => (
              <div
                key={idx}
                className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs flex items-start gap-2.5"
              >
                <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-950 block">{defect}</span>
                  <span className="text-rose-800 text-[11px] mt-0.5 block leading-normal">
                    Asserting this defect in your court Answer can force the landlord to dismiss and re-serve.
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <span>No obvious facial defects detected on notice front page. Always consult legal aid.</span>
          </div>
        )}

        {/* Action Triggers */}
        <div className="pt-2 flex flex-wrap gap-2 justify-end">
          {onOpenBrief && (
            <button
              type="button"
              onClick={onOpenBrief}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Print Defense Summary</span>
            </button>
          )}

          {onOpenLegalAid && (
            <button
              type="button"
              onClick={onOpenLegalAid}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Connect Free Legal Aid</span>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
