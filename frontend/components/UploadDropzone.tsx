/**
 * Project TenantPlus — Upload & Compression Component (FIX 7)
 * Module: frontend/components/UploadDropzone.tsx
 * 
 * Features:
 * 1. Client-side HTML5 Canvas WebP compression utility
 * 2. Mobile camera capture and drag-and-drop zone
 * 3. State selector (CA, NY, IL) passed to FastAPI
 * 4. Stepwise progress status bar
 */

'use client';

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
  const [selectedState, setSelectedState] = useState<string>('CA');
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
      setStatusMessage('Uploading compressed WebP payload...');

      // Step 3: AI Vision OCR
      setTimeout(() => {
        setStatusMessage('Scanning document with Gemini Vision & Antigravity Agent...');
      }, 600);

      // Step 4: Cross-referencing Local Statutes
      setTimeout(() => {
        setStatusMessage(`Cross-referencing ${selectedState} statutes & court holiday calendar...`);
      }, 1200);

      const formData = new FormData();
      const compressedFile = new File([compressedBlob], 'notice.webp', { type: 'image/webp' });
      formData.append('file', compressedFile);

      const response = await fetch(`/api/v1/extract-notice?state=${selectedState}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to extract notice data');
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

  return (
    <div className="w-full">
      {/* State Selector Toolbar */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-100 p-2.5 border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Select Jurisdiction State:
        </span>
        <div className="flex items-center gap-1.5">
          {['CA', 'NY', 'IL'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedState(st)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                selectedState === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {st === 'CA' ? 'California (CA)' : st === 'NY' ? 'New York (NY)' : 'Illinois (IL)'}
            </button>
          ))}
        </div>
      </div>

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
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 animate-pulse">
              <Clock className="h-8 w-8 animate-spin" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900 font-serif">
              Triage Pipeline Active ({selectedState})
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
                Enforcing strict separation: Gemini Vision OCR vs Python Calendar Arithmetic
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
              Supports JPEG, PNG, WebP images for {selectedState} jurisdiction
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
                <Sparkles className="h-4 w-4 text-emerald-600" /> Antigravity Agent OCR
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-emerald-600" /> Zero-LLM Court Holiday Math
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
