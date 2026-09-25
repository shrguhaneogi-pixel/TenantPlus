'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 font-serif">Something went wrong</h2>
        <p className="text-sm text-slate-600 mb-6">{error.message || 'An unexpected error occurred during notice triage.'}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
