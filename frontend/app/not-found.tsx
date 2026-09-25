import React from 'react';
import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
        <Scale className="h-12 w-12 text-slate-800 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 font-serif">Page Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">The requested triage route could not be found.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
        >
          Return to Triage Portal
        </Link>
      </div>
    </div>
  );
}
