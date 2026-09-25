/**
 * Project TenantPlus — Results Dashboard Component (FIX 7)
 * Module: frontend/components/ResultsDashboard.tsx
 * 
 * Features:
 * 1. Urgent Red Countdown Timer with Court Holiday Tolling annotations
 * 2. Statutory Defects Checklist evaluated dynamically by Python engine
 * 3. Key-value metadata summary & actionable legal defense brief triggers
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  Phone,
  Printer,
  Copy,
  Check,
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
    const text = `TenantPlus Triage [${data.jurisdiction_state || 'US'}]: ${data.notice_type}\nDeadline: ${data.deadline_date_formatted}\nDefects: ${data.defects.join('; ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* 1. Urgent Red Countdown Timer */}
      <div className="rounded-2xl border-2 border-red-500 bg-linear-to-b from-red-50/90 via-white to-red-50/40 p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-red-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-red-900 font-sans">
              COURT ANSWER DEADLINE COUNTDOWN ({data.jurisdiction_state || 'CA'})
            </span>
          </div>

          <span className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
            {countdown.isExpired ? 'DEADLINE EXPIRED' : 'ACTIVE NOTICE PERIOD'}
          </span>
        </div>

        {/* Big Digit Blocks */}
        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              {String(countdown.days).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Days
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              {String(countdown.hours).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hours
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl font-black font-mono text-red-400">
              {String(countdown.minutes).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mins
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl font-black font-mono text-red-500">
              {String(countdown.seconds).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Secs
            </div>
          </div>
        </div>

        {/* Deterministic Legal Finding Banner */}
        <div className="mt-4 rounded-xl bg-white p-3 border border-red-200 text-xs shadow-xs">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {data.deadline_date_formatted}
              </div>
              <p className="mt-0.5 text-slate-600">
                Calculated deterministically: {data.days_to_respond}-day period (Day of service excluded;{' '}
                {data.exclude_weekends ? 'Weekends ' : ''}
                {data.exclude_holidays ? '& judicial court holidays tolled' : ''}
                ).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Data Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
          <span>Notice Metadata Summary</span>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 col-span-2">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Notice Type & State</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {data.notice_type} ({data.jurisdiction_state || 'CA'})
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Service Date</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{data.service_date}</div>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Demanded Sum</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
              ${data.demanded_amount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Defects Checklist Card (Evaluated by Python Engine) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Statutory Defects Checklist
              </h3>
              <p className="text-xs text-slate-500">Evaluated by Python Rules Engine (Supabase Statutes)</p>
            </div>
          </div>

          {data.has_fatal_defects ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 border border-red-200">
              {data.defects.length} Defect{data.defects.length > 1 ? 's' : ''} Flagged
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              No Defects Flagged
            </span>
          )}
        </div>

        <div className="mt-3.5 space-y-2.5">
          {data.defects.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 text-center">
              No mandatory statutory defects detected on notice face.
            </p>
          ) : (
            data.defects.map((defect, i) => (
              <div
                key={i}
                className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs flex items-start gap-2.5"
              >
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-red-900 block">{defect}</span>
                  <span className="text-[11px] text-red-700 mt-0.5 block leading-normal">
                    Assertable as an affirmative defense on court answer pleadings or Motion to Quash.
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
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Printer className="h-4 w-4 text-red-400" />
            <span>Download Defense Brief</span>
          </button>

          <button
            type="button"
            onClick={onOpenLegalAid}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Find Local Legal Aid</span>
          </button>
        </div>
      </div>
    </div>
  );
};
