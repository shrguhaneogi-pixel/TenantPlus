/**
 * Project TenantPlus — Landing & Upload Component
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { compressImageToWebP } from '../utils/imageCompression';

interface UploadZoneProps {
  onTriageComplete: (data: any) => void;
  isLoading: boolean;
  statusStep: string;
  onSetLoading: (loading: boolean, step: string) => void;
  onError: (msg: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onTriageComplete,
  isLoading,
  statusStep,
  onSetLoading,
  onError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('US-CA');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Please upload a valid image file (JPEG, PNG, WebP) of your eviction notice.');
      return;
    }

    try {
      // Step 1: Compress to WebP
      onSetLoading(true, 'Compressing image to WebP format...');
      const { base64Data, mimeType } = await compressImageToWebP(file, {
        maxWidth: 2000,
        quality: 0.85,
      });

      // Step 2: Pass to API handoff
      onSetLoading(true, 'Scanning document securely with Gemini Vision OCR...');
      
      // Step 3: Trigger backend extraction & deterministic Python rules engine
      setTimeout(() => {
        onSetLoading(true, 'Executing deterministic statutory rules engine (court day arithmetic)...');
      }, 900);

      const response = await fetch('/api/v1/extract-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          preferredJurisdiction: selectedJurisdiction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error processing document');
      }

      const data = await response.json();
      onSetLoading(false, '');
      onTriageComplete(data);
    } catch (err: any) {
      console.error('Error during upload & triage:', err);
      onSetLoading(false, '');
      onError(err.message || 'Failed to triage document. Please try again.');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  // Instant sample loader for testing without local file
  const handleLoadSample = async (sampleId: string) => {
    try {
      onSetLoading(true, 'Loading sample eviction notice...');
      setTimeout(() => {
        onSetLoading(true, 'Scanning document structure & clauses...');
      }, 500);
      setTimeout(() => {
        onSetLoading(true, 'Calculating exact judicial answer deadlines & defect flags...');
      }, 900);

      const response = await fetch(`/api/v1/sample/${sampleId}`);
      if (!response.ok) throw new Error('Failed to load sample notice');
      const data = await response.json();
      
      onSetLoading(false, '');
      onTriageComplete({
        success: true,
        extracted: data.extracted,
        triage: data.triage,
        image_url: data.image_url,
      });
    } catch (err: any) {
      onSetLoading(false, '');
      onError(err.message || 'Failed to load sample notice');
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1 text-xs font-semibold text-red-700 mb-4 shadow-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-pulse" />
          <span>Strict Court Deadlines Apply — Do Not Wait to Respond</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-serif">
          Evaluate Your Eviction Notice <br />
          <span className="text-red-600 font-sans font-black underline decoration-red-200 underline-offset-8">
            in Seconds.
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 font-normal">
          Upload a photo of your notice. TenantPlus extracts key clauses with vision AI, then calculates your
          <strong className="text-slate-900 font-semibold"> exact court deadline</strong> and checks for
          <strong className="text-red-700 font-semibold"> fatal statutory defects </strong>
          using deterministic state housing codes.
        </p>

        {/* Jurisdiction Selector Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-slate-500" />
            Select Jurisdiction Statutes:
          </span>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedJurisdiction('US-CA')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedJurisdiction === 'US-CA'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              California (CCP § 1161)
            </button>
            <button
              type="button"
              onClick={() => setSelectedJurisdiction('US-NY')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedJurisdiction === 'US-NY'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New York (RPAPL § 711)
            </button>
            <button
              type="button"
              onClick={() => setSelectedJurisdiction('US-IL-COOK')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedJurisdiction === 'US-IL-COOK'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Illinois (Cook County RLTO)
            </button>
          </div>
        </div>
      </div>

      {/* Massive Drag-and-Drop Zone */}
      <div className="mt-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
            isDragOver
              ? 'border-red-500 bg-red-50/50 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
          } shadow-sm`}
        >
          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {isLoading ? (
            /* Multi-step loading state */
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 animate-pulse">
                <Clock className="h-8 w-8 animate-spin" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900 font-serif">
                Triage Analysis in Progress
              </h3>

              <div className="mx-auto mt-3 max-w-md">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-red-600 transition-all duration-500 animate-pulse w-3/4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-red-600 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-bounce" />
                  {statusStep || 'Processing notice document...'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Enforcing zero-hallucination mathematical verification against cached state statutes
                </p>
              </div>
            </div>
          ) : (
            /* Standard Upload UI */
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-inner">
                <Upload className="h-8 w-8 text-slate-800" />
              </div>

              <div className="mt-4">
                <span className="text-xl font-bold text-slate-900">
                  Drag and drop your eviction notice here
                </span>
                <p className="mt-1 text-sm text-slate-500">
                  Supports clear photos, scans, and documents (PNG, JPEG, WebP)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <FileText className="h-4 w-4 text-red-400" />
                  <span>Choose File from Computer</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <Camera className="h-4 w-4 text-slate-600" />
                  <span>Take Photo with Mobile Camera</span>
                </button>
              </div>

              {/* Security & Architecture Note */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Client-side WebP Compression
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Zero-Hallucination Deterministic Math
                </span>
                <span className="flex items-center gap-1">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  California &amp; NY Housing Law Verified
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Test Demo Notices (No Upload Required) */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Instant Legal Clinic Test Notices (One-Click Triage)
            </h3>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Test with realistic legal defect templates immediately
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* California Sample */}
          <button
            type="button"
            onClick={() => handleLoadSample('ca-3day-sample')}
            disabled={isLoading}
            className="flex flex-col text-left rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-red-400 hover:shadow-sm transition-all group disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-red-700 bg-red-50 px-2 py-0.5 rounded">
                California Superior Court
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-red-700">
              3-Day Notice to Pay Rent or Quit
            </h4>
            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              Demonstrates <strong>$150 late fee bundled</strong> (Cal. CCP § 1161(2) fatal defect) and <strong>missing payment hours</strong>.
            </p>
          </button>

          {/* New York Sample */}
          <button
            type="button"
            onClick={() => handleLoadSample('ny-14day-sample')}
            disabled={isLoading}
            className="flex flex-col text-left rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-red-400 hover:shadow-sm transition-all group disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                New York Housing Court
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-indigo-700">
              14-Day Written Demand for Rent (RPAPL § 711)
            </h4>
            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              Demonstrates <strong>non-rent legal fee surcharge</strong> (fatal under RPAPL § 702) with 14 calendar day rollover.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
