/**
 * Project TenantPlus — Data Summary & Deterministic Scenario Recalculator
 */

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  SlidersHorizontal,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';
import { TriageResult, ExtractedNotice } from '../types/triage';

interface SummaryCardProps {
  triage: TriageResult;
  extracted: ExtractedNotice;
  onRecalculate: (newTriage: TriageResult) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  triage,
  extracted,
  onRecalculate,
}) => {
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [simServiceDate, setSimServiceDate] = useState(triage.service_date);
  const [simJurisdiction, setSimJurisdiction] = useState(triage.jurisdiction_id);
  const [simLateFee, setSimLateFee] = useState(triage.improper_fees_amount);
  const [simPaymentHours, setSimPaymentHours] = useState(extracted.payment_hours_provided || false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRunRecalculation = async () => {
    try {
      setIsCalculating(true);
      const response = await fetch('/api/v1/recalculate-statute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_date: simServiceDate,
          jurisdiction_id: simJurisdiction,
          notice_type: triage.notice_type,
          demanded_amount: triage.demanded_amount,
          late_fee_amount: simLateFee,
          payment_hours_provided: simPaymentHours,
          bounding_boxes: triage.bounding_boxes,
        }),
      });

      if (!response.ok) throw new Error('Recalculation failed');
      const updatedTriage = await response.json();
      onRecalculate(updatedTriage);
      setIsCalculating(false);
      setIsScenarioModalOpen(false);
    } catch (err) {
      console.error('Error during recalculation:', err);
      setIsCalculating(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Header with Title and Scenario Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-600" />
            Extracted Notice Breakdown
          </h3>
          <button
            type="button"
            onClick={() => setIsScenarioModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <SlidersHorizontal className="h-3 w-3 text-slate-600" />
            <span>Test Date Scenarios</span>
          </button>
        </div>

        {/* Clean Key-Value Grid */}
        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {/* Notice Type */}
          <div className="col-span-2 sm:col-span-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">
              Notice Classification
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {triage.notice_type}
            </span>
          </div>

          {/* Service Date */}
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 uppercase">
              <Calendar className="h-3 w-3 text-slate-400" /> Date Served
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {triage.service_date}
            </span>
          </div>

          {/* Cure Period */}
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 uppercase">
              <Clock className="h-3 w-3 text-slate-400" /> Statutory Cure Days
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {triage.statutory_cure_days} {triage.day_counting_rule === 'COURT_DAYS' ? 'Court Days' : 'Days'}
            </span>
          </div>

          {/* Jurisdiction */}
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 uppercase">
              <MapPin className="h-3 w-3 text-slate-400" /> Jurisdiction
            </span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
              {triage.jurisdiction_name}
            </span>
          </div>

          {/* Financial Breakdown Table */}
          <div className="col-span-2 sm:col-span-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Total Demanded on Face of Notice:</span>
              <span className="font-mono text-base font-bold text-slate-900">
                ${triage.demanded_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>• Base Past-Due Rent:</span>
                <span className="font-mono font-medium text-slate-800">
                  ${triage.base_rent_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {triage.improper_fees_amount > 0 && (
                <div className="flex items-center justify-between font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                  <span>• Impermissible Late / Non-Rent Fees:</span>
                  <span className="font-mono">
                    +${triage.improper_fees_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deterministic Scenario Tester Modal */}
      {isScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Deterministic Statute Scenario Tester
              </h3>
              <button
                type="button"
                onClick={() => setIsScenarioModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              Adjust variables to see how court answer deadlines and fatal defects change. All calculations execute deterministically with <strong>zero LLM math</strong>.
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Service Date Input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Service Date on Document:
                </label>
                <input
                  type="date"
                  value={simServiceDate}
                  onChange={(e) => setSimServiceDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Jurisdiction Select */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  State / Jurisdiction Rules:
                </label>
                <select
                  value={simJurisdiction}
                  onChange={(e) => setSimJurisdiction(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="US-CA">California (Court Days Only — AB 2343)</option>
                  <option value="US-NY">New York (14 Calendar Days — RPAPL § 711)</option>
                  <option value="US-IL-COOK">Illinois Cook County (5-Day Court Rules)</option>
                </select>
              </div>

              {/* Late Fee Adjuster */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Bundled Late Fee Amount ($):
                </label>
                <input
                  type="number"
                  min="0"
                  step="25"
                  value={simLateFee}
                  onChange={(e) => setSimLateFee(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm focus:border-slate-900 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  In California &amp; New York, any amount &gt; $0 renders the notice fatally defective.
                </span>
              </div>

              {/* Payment Hours Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-payment-hours"
                  checked={simPaymentHours}
                  onChange={(e) => setSimPaymentHours(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="chk-payment-hours" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Notice explicitly stated physical payment hours (8am - 5pm)
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsScenarioModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunRecalculation}
                disabled={isCalculating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
                <span>Recalculate Deadlines</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
