/**
 * Project TenantPlus — Defect Checklist & Defense Strategy Component
 */

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { StatutoryDefect } from '../types/triage';

interface DefectListProps {
  defects: StatutoryDefect[];
  onHighlightBox?: (boxId: string) => void;
}

export const DefectList: React.FC<DefectListProps> = ({ defects, onHighlightBox }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDefectId, setExpandedDefectId] = useState<string | null>(
    defects.length > 0 ? defects[0].id : null
  );

  const handleCopyDefense = (defect: StatutoryDefect) => {
    navigator.clipboard.writeText(defect.defense_strategy_text);
    setCopiedId(defect.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fatalCount = defects.filter((d) => d.severity === 'FATAL').length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Statutory Defects &amp; Red Flags
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated deterministically against local housing codes
            </p>
          </div>
        </div>

        {fatalCount > 0 ? (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 flex items-center gap-1.5 border border-red-200">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            {fatalCount} Fatal Defect{fatalCount > 1 ? 's' : ''} Found
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            No Fatal Defects
          </span>
        )}
      </div>

      {/* Defect Items */}
      <div className="divide-y divide-slate-100 p-2 sm:p-3">
        {defects.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No statutory defects detected on the face of the notice. Ensure you consult with local legal aid regarding proof of service and rent receipt accounting.
          </div>
        ) : (
          defects.map((defect) => {
            const isFatal = defect.severity === 'FATAL';
            const isExpanded = expandedDefectId === defect.id;

            return (
              <div
                key={defect.id}
                className={`rounded-xl p-3.5 transition-all mb-2 ${
                  isFatal ? 'bg-red-50/50 border border-red-200' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div
                  className="flex items-start justify-between cursor-pointer gap-2"
                  onClick={() => setExpandedDefectId(isExpanded ? null : defect.id)}
                >
                  <div className="flex items-start gap-2.5">
                    {isFatal ? (
                      <span className="mt-0.5 rounded-md bg-red-600 p-1 text-white shadow-xs">
                        <AlertOctagon className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="mt-0.5 rounded-md bg-amber-500 p-1 text-white shadow-xs">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isFatal ? 'bg-red-200 text-red-900' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {defect.severity} DEFECT
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-500">
                          {defect.statutory_citation}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                        {defect.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {defect.related_box_id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onHighlightBox && defect.related_box_id) {
                            onHighlightBox(defect.related_box_id);
                          }
                        }}
                        className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-xs border border-slate-300 hover:bg-slate-100 transition-colors"
                        title="Locate this clause on the document"
                      >
                        Highlight Clause
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3.5 border-t border-slate-200/80 pt-3 text-xs text-slate-700 space-y-2.5">
                    {/* Plain English Rationale */}
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">
                        Plain-English Explanation:
                      </span>
                      <p className="leading-relaxed text-slate-700">
                        {defect.plain_english_explanation}
                      </p>
                    </div>

                    {/* Actionable Court Answer Text */}
                    <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-inner">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1">
                          <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                          Recommended Defense for Court Answer / Demurrer:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyDefense(defect)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {copiedId === defect.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-serif italic text-slate-800 leading-relaxed text-[11.5px] bg-slate-50 p-2 rounded border border-slate-100">
                        &ldquo;{defect.defense_strategy_text}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
