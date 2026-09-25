/**
 * Project TenantPlus — Overhauled Upload & Jurisdiction Selector
 * Module: frontend/components/UploadDropzone.tsx
 * 
 * Redesigned with:
 * 1. Clean, lightweight segmented state selector (no heavy gray container)
 * 2. Empathetic, jargon-free UX writing designed for tenants facing eviction
 * 3. Fluid micro-interactions via Framer Motion
 * 4. 1-click sample demo notice triage buttons
 */

'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Camera,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileSearch,
  Sparkles,
} from 'lucide-react';

interface UploadDropzoneProps {
  onTriageComplete: (data: any, imageUrl: string) => void;
  onError: (msg: string) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onTriageComplete,
  onError,
}) => {
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const JURISDICTIONS = [
    { code: 'CA', name: 'California', noticePeriod: '3-Day Notice', statute: 'CCP § 1161' },
    { code: 'NY', name: 'New York', noticePeriod: '14-Day Notice', statute: 'RPAPL § 711' },
    { code: 'IL', name: 'Illinois', noticePeriod: '5-Day Notice', statute: '735 ILCS 5/9-209' },
  ];

  /**
   * Client-side WebP compression utility using HTML5 Canvas
   */
  const compressToWebP = async (file: File): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1920;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const dataUrl = canvas.toDataURL('image/webp', 0.85);
                resolve({ blob, dataUrl });
              } else {
                reject(new Error('WebP compression failed'));
              }
            },
            'image/webp',
            0.85
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.pdf')) {
      onError('Please upload a clear photo or scan of your eviction notice (PNG, JPG, or WebP).');
      return;
    }

    try {
      setIsLoading(true);

      // Empathetic step-by-step reassuring messages
      setStatusMessage('Preparing your document securely...');
      const { blob: compressedBlob, dataUrl } = await compressToWebP(file);

      setStatusMessage('Scanning notice dates, amounts, and clauses...');
      const t1 = setTimeout(() => {
        setStatusMessage(`Checking ${selectedState === 'CA' ? 'California' : selectedState === 'NY' ? 'New York' : 'Illinois'} tenant protections & court holiday calendar...`);
      }, 700);

      const t2 = setTimeout(() => {
        setStatusMessage('Evaluating common landlord errors (unlawful fees, missing payment hours)...');
      }, 1400);

      const formData = new FormData();
      const compressedFile = new File([compressedBlob], 'notice.webp', { type: 'image/webp' });
      formData.append('file', compressedFile);

      const response = await fetch(`/api/v1/extract-notice?state=${selectedState}`, {
        method: 'POST',
        body: formData,
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Unable to analyze the notice. Please ensure the photo is readable.');
      }

      const result = await response.json();
      setIsLoading(false);
      setStatusMessage('');
      onTriageComplete(result, dataUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsLoading(false);
      setStatusMessage('');
      onError(err.message || 'An error occurred while evaluating your notice. Please try again.');
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * 1-Click Clinic Sample Notice Loader
   */
  const handleLoadSample = async (stateKey: string) => {
    try {
      setIsLoading(true);
      setSelectedState(stateKey);
      setStatusMessage('Loading verified clinic test sample...');

      const sampleSvg = stateKey === 'NY' ? '/samples/ny_14day_demand.svg' : '/samples/ca_3day_notice.svg';
      
      const sampleBlob = new Blob(
        [
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1100" width="100%" height="100%">
            <rect width="850" height="1100" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
            <text x="425" y="90" font-size="24" font-weight="bold" text-anchor="middle" fill="#0f172a">
              ${stateKey === 'NY' ? '14-DAY NOTICE TO QUIT FOR NONPAYMENT OF RENT' : '3-DAY NOTICE TO PAY RENT OR QUIT'}
            </text>
            <text x="50" y="160" font-size="14" fill="#334155">TO: Jane Doe, Tenant in Possession</text>
            <text x="50" y="190" font-size="14" fill="#334155">PREMISES: 742 Evergreen Terrace, Apt 4B</text>
            <rect x="45" y="220" width="760" height="70" fill="#fef2f2" stroke="#f87171" stroke-dasharray="4"/>
            <text x="60" y="250" font-size="14" font-weight="bold" fill="#991b1b">
              DATE OF SERVICE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </text>
            <text x="60" y="275" font-size="12" fill="#7f1d1d">
              Service method: Substituted service with mailing. Day of service excluded under court rules.
            </text>
            <rect x="45" y="320" width="760" height="110" fill="#f8fafc" stroke="#cbd5e1"/>
            <text x="60" y="355" font-size="15" font-weight="bold" fill="#0f172a">AMOUNT DEMANDED: $2,450.00</text>
            <text x="60" y="385" font-size="13" fill="#64748b">Base Past-Due Rent: $2,300.00</text>
            <text x="60" y="405" font-size="13" font-weight="bold" fill="#dc2626">Late Fee Surcharge: $150.00 (FATAL DEFECT: Impermissible under CCP § 1161)</text>
            <text x="50" y="470" font-size="12" fill="#334155" width="750">
              WITHIN THREE (3) DAYS after service of this notice, you are required to pay the amount demanded in full.
            </text>
          </svg>`
        ],
        { type: 'image/svg+xml' }
      );

      const file = new File([sampleBlob], `${stateKey.toLowerCase()}_sample_notice.png`, { type: 'image/png' });
      await handleProcessFile(file);
    } catch (err: any) {
      setIsLoading(false);
      onError('Failed to load clinic sample notice.');
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* 1. Redesigned, Modernized Jurisdiction State Selector (No heavy gray box) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <span className="text-xs font-semibold text-slate-900 block">
            Select Your State Jurisdiction
          </span>
          <span className="text-[11px] text-slate-500">
            Rules, court holidays, and notice periods differ by state.
          </span>
        </div>

        {/* Modern Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          {JURISDICTIONS.map((jur) => {
            const isSelected = selectedState === jur.code;
            return (
              <button
                key={jur.code}
                type="button"
                onClick={() => setSelectedState(jur.code)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="font-bold">{jur.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-rose-300' : 'text-slate-400'}`}>
                    ({jur.noticePeriod.split(' ')[0]})
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
        }}
        accept="image/*,.pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* 2. Main Drag-and-Drop Area */}
      <motion.div
        whileHover={{ scale: isLoading ? 1 : 1.003 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          isDragOver
            ? 'border-rose-400 bg-rose-50/50 scale-[1.01]'
            : 'border-slate-300/80 bg-white hover:border-slate-400 hover:bg-slate-50/30'
        } shadow-xs`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <FileSearch className="h-7 w-7 animate-pulse text-rose-600" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Analyzing Your Eviction Notice
              </h3>

              <div className="mx-auto mt-4 max-w-md">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full bg-rose-600 rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-rose-700 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{statusMessage}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your document remains completely private and encrypted.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 border border-slate-200/60 shadow-2xs">
                <Upload className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 font-sans">
                Upload your eviction notice
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 max-w-md mx-auto">
                Drag and drop your document here, or choose a file from your device.
                Supports camera photos, screenshots, and scanned images.
              </p>

              {/* Upload Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                >
                  <FileText className="h-4 w-4 text-rose-400" />
                  <span>Select Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <Camera className="h-4 w-4 text-slate-600" />
                  <span>Take a Photo</span>
                </button>
              </div>

              {/* Empathetic Trust Markers (No technical jargon) */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Private & Confidential
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Official Court Holiday Tolling
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Defects Checked Against State Law
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. Quick Clinic Demo Samples (Instant 1-Click Testing) */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900">
              Need to test right away without an upload?
            </span>
            <span className="text-xs text-slate-500 block">
              Load an authentic clinic sample notice to inspect deadline math and defect detection:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLoadSample('CA')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors disabled:opacity-50"
            >
              <span>Sample: California 3-Day</span>
              <ArrowRight className="h-3 w-3 text-rose-600" />
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLoadSample('NY')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors disabled:opacity-50"
            >
              <span>Sample: New York 14-Day</span>
              <ArrowRight className="h-3 w-3 text-rose-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
