/**
 * Project TenantPlus — Next.js Main Triage Page
 * Module: frontend/app/page.tsx
 * 
 * Overhauled with:
 * 1. Authoritative, harmonious typography (no clashing serif/sans-serif weights)
 * 2. Empathetic UX writing tailored for tenants facing displacement
 * 3. Softened, purposeful rose/slate palette
 * 4. Micro-interactions and layout transitions via Framer Motion
 * 5. Vertically centered top navigation
 * 6. Interactive 3D legal security vault component
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { UploadDropzone } from '../components/UploadDropzone';
import { DocumentViewer } from '../components/DocumentViewer';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { LegalVault3D } from '../components/LegalVault3D';
import {
  Scale,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Phone,
  HelpCircle,
} from 'lucide-react';

export default function TenantPlusPage() {
  const [triageResponse, setTriageResponse] = useState<any | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLegalAidModal, setShowLegalAidModal] = useState<boolean>(false);

  const handleTriageSuccess = (data: any, imageUrl: string) => {
    setTriageResponse(data);
    setUploadedImageUrl(imageUrl);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setTriageResponse(null);
    setUploadedImageUrl('');
    setErrorMessage(null);
    setShowLegalAidModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. Header with Vertically Centered Brand & Controls */}
      <Navbar
        onNewScan={handleReset}
        hasActiveTriage={Boolean(triageResponse)}
        onOpenLegalAid={() => setShowLegalAidModal(true)}
      />

      {/* Dismissible Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-600 text-white px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2 shadow-xs"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-white" />
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-3 underline font-semibold text-rose-100 hover:text-white"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!triageResponse ? (
            /* ========================================================== */
            /* VIEW 1: HERO & SECURE UPLOAD                               */
            /* ========================================================== */
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto"
            >
              {/* Harmonious, Empathetic Headline & Subheadline */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 mb-3">
                  <Scale className="w-3.5 h-3.5" />
                  Free & Confidential Legal Triage
                </span>

                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-sans leading-tight">
                  Understand Your Eviction Notice <br />
                  <span className="text-rose-600 font-serif italic font-normal">
                    in Seconds.
                  </span>
                </h1>

                <p className="mt-3.5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                  Upload a photo of your notice. We calculate your exact court answer deadline, check for common landlord mistakes that could pause your eviction, and connect you with free legal defense.
                </p>
              </div>

              {/* Upload Dropzone & Modernized State Selector */}
              <UploadDropzone
                onTriageComplete={handleTriageSuccess}
                onError={(msg) => setErrorMessage(msg)}
              />

              {/* 3D Legal Security Vault & Spline Architecture */}
              <LegalVault3D />

              {/* Tenant Rights FAQ Accordion Strip */}
              <div className="mt-8 border-t border-slate-200/80 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Day of Service Excluded
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Under court rules, the countdown clock does not start until the day after you were served.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Court Holidays Tolled
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Weekends and judicial court holidays never count against your answer window.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Unlawful Late Fees
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      A notice demanding late charges or utilities can be declared legally defective in court.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ========================================================== */
            /* VIEW 2: TWO-COLUMN TRIAGE DASHBOARD                        */
            /* ========================================================== */
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Results Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      Triage Analysis Complete
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {triageResponse.data?.jurisdiction_state === 'CA' ? 'California' : triageResponse.data?.jurisdiction_state === 'NY' ? 'New York' : 'Illinois'} Court Rules Applied
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans mt-0.5">
                    Eviction Notice Triage Summary
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload New Notice</span>
                  </button>
                </div>
              </div>

              {/* Two-Column Grid: Document Inspector + Actionable Defense Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Interactive Document Viewer with SVG Overlays */}
                <div className="lg:col-span-6">
                  <DocumentViewer
                    imageUrl={uploadedImageUrl}
                    dateBoundingBox={triageResponse.data?.date_bounding_box}
                    amountBoundingBox={triageResponse.data?.amount_bounding_box}
                  />
                </div>

                {/* Right Column: Results Dashboard */}
                <div className="lg:col-span-6">
                  <ResultsDashboard
                    data={triageResponse.data}
                    onOpenLegalAid={() => setShowLegalAidModal(true)}
                    onOpenBrief={() => window.print()}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* In-app Legal Aid Directory Modal */}
      {showLegalAidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scale className="h-5 w-5 text-rose-500" />
                <h3 className="font-bold text-base">Free Tenant Legal Aid Hotlines</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLegalAidModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                If you have received an eviction notice, free non-profit legal aid organizations can assist you in filing an official court Answer, asserting defenses, and preventing default judgments:
              </p>
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 text-sm">Eviction Defense Collaborative</div>
                  <div className="text-xs text-slate-600 mt-1">Tenant legal clinic, emergency answer drafting, and rental assistance referrals.</div>
                  <div className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>(415) 659-9184 (Free Hotline)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 text-sm">Legal Aid Foundation (LAFLA)</div>
                  <div className="text-xs text-slate-600 mt-1">Direct representation and defense against unlawful detainers and statutory defects.</div>
                  <div className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>1-800-399-4529</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 text-sm">New York Legal Assistance Group (NYLAG)</div>
                  <div className="text-xs text-slate-600 mt-1">Tenant rights legal team defending 14-day demands and nonpayment petitions.</div>
                  <div className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>(212) 613-5000</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLegalAidModal(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close Directory
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quiet, Professional Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Project TenantPlus • Confidential Eviction Notice Triage & Defense Engine</span>
          <span className="text-slate-400">Not formal legal representation • Always consult local legal aid</span>
        </div>
      </footer>
    </div>
  );
}
