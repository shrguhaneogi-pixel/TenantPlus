/**
 * Project TenantPlus — High-Urgency Court Deadline Countdown Timer
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Calendar, ShieldCheck, Scale } from 'lucide-react';
import { TriageResult } from '../types/triage';

interface DeadlineTimerProps {
  triage: TriageResult;
}

export const DeadlineTimer: React.FC<DeadlineTimerProps> = ({ triage }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: triage.days_remaining,
    hours: Math.floor(triage.hours_remaining % 24),
    minutes: 0,
    seconds: 0,
    isExpired: triage.is_expired,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = new Date(triage.deadline_date_iso).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [triage.deadline_date_iso]);

  return (
    <div className="rounded-2xl border-2 border-red-500 bg-linear-to-b from-red-50/80 via-white to-red-50/30 p-5 sm:p-6 shadow-md relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-red-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <h2 className="text-xs font-black uppercase tracking-wider text-red-900 font-sans">
            COURT ANSWER DEADLINE COUNTDOWN
          </h2>
        </div>

        <span className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
          {timeLeft.isExpired ? 'DEADLINE EXPIRED' : 'ACTIVE NOTICE PERIOD'}
        </span>
      </div>

      {/* Massive Visual Timer Blocks */}
      <div className="mt-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {/* Days */}
          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Days
            </div>
          </div>

          {/* Hours */}
          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Hours
            </div>
          </div>

          {/* Minutes */}
          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-red-400">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Mins
            </div>
          </div>

          {/* Seconds */}
          <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 text-white shadow-sm ring-1 ring-slate-800">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-red-500">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Secs
            </div>
          </div>
        </div>
      </div>

      {/* Exact Legal Timestamp & Statutory Grounding */}
      <div className="mt-4 rounded-xl bg-white p-3.5 border border-red-200/90 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Calendar className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-slate-900 text-sm">
              {triage.deadline_date_formatted}
            </div>
            <p className="mt-1 text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Deterministic Rule Applied: </strong>
              {triage.day_counting_rule === 'COURT_DAYS' ? (
                <span>
                  <strong>Court Days Only</strong> (Cal. CCP § 12 &amp; § 1161(2)). Saturdays, Sundays, and judicial holidays do not count towards the {triage.statutory_cure_days}-day period.
                </span>
              ) : (
                <span>
                  <strong>Calendar Days with Judicial Rollover</strong> (NY General Construction Law § 25-a).
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Excluded Weekends / Court Holidays Banner */}
        {(triage.weekends_excluded_count > 0 || triage.holidays_excluded.length > 0) && (
          <div className="mt-2.5 border-t border-slate-100 pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Statutory Tolling Active:
            </span>
            {triage.weekends_excluded_count > 0 && (
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 font-medium border border-emerald-200">
                +{triage.weekends_excluded_count} weekend days excluded
              </span>
            )}
            {triage.holidays_excluded.map((h, i) => (
              <span key={i} className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 font-medium border border-emerald-200">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
