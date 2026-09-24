/**
 * Project TenantPlus — Upload & Compression Component (PHASE 4)
 * Module: frontend/components/UploadDropzone.tsx
 * 
 * Features:
 * 1. Drag-and-drop zone & mobile camera capture
 * 2. HTML5 Canvas WebP compression to minimize payload
 * 3. Stepwise progress status: "Compressing..." -> "Uploading..." -> "Scanning..." -> "Cross-referencing..."
 */

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Camera, FileText, Sparkles, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface UploadDropzoneProps {
  onTriageComplete: (data: any, imageUrl: string) => void;
  onError: (msg: string) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onTriageComplete,
  onError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      onError('Please upload an eviction notice image (PNG, JPG, or WebP).');
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Compressing
      setStatusMessage('Compressing image to WebP format...');
      const { blob: compressedBlob, dataUrl } = await compressToWebP(file);

      // Step 2: Uploading
      setStatusMessage('Uploading to secure triage bridge...');

      // Step 3: AI Vision OCR
      setTimeout(() => {
        setStatusMessage('Scanning document with Gemini Vision & Antigravity Agent...');
      }, 700);

      // Step 4: Cross-referencing Local Statutes
      setTimeout(() => {
        setStatusMessage('Cross-referencing local statutes & judicial day calendar (Zero LLM Math)...');
      }, 1400);

      // Make POST request to endpoint
      const response = await fetch('/api/v1/extract-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: 'image/webp',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.error || 'Failed to extract notice data');
      }

      const result = await response.json();
      setIsLoading(false);
      setStatusMessage('');
      onTriageComplete(result, dataUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsLoading(false);
      setStatusMessage('');
      onError(err.message || 'An error occurred while evaluating the notice.');
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Instant sample notice for testing
  const handleLoadSampleNotice = async (sampleId: string) => {
    try {
      setIsLoading(true);
      setStatusMessage('Loading verified statutory eviction sample...');
      setTimeout(() => {
        setStatusMessage('Scanning document with Gemini Vision & Antigravity Agent...');
      }, 500);
      setTimeout(() => {
        setStatusMessage('Cross-referencing local statutes & judicial day calendar...');
      }, 900);

      const res = await fetch(`/api/v1/sample/${sampleId}`);
      if (!res.ok) throw new Error('Failed to load sample');
      const sample = await res.json();
      setIsLoading(false);
      setStatusMessage('');
      onTriageComplete(
        {
          success: true,
          data: sample.triage,
          extraction: sample.extracted,
        },
        sample.image_url
      );
    } catch (err: any) {
      setIsLoading(false);
      onError(err.message || 'Failed to load sample');
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
        }}
        accept="image/*"
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

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          isDragOver
            ? 'border-red-500 bg-red-50/60 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        } shadow-sm`}
      >
        {isLoading ? (
          /* Multi-step progress indicator */
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 animate-pulse">
              <Clock className="h-8 w-8 animate-spin" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900 font-serif">
              Triage Pipeline Active
            </h3>

            <div className="mx-auto mt-3 max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-red-600 transition-all duration-500 animate-pulse w-4/5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-red-600 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 animate-bounce" />
                {statusMessage}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Enforcing strict separation: AI Vision OCR vs Deterministic Python Math
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 shadow-inner">
              <Upload className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Drag and drop your eviction notice here
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Supports photos and scans (JPEG, PNG, WebP)
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors"
              >
                <FileText className="h-4 w-4 text-red-400" />
                <span>Select File from Device</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Camera className="h-4 w-4 text-slate-600" />
                <span>Snap Photo with Camera</span>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Client-Side WebP Compression
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Google Antigravity Agent OCR
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-emerald-600" /> Deterministic Deadline Arithmetic
              </span>
            </div>
          </div>
        )}
      </div>

      {/* One-Click Sample Notices */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-red-600" />
            Instant Verification Samples
          </span>
          <span className="text-[11px] text-slate-500">Pre-calibrated with statutory defects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleLoadSampleNotice('ca-3day-sample')}
            disabled={isLoading}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-red-400 transition-all group disabled:opacity-60"
          >
            <div>
              <span className="text-[11px] font-bold text-red-700 uppercase block">California CCP § 1161(2)</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-red-700">
                3-Day Notice to Pay or Quit (Bundled Late Fee Defect)
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-600 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleLoadSampleNotice('ny-14day-sample')}
            disabled={isLoading}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-indigo-400 transition-all group disabled:opacity-60"
          >
            <div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase block">New York RPAPL § 711</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                14-Day Demand for Rent (Non-Rent Legal Surcharge)
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
