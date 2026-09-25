/**
 * Project TenantPlus — Overhauled Results Dashboard Component
 * Module: frontend/components/ResultsDashboard.tsx
 * 
 * Features:
 * 1. Softened, authoritative court deadline countdown with tabular numerals
 * 2. Plain-English statutory defects & affirmative defenses checklist
 * 3. Printable defense summary & 1-click legal aid referral triggers
 * 4. Micro-interactions via Framer Motion
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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

  return (
    <div className="space-y-5">
      {/* 1. Softened, High-Clarity Court Deadline Countdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
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

        {/* Big Digit Blocks with Tabular Numerals */}
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

        {/* Plain-English Legal Finding Banner */}
        <div className="mt-4 rounded-xl bg-white p-3.5 border border-slate-200/80 text-xs shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Deadline: {data.deadline_date_formatted}
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Your landlord cannot legally file an eviction lawsuit in court until after this exact date.
                {data.exclude_weekends ? ' Saturdays and Sundays are excluded.' : ''}
                {data.exclude_holidays ? ' Official state judicial court holidays are added to your time.' : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Key Data Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Notice Details
          </h3>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="font-medium">{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 col-span-2">
            <span className="text-[11px] text-slate-500 font-medium">Notice Type & Jurisdiction</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {data.notice_type} · {data.jurisdiction_state || 'CA'}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Service Date</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{data.service_date}</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Demanded Amount</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
              ${data.demanded_amount.toFixed(2)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Defects & Affirmative Defenses Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Potential Notice Defenses
              </h3>
              <p className="text-xs text-slate-500">Errors that could dismiss or delay an eviction</p>
            </div>
          </div>

          {data.has_fatal_defects ? (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
              {data.defects.length} Defense{data.defects.length > 1 ? 's' : ''} Identified
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              Standard Notice Language
            </span>
          )}
        </div>

        <div className="mt-3.5 space-y-2.5">
          {data.defects.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                No obvious statutory violations detected on the face of the document. Even so, you may have defenses based on habitability, improper service, or retaliation.
              </span>
            </div>
          ) : (
            data.defects.map((defect, i) => (
              <div
                key={i}
                className="rounded-xl border border-rose-200/90 bg-rose-50/40 p-3.5 text-xs flex items-start gap-2.5"
              >
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block">{defect}</span>
                  <span className="text-[11px] text-slate-600 mt-1 block leading-normal">
                    This mistake may give you legal grounds to dismiss an unlawful detainer lawsuit or file a Motion to Quash.
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Triggers */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenBrief}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Printer className="h-4 w-4 text-rose-400" />
            <span>Print Defense Brief</span>
          </button>

          <button
            type="button"
            onClick={onOpenLegalAid}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Connect with Free Legal Aid</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
