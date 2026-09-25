/**
 * Project TenantPlus — Overhauled Main Eviction Triage Page
 * Module: frontend/app/page.tsx
 * 
 * Features:
 * 1. Typography-led server hero section with fluid clamp scaling (.text-fluid-hero)
 * 2. Progressive 3D WebGL canvas hydration & baked shadow textures
 * 3. Choreographed entrance variants & scroll-linked subtle parallax
 * 4. Optimistic UI transitions with dimension-matched SkeletonLoader
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { UploadDropzone } from '../components/UploadDropzone';
import { DocumentViewer } from '../components/DocumentViewer';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { LegalVault3D } from '../components/LegalVault3D';
import { SkeletonLoader } from '../components/SkeletonLoader';
import {
  Scale,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function TenantPlusPage() {
  const [triageResponse, setTriageResponse] = useState<any | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLegalAidModal, setShowLegalAidModal] = useState<boolean>(false);
  const [isOptimisticLoading, setIsOptimisticLoading] = useState<boolean>(false);
  const [optimisticStatus, setOptimisticStatus] = useState<string>('');

  // Scroll-linked subtle parallax for background ambient depth
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.9]);

  const handleOptimisticStart = (msg: string) => {
    setIsOptimisticLoading(true);
    setOptimisticStatus(msg);
    setErrorMessage(null);
  };

  const handleTriageSuccess = (data: any, imageUrl: string) => {
    setTriageResponse(data);
    setUploadedImageUrl(imageUrl);
    setIsOptimisticLoading(false);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setTriageResponse(null);
    setUploadedImageUrl('');
    setErrorMessage(null);
    setIsOptimisticLoading(false);
    setShowLegalAidModal(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative overflow-x-hidden">
      {/* Scroll-Linked Subtle Parallax Background Ambient Glow */}
      <motion.div
        style={{ y: backgroundY }}
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial from-rose-500/10 via-slate-400/5 to-transparent blur-3xl -z-10 gpu-accelerated"
      />

      {/* Header Bar */}
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
            className="bg-rose-600 text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-xs z-30"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-white" />
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-3 underline font-bold text-rose-100 hover:text-white"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main ref={mainRef} className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isOptimisticLoading ? (
            /* ========================================================== */
            /* OPTIMISTIC SKELETON STATE                                  */
            /* ========================================================== */
            <motion.div
              key="skeleton-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <SkeletonLoader statusMessage={optimisticStatus} />
            </motion.div>
          ) : !triageResponse ? (
            /* ========================================================== */
            /* VIEW 1: HERO & SECURE UPLOAD                               */
            /* ========================================================== */
            <motion.div
              key="upload-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -14 }}
              style={{ opacity: heroOpacity }}
              className="max-w-3xl mx-auto gpu-accelerated"
            >
              {/* Harmonious Typography-Led Hero Section */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200/80 mb-4 shadow-2xs">
                  <Scale className="w-3.5 h-3.5 text-rose-600" />
                  Free & Confidential Legal Triage
                </span>

                <h1 className="text-fluid-hero font-bold tracking-tight text-slate-900 leading-tight">
                  Understand Your Eviction Notice <br />
                  <span className="text-rose-600 font-serif italic font-normal">
                    in Seconds.
                  </span>
                </h1>

                <p className="mt-4 text-fluid-body text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                  Upload a photo of your notice. We calculate your exact court answer deadline, check for common landlord errors that could pause your eviction, and connect you with free legal defense.
                </p>
              </motion.div>

              {/* Upload Dropzone & Jurisdiction Selector */}
              <motion.div variants={itemVariants}>
                <UploadDropzone
                  onTriageComplete={handleTriageSuccess}
                  onOptimisticStart={handleOptimisticStart}
                  onError={(msg) => {
                    setIsOptimisticLoading(false);
                    setErrorMessage(msg);
                  }}
                />
              </motion.div>

              {/* 3D Legal Vault Component */}
              <motion.div variants={itemVariants}>
                <LegalVault3D />
              </motion.div>

              {/* Tenant Rights FAQ Accordion Strip */}
              <motion.div variants={itemVariants} className="mt-8 border-t border-slate-200/80 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Day of Service Excluded
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Under court rules, the countdown clock does not start until the day after you were served.
                    </p>
                  </div>

                  <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Court Holidays Tolled
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Weekends and judicial court holidays never count against your answer window.
                    </p>
                  </div>

                  <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Unlawful Late Fees
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      A notice demanding late charges or utilities can be declared legally defective in court.
                    </p>
                  </div>
                </div>
              </motion.div>
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
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Results Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Triage Analysis Complete
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">
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
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload New Notice</span>
                  </button>
                </div>
              </div>

              {/* Two-Column Grid: Document Inspector + Actionable Defense Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Document Viewer with SVG Overlays */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Project TenantPlus • Confidential Eviction Notice Triage & Defense Engine</span>
          <span className="text-slate-400">Not formal legal representation • Always consult local legal aid</span>
        </div>
      </footer>
    </div>
  );
}
