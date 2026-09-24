/**
 * Project TenantPlus — Legal Aid & Tenant Clinic Directory Modal
 */

import React from 'react';
import { Phone, Globe, MapPin, X, ShieldAlert, HeartHandshake, ExternalLink } from 'lucide-react';
import { TriageResult } from '../types/triage';

interface LegalAidModalProps {
  isOpen: boolean;
  onClose: () => void;
  triage: TriageResult;
}

export const LegalAidModal: React.FC<LegalAidModalProps> = ({
  isOpen,
  onClose,
  triage,
}) => {
  if (!isOpen) return null;

  const legalAidDirectory = [
    {
      jurisdiction: 'US-CA',
      name: 'Eviction Defense Collaborative (EDC) & LA Tenants Union',
      hotline: '1-888-804-3536',
      website: 'https://www.lawhelpca.org',
      services: 'Free emergency answer filing, tenant counseling, representation at mandatory settlement conferences.',
      fee: '100% Free for qualifying tenants',
    },
    {
      jurisdiction: 'US-CA',
      name: 'Legal Aid Foundation of Los Angeles (LAFLA)',
      hotline: '1-800-399-4529',
      website: 'https://lafla.org/get-help/housing-and-eviction',
      services: 'Direct legal representation, motion to quash defective 3-day notices, trial defense.',
      fee: 'Free for low-income tenants',
    },
    {
      jurisdiction: 'US-NY',
      name: 'The Legal Aid Society — NYC Housing Rights Campaign',
      hotline: '1-212-962-4795',
      website: 'https://legalaidnyc.org',
      services: 'Universal Right to Counsel in NYC Housing Court. Representation on defective 14-day demands.',
      fee: 'Free under NYC Right to Counsel Law',
    },
    {
      jurisdiction: 'US-IL-COOK',
      name: 'Legal Aid Chicago & Metropolitan Tenants Organization',
      hotline: '1-312-341-1070',
      website: 'https://www.legalaidchicago.org',
      services: 'Cook County Early Resolution Program (ERP), Chicago RLTO defense, emergency rent relief navigation.',
      fee: 'Free legal representation',
    },
  ];

  const matched = legalAidDirectory.filter(
    (item) => item.jurisdiction === triage.jurisdiction_id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="font-bold text-base">Free Tenant Legal Aid &amp; Defense Directory</h3>
              <p className="text-xs text-slate-300">
                Matched to: {triage.jurisdiction_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Important Advice Box */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">Act Before Your Notice Period Expires:</strong>
              Even if a notice contains fatal defects, once a landlord files an Unlawful Detainer in court, you have strictly <strong>5 court days</strong> to file a written legal Answer to prevent a default judgment and sheriff lockout.
            </div>
          </div>

          {/* Directory Listings */}
          <div className="space-y-3">
            {matched.map((clinic, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-xs transition-all bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{clinic.name}</h4>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 shrink-0">
                    {clinic.fee}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {clinic.services}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                  <a
                    href={`tel:${clinic.hotline.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Hotline: {clinic.hotline}</span>
                  </a>

                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    <span>Intake Portal</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
