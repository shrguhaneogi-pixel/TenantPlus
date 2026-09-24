/**
 * Project TenantPlus — Legal Defense Brief & Court Answer Worksheet Modal
 */

import React from 'react';
import { FileDown, Printer, X, Scale, AlertOctagon, CheckCircle } from 'lucide-react';
import { TriageResult, ExtractedNotice } from '../types/triage';

interface DefenseBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  triage: TriageResult;
  extracted: ExtractedNotice;
}

export const DefenseBriefModal: React.FC<DefenseBriefModalProps> = ({
  isOpen,
  onClose,
  triage,
  extracted,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-300 my-8 overflow-hidden">
        {/* Modal Toolbar (Non-printable) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-red-600" />
            <span className="font-bold text-sm uppercase tracking-wider text-slate-900">
              TenantPlus Defense Brief Generator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save to PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Brief */}
        <div className="p-8 sm:p-12 font-serif text-slate-900 leading-normal" id="printable-defense-brief">
          {/* Legal Document Caption Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">
              DEFENSE TRIAGE BRIEF &amp; STATUTORY ANSWER WORKSHEET
            </h1>
            <p className="text-xs sm:text-sm italic text-slate-600 mt-1">
              Prepared for Tenant Court Defense &amp; Legal Aid Clinic Intake Evaluation
            </p>
            <div className="mt-2 text-xs font-sans font-bold text-red-700 uppercase tracking-widest">
              COURT JURISDICTION: {triage.court_name.toUpperCase()}
            </div>
          </div>

          {/* Parties & Notice Record */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-sans border border-slate-300 p-4 rounded bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-500 uppercase block">Tenant(s) / Respondent:</span>
              <span className="font-semibold text-slate-900 text-sm">
                {extracted.tenant_name || 'Resident in Possession'}
              </span>
              <span className="block text-slate-600 mt-0.5">
                {extracted.property_address || 'Premises under review'}
              </span>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase block">Landlord / Petitioner:</span>
              <span className="font-semibold text-slate-900 text-sm">
                {extracted.landlord_name || 'Landlord of Record'}
              </span>
              <span className="block text-slate-600 mt-0.5">
                Service Date: <strong>{triage.service_date}</strong>
              </span>
            </div>
          </div>

          {/* Statutory Answer Deadline Finding */}
          <div className="mt-6 border-l-4 border-red-600 bg-red-50/60 p-4 rounded-r">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wide text-red-900 flex items-center gap-1.5">
              <AlertOctagon className="h-4 w-4 text-red-600" />
              Judicial Answer Deadline Finding
            </h3>
            <p className="mt-1 text-sm text-slate-800">
              The statutory deadline to cure or file an appearance/answer expires on:
            </p>
            <p className="text-base font-bold text-red-700 mt-1">
              {triage.deadline_date_formatted}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Deterministic Calculation Basis: {triage.day_counting_rule === 'COURT_DAYS' 
                ? 'Court Days Only (Cal. CCP § 12 & § 1161(2)). Excludes Saturdays, Sundays, and official judicial holidays.'
                : 'Calendar days with standard weekend/holiday rollover to next judicial business day.'}
            </p>
          </div>

          {/* Fatal Defects & Affirmative Defenses */}
          <div className="mt-6">
            <h3 className="font-sans font-bold text-base uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              I. Identified Statutory Notice Defects &amp; Grounds for Dismissal
            </h3>

            {triage.defects.length === 0 ? (
              <p className="text-xs italic text-slate-600 mt-2">
                No procedural defects detected on the face of the notice document.
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {triage.defects.map((defect, idx) => (
                  <div key={defect.id} className="text-xs space-y-1">
                    <div className="font-sans font-bold text-slate-900 flex items-baseline gap-1.5">
                      <span className="rounded bg-slate-900 text-white px-1.5 py-0.2 text-[10px]">
                        Defect #{idx + 1}
                      </span>
                      <span className="text-red-700 font-bold">[{defect.severity}]</span>
                      <span>{defect.title}</span>
                    </div>

                    <div className="text-slate-600 italic pl-6">
                      Statutory Citation: {defect.statutory_citation}
                    </div>

                    <p className="text-slate-800 leading-relaxed pl-6">
                      {defect.plain_english_explanation}
                    </p>

                    <div className="font-sans text-[11px] bg-slate-100 p-2.5 rounded border border-slate-200 ml-6">
                      <strong className="block text-slate-900 mb-0.5">Form Answer Language:</strong>
                      &ldquo;{defect.defense_strategy_text}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Itemization */}
          <div className="mt-6">
            <h3 className="font-sans font-bold text-base uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              II. Accounting of Demanded Sums
            </h3>
            <div className="mt-2 text-xs font-sans space-y-1">
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span>Stated Gross Amount Demanded:</span>
                <span className="font-mono font-bold">${triage.demanded_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span>Actual Past-Due Contract Base Rent:</span>
                <span className="font-mono font-bold">${triage.base_rent_amount.toFixed(2)}</span>
              </div>
              {triage.improper_fees_amount > 0 && (
                <div className="flex justify-between text-red-700 font-bold py-1">
                  <span>Unauthorized Late Charges / Non-Rent Surcharges:</span>
                  <span className="font-mono">+${triage.improper_fees_amount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Legal Aid Referral Footer */}
          <div className="mt-8 border-t border-slate-300 pt-4 text-xs font-sans text-slate-600">
            <div className="font-bold text-slate-900 uppercase">
              Free Legal Representation Hotline:
            </div>
            <div>{triage.legal_aid_org_name} — Phone: <strong>{triage.legal_aid_hotline}</strong></div>
            <div>Web: {triage.legal_aid_url}</div>
            <div className="mt-4 text-[10px] italic text-slate-500 border-t border-slate-200 pt-2">
              DISCLAIMER: Project TenantPlus is an automated triage tool powered by deterministic statute verification and computer vision extraction. This brief is intended to assist tenants and legal aid advocates with issue spotting and does not constitute formal attorney-client representation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
