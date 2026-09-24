/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileDown,
  Users,
  AlertTriangle,
  RotateCcw,
  Scale,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { DocumentViewer } from './components/DocumentViewer';
import { DeadlineTimer } from './components/DeadlineTimer';
import { SummaryCard } from './components/SummaryCard';
import { DefectList } from './components/DefectList';
import { DefenseBriefModal } from './components/DefenseBriefModal';
import { LegalAidModal } from './components/LegalAidModal';
import { ExtractionResponse, TriageResult, ExtractedNotice } from './types/triage';

export default function App() {
  const [triageData, setTriageData] = useState<ExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clinicMode, setClinicMode] = useState(false);

  // Active highlighted clause box (when clicked from DefectList)
  const [activeDefectBoxId, setActiveDefectBoxId] = useState<string | null>(null);

  // Modals
  const [isDefenseBriefOpen, setIsDefenseBriefOpen] = useState(false);
  const [isLegalAidOpen, setIsLegalAidOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleTriageComplete = (data: ExtractionResponse) => {
    setTriageData(data);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewScan = () => {
    setTriageData(null);
    setErrorMessage(null);
    setActiveDefectBoxId(null);
  };

  const handleRecalculated = (newTriage: TriageResult) => {
    if (triageData) {
      setTriageData({
        ...triageData,
        triage: newTriage,
      });
    }
  };

  const handleShareSummary = () => {
    if (!triageData) return;
    const summaryText = `[Project TenantPlus Triage]\nNotice: ${triageData.triage.notice_type}\nCourt Answer Deadline: ${triageData.triage.deadline_date_formatted}\nFatal Defects: ${triageData.triage.has_fatal_defects ? 'YES — ' + triageData.triage.defects.length + ' defects found' : 'None'}\nLegal Aid Hotline: ${triageData.triage.legal_aid_hotline}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onNewScan={handleNewScan}
        hasActiveTriage={Boolean(triageData)}
        clinicMode={clinicMode}
        onToggleClinicMode={() => setClinicMode((prev) => !prev)}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-3 underline hover:text-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1">
        {!triageData ? (
          /* PAGE 1: Landing & Upload Interface */
          <UploadZone
            onTriageComplete={handleTriageComplete}
            isLoading={isLoading}
            statusStep={statusStep}
            onSetLoading={(loading, step) => {
              setIsLoading(loading);
              setStatusStep(step);
            }}
            onError={(msg) => setErrorMessage(msg)}
          />
        ) : (
          /* PAGE 2: Triage Dashboard & Results */
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Top Results Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-mono font-bold text-white">
                    CASE ID: {triageData.triage.session_id.slice(0, 15)}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Jurisdiction: <strong className="text-slate-800">{triageData.triage.jurisdiction_name}</strong>
                  </span>
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-serif">
                  Eviction Notice Triage Results
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleShareSummary}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Summary Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Copy Triage Summary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsDefenseBriefOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  <FileDown className="h-4 w-4 text-red-400" />
                  <span>Download Defense Brief</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLegalAidOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Find Local Legal Aid</span>
                </button>
              </div>
            </div>

            {/* Responsive Two-Column Layout (Stacking Vertically on Mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Interactive Document Overlay (5 cols on desktop) */}
              <div className="lg:col-span-6 space-y-4">
                <DocumentViewer
                  imageUrl={triageData.image_url || triageData.image_data_uri || '/samples/ca_3day_notice.svg'}
                  boundingBoxes={triageData.triage.bounding_boxes}
                  activeDefectBoxId={activeDefectBoxId}
                  onSelectBox={(boxId) => setActiveDefectBoxId(boxId)}
                />
              </div>

              {/* RIGHT COLUMN: Actionable Defense Strategy (7 cols on desktop) */}
              <div className="lg:col-span-6 space-y-5">
                {/* 1. Countdown Timer */}
                <DeadlineTimer triage={triageData.triage} />

                {/* 2. Data Summary & Key-Value Pairs */}
                <SummaryCard
                  triage={triageData.triage}
                  extracted={triageData.extracted}
                  onRecalculate={handleRecalculated}
                />

                {/* 3. Defect Checklist (Fatal defects found by Python engine) */}
                <DefectList
                  defects={triageData.triage.defects}
                  onHighlightBox={(boxId) => setActiveDefectBoxId(boxId)}
                />

                {/* 4. Action Prompts Card */}
                <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base font-serif text-white">
                      Need Assistance Answering This in Court?
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      Free legal clinics in {triageData.triage.jurisdiction_name} provide representation to low-income tenants facing unlawful detainer suits.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsLegalAidOpen(true)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
                    >
                      Connect with Legal Aid
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDefenseBriefOpen(true)}
                      className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                    >
                      Print Brief
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Scale className="h-4 w-4 text-red-600" />
            <span>Project TenantPlus — Hybrid Deterministic Eviction Notice Triage</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Vision OCR: Gemini AI • Legal &amp; Mathematical Calculations: Deterministic Housing Statutes
          </p>
        </div>
      </footer>

      {/* Modals */}
      {triageData && (
        <>
          <DefenseBriefModal
            isOpen={isDefenseBriefOpen}
            onClose={() => setIsDefenseBriefOpen(false)}
            triage={triageData.triage}
            extracted={triageData.extracted}
          />
          <LegalAidModal
            isOpen={isLegalAidOpen}
            onClose={() => setIsLegalAidOpen(false)}
            triage={triageData.triage}
          />
        </>
      )}
    </div>
  );
}
