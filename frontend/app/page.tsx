/**
 * Project TenantPlus — Next.js Main Triage Page (FIX 7)
 * Module: frontend/app/page.tsx
 * 
 * Integrates:
 * 1. UploadDropzone (WebP compression, jurisdiction state selector & status bar)
 * 2. DocumentViewer (Interactive SVG coordinate overlay with ResizeObserver)
 * 3. ResultsDashboard (Urgent red countdown timer & statutory defects card)
 */

'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '../components/UploadDropzone';
import { DocumentViewer } from '../components/DocumentViewer';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { Scale, RotateCcw, AlertTriangle } from 'lucide-react';

export default function TenantPlusPage() {
  const [triageResponse, setTriageResponse] = useState<any | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTriageSuccess = (data: any, imageUrl: string) => {
    setTriageResponse(data);
    setUploadedImageUrl(imageUrl);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setTriageResponse(null);
    setUploadedImageUrl('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 py-3.5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Scale className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 font-serif">
                TENANT<span className="text-red-600 font-sans font-bold">PLUS</span>
              </span>
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 uppercase">
                Hybrid Deterministic Engine
              </span>
            </div>
          </div>

          {triageResponse && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Evaluate New Notice</span>
            </button>
          )}
        </div>
      </header>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-2 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!triageResponse ? (
          /* PAGE 1: Upload & Compression */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl font-serif">
                Evaluate Your Eviction Notice <br />
                <span className="text-red-600 font-sans font-black underline decoration-red-200 underline-offset-8">
                  in Seconds.
                </span>
              </h1>
              <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
                AI Vision OCR extracts key clauses and spatial coordinates.
                All mathematical deadlines and legal defect checks are executed deterministically
                in Python using cached state housing statutes and judicial holiday calendars.
              </p>
            </div>

            <UploadDropzone
              onTriageComplete={handleTriageSuccess}
              onError={(msg) => setErrorMessage(msg)}
            />
          </div>
        ) : (
          /* PAGE 2: Two-Column Triage Dashboard */
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-serif">
                  Triage Analysis Results
                </h2>
                <p className="text-xs text-slate-500">
                  Notice Type: <strong className="text-slate-800">{triageResponse.data?.notice_type}</strong> • State: <strong className="text-slate-800">{triageResponse.data?.jurisdiction_state}</strong> • Service Date: <strong className="text-slate-800">{triageResponse.data?.service_date}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Document Viewer */}
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
                  onOpenLegalAid={() => alert(`Connecting with legal aid hotline`)}
                  onOpenBrief={() => window.print()}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Project TenantPlus • Hybrid Deterministic Eviction Notice Triage
      </footer>
    </div>
  );
}
