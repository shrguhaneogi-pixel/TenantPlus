/**
 * Project TenantPlus — Interactive Document Viewer with SVG Overlay
 * 
 * Scaled SVG bounding boxes aligned to HTML <img> element.
 * Interactive popovers and tooltips for clause inspection and defect explanation.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertOctagon,
  Info,
  CheckCircle,
  Eye,
  Filter,
  X,
} from 'lucide-react';
import { BoundingBox, ScaledBoundingBox } from '../types/triage';
import { scaleAllBoundingBoxes } from '../utils/coordinateScaler';

interface DocumentViewerProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  activeDefectBoxId?: string | null;
  onSelectBox?: (boxId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  imageUrl,
  boundingBoxes,
  activeDefectBoxId,
  onSelectBox,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [filterMode, setFilterMode] = useState<'ALL' | 'DEFECTS_ONLY' | 'FINANCIALS' | 'DATES'>('ALL');
  const [hoveredBox, setHoveredBox] = useState<ScaledBoundingBox | null>(null);
  const [selectedBox, setSelectedBox] = useState<ScaledBoundingBox | null>(null);
  const [scaledBoxes, setScaledBoxes] = useState<ScaledBoundingBox[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Recalculate scaled bounding boxes whenever image resizes or zoom changes
  const recalculateCoordinates = () => {
    if (!imgRef.current) return;
    const scaled = scaleAllBoundingBoxes(boundingBoxes, imgRef.current);
    setScaledBoxes(scaled);
  };

  useEffect(() => {
    recalculateCoordinates();
    window.addEventListener('resize', recalculateCoordinates);
    return () => window.removeEventListener('resize', recalculateCoordinates);
  }, [boundingBoxes, zoomLevel, imgLoaded]);

  // If a defect was clicked in the right column, highlight and scroll to the bounding box
  useEffect(() => {
    if (activeDefectBoxId && scaledBoxes.length > 0) {
      const match = scaledBoxes.find((b) => b.box_id === activeDefectBoxId);
      if (match) {
        setSelectedBox(match);
      }
    }
  }, [activeDefectBoxId, scaledBoxes]);

  // Filter boxes based on user toggle
  const visibleBoxes = useMemo(() => {
    if (filterMode === 'DEFECTS_ONLY') {
      return scaledBoxes.filter((b) => b.is_defect || b.severity === 'FATAL' || b.severity === 'HIGH');
    }
    if (filterMode === 'FINANCIALS') {
      return scaledBoxes.filter((b) => b.label.includes('RENT') || b.label.includes('LATE_FEE') || b.label.includes('AMOUNT'));
    }
    if (filterMode === 'DATES') {
      return scaledBoxes.filter((b) => b.label.includes('DATE') || b.label.includes('SERVICE') || b.label.includes('TIME'));
    }
    return scaledBoxes;
  }, [scaledBoxes, filterMode]);

  const handleBoxClick = (box: ScaledBoundingBox) => {
    setSelectedBox(box);
    if (onSelectBox) {
      onSelectBox(box.box_id);
    }
  };

  const getBoxColor = (box: ScaledBoundingBox) => {
    const isFatal = box.severity === 'FATAL' || box.is_defect;
    const isHigh = box.severity === 'HIGH';
    const isWarning = box.severity === 'MEDIUM';

    if (isFatal) {
      return {
        stroke: '#DC2626', // Red
        fill: 'rgba(220, 38, 38, 0.16)',
        badgeBg: 'bg-red-600',
        textColor: 'text-red-700',
        borderColor: 'border-red-500',
      };
    }
    if (isHigh || isWarning) {
      return {
        stroke: '#D97706', // Amber
        fill: 'rgba(217, 119, 6, 0.14)',
        badgeBg: 'bg-amber-600',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-500',
      };
    }
    return {
      stroke: '#2563EB', // Blue
      fill: 'rgba(37, 99, 235, 0.10)',
      badgeBg: 'bg-blue-600',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-400',
    };
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Viewer Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Interactive Document Inspection
          </span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {visibleBoxes.length} Clause Overlays
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'ALL' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Clauses
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('DEFECTS_ONLY')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              filterMode === 'DEFECTS_ONLY'
                ? 'bg-red-600 text-white font-semibold'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <AlertOctagon className="h-3 w-3" />
            Fatal Defects
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('FINANCIALS')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterMode === 'FINANCIALS' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rent &amp; Fees
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-slate-600 w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1.0)}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 transition-colors ml-1"
            title="Reset Zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center min-h-[550px] max-h-[750px]"
      >
        <div
          className="relative transition-transform duration-150 origin-top shadow-xl rounded-lg overflow-hidden bg-white"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Document Image */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Eviction Notice Document"
            onLoad={() => {
              setImgLoaded(true);
              recalculateCoordinates();
            }}
            className="block max-w-full h-auto select-none pointer-events-none"
            style={{ maxHeight: '700px', objectFit: 'contain' }}
          />

          {/* Interactive Absolute SVG Overlay */}
          {imgLoaded && imgRef.current && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                width: imgRef.current.clientWidth || '100%',
                height: imgRef.current.clientHeight || '100%',
              }}
            >
              {visibleBoxes.map((box) => {
                const colors = getBoxColor(box);
                const isHovered = hoveredBox?.box_id === box.box_id;
                const isSelected = selectedBox?.box_id === box.box_id;

                return (
                  <g key={box.box_id} className="pointer-events-auto cursor-pointer">
                    {/* Bounding Box Rect */}
                    <rect
                      x={box.pixelLeft}
                      y={box.pixelTop}
                      width={box.pixelWidth}
                      height={box.pixelHeight}
                      fill={isHovered || isSelected ? colors.fill.replace('0.1', '0.25') : colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.75}
                      strokeDasharray={box.is_defect ? '4 2' : 'none'}
                      rx={3}
                      onMouseEnter={() => setHoveredBox(box)}
                      onMouseLeave={() => setHoveredBox(null)}
                      onClick={() => handleBoxClick(box)}
                      className="transition-all duration-150"
                    />

                    {/* Badge Indicator */}
                    <g
                      transform={`translate(${box.pixelLeft + 4}, ${box.pixelTop - 11})`}
                      className="pointer-events-none"
                    >
                      <rect
                        width={Math.min(180, box.label.length * 6.5 + 16)}
                        height={16}
                        rx={3}
                        fill={colors.stroke}
                      />
                      <text
                        x={8}
                        y={11}
                        fill="#FFFFFF"
                        fontSize={8.5}
                        fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                        letterSpacing="0.5"
                      >
                        {box.label.replace(/_/g, ' ')}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Interactive Popover Card for Hovered or Selected Clause */}
          {(selectedBox || hoveredBox) && (
            <div
              className="absolute z-30 pointer-events-auto rounded-xl border border-slate-300 bg-white p-4 shadow-2xl transition-all duration-150 max-w-sm"
              style={{
                top: Math.max(10, Math.min(((selectedBox || hoveredBox)?.pixelTop || 0) + 20, 480)),
                left: Math.max(10, Math.min(((selectedBox || hoveredBox)?.pixelLeft || 0), 260)),
              }}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  {(selectedBox || hoveredBox)?.is_defect ? (
                    <AlertOctagon className="h-4 w-4 text-red-600 flex-shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {(selectedBox || hoveredBox)?.label.replace(/_/g, ' ')}
                  </span>
                </div>
                {selectedBox && (
                  <button
                    type="button"
                    onClick={() => setSelectedBox(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Clause Extracted Content */}
              <div className="mt-2.5">
                <div className="rounded bg-slate-50 p-2 text-xs font-mono text-slate-800 border border-slate-200">
                  &ldquo;{(selectedBox || hoveredBox)?.clause_text}&rdquo;
                </div>
              </div>

              {/* Plain English Legal Evaluation */}
              <div className="mt-2 text-xs text-slate-700 leading-relaxed">
                <strong className={`font-semibold block mb-0.5 ${
                  (selectedBox || hoveredBox)?.is_defect ? 'text-red-700' : 'text-slate-900'
                }`}>
                  {(selectedBox || hoveredBox)?.is_defect ? 'Statutory Defect Analysis:' : 'Legal Significance:'}
                </strong>
                {(selectedBox || hoveredBox)?.plain_english_explanation}
              </div>

              {/* Defect Dismissal Tag */}
              {(selectedBox || hoveredBox)?.is_defect && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-800 border border-red-200">
                  <CheckCircle className="h-3 w-3 text-red-600" />
                  <span>Grounds for Court Dismissal / Defense Answer</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Helper Legend Footnote */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 gap-2">
        <span className="font-medium">
          💡 Click or hover any highlighted box to reveal statutory defect analysis and court defense rationale.
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Fatal Defect
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> High Caution
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Standard Clause
          </span>
        </div>
      </div>
    </div>
  );
};
