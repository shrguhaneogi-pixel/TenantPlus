/**
 * Project TenantPlus — Overhauled Upload & Jurisdiction Selector Component
 * Module: frontend/components/UploadDropzone.tsx
 * 
 * Features:
 * 1. Optimistic UI response: instant visual feedback & skeleton transition on upload or 1-click sample click
 * 2. Hardware-accelerated motion (strictly transform & opacity)
 * 3. Fluid typography & clean segmented state controls (CA, NY, IL)
 * 4. Client-side WebP document image compression via HTML5 Canvas
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
  Zap,
} from 'lucide-react';

interface UploadDropzoneProps {
  onTriageComplete: (data: any, imageUrl: string) => void;
  onOptimisticStart?: (message: string) => void;
  onError: (msg: string) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onTriageComplete,
  onOptimisticStart,
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
      const initialMsg = 'Preparing document securely & compressing WebP canvas...';
      setStatusMessage(initialMsg);
      if (onOptimisticStart) onOptimisticStart(initialMsg);

      const { blob: compressedBlob, dataUrl } = await compressToWebP(file);

      const stepMsg = `Scanning notice clauses under ${selectedState === 'CA' ? 'California' : selectedState === 'NY' ? 'New York' : 'Illinois'} court rules...`;
      setStatusMessage(stepMsg);
      if (onOptimisticStart) onOptimisticStart(stepMsg);

      const t1 = setTimeout(() => {
        const msg = 'Evaluating statutory defects (late fees, missing payment hours, service rules)...';
        setStatusMessage(msg);
        if (onOptimisticStart) onOptimisticStart(msg);
      }, 700);

      const formData = new FormData();
      const compressedFile = new File([compressedBlob], 'notice.webp', { type: 'image/webp' });
      formData.append('file', compressedFile);

      const response = await fetch(`/api/v1/extract-notice?state=${selectedState}`, {
        method: 'POST',
        body: formData,
      });

      clearTimeout(t1);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Unable to analyze the notice. Please ensure the photo is clear and readable.');
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
   * 1-Click Clinic Sample Notice Loader with Optimistic Feedback
   */
  const handleLoadSample = async (stateKey: string) => {
    try {
      setIsLoading(true);
      setSelectedState(stateKey);
      const msg = `Loading verified clinic sample notice for ${stateKey === 'CA' ? 'California' : stateKey === 'NY' ? 'New York' : 'Illinois'}...`;
      setStatusMessage(msg);
      if (onOptimisticStart) onOptimisticStart(msg);

      const sampleTitle = stateKey === 'NY' ? '14-DAY NOTICE TO QUIT FOR NONPAYMENT OF RENT' : stateKey === 'IL' ? '5-DAY NOTICE TO TERMINATE TENANCY' : '3-DAY NOTICE TO PAY RENT OR QUIT';
      const statuteRef = stateKey === 'NY' ? 'RPAPL § 711' : stateKey === 'IL' ? '735 ILCS 5/9-209' : 'CCP § 1161';
      
      const sampleBlob = new Blob(
        [
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1100" width="100%" height="100%">
            <rect width="850" height="1100" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
            <text x="425" y="90" font-size="24" font-weight="bold" text-anchor="middle" fill="#0f172a">
              ${sampleTitle}
            </text>
            <text x="50" y="150" font-size="14" fill="#334155">TO: Jane Doe, Tenant in Possession</text>
            <text x="50" y="180" font-size="14" fill="#334155">PREMISES: 742 Evergreen Terrace, Apt 4B</text>
            <rect x="45" y="210" width="760" height="75" fill="#fef2f2" stroke="#f87171" stroke-dasharray="4"/>
            <text x="60" y="240" font-size="14" font-weight="bold" fill="#991b1b">
              DATE OF SERVICE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </text>
            <text x="60" y="265" font-size="12" fill="#7f1d1d">
              Service method: Substituted service with mailing. Day of service excluded under court rules.
            </text>
            <rect x="45" y="310" width="760" height="115" fill="#f8fafc" stroke="#cbd5e1"/>
            <text x="60" y="345" font-size="15" font-weight="bold" fill="#0f172a">AMOUNT DEMANDED: $2,450.00</text>
            <text x="60" y="375" font-size="13" fill="#64748b">Base Past-Due Rent: $2,300.00</text>
            <text x="60" y="398" font-size="13" font-weight="bold" fill="#dc2626">Late Fee Surcharge: $150.00 (FATAL DEFECT: Impermissible under statutory law)</text>
            <text x="50" y="460" font-size="12" fill="#334155">
              Statutory notice period governed by ${statuteRef}. Within designated period, pay demanded amount or vacate.
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
      {/* State / Jurisdiction Segmented Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 px-3 py-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          Select Court Jurisdiction:
        </span>

        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
          {JURISDICTIONS.map((j) => {
            const isSelected = selectedState === j.code;
            return (
              <motion.button
                key={j.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setSelectedState(j.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{j.name} ({j.code})</span>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-rose-300' : 'text-slate-500'}`}>
                  {j.noticePeriod}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Drag and Drop Target */}
      <motion.div
        whileHover={{ scale: isLoading ? 1 : 1.005 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-rose-500 bg-rose-50/70 shadow-md'
            : 'border-slate-300/80 bg-white hover:border-slate-400 hover:bg-slate-50/50 shadow-xs'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,.pdf"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs">
            <Upload className="h-7 w-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Drop your notice photo here, or <span className="text-rose-600 underline">browse</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Supports PNG, JPG, or WebP. Auto-compressed in browser for privacy.
            </p>
          </div>

          {/* Action Buttons: Browse File or Take Photo */}
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              <FileText className="h-4 w-4 text-rose-400" />
              <span>Select File</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Camera className="h-4 w-4 text-slate-500" />
              <span>Take Photo</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1-Click Clinic Sample Notice Loader Strip */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-slate-800">
              Try Instant Demo (No upload needed):
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleLoadSample('CA')}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors text-center"
            >
              CA 3-Day Notice Sample
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('NY')}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors text-center"
            >
              NY 14-Day Notice Sample
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
