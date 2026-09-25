/**
 * Project TenantPlus — SVG Bounding Box Document Viewer
 * Module: frontend/components/DocumentViewer.tsx
 * 
 * Implements ResizeObserver & GPU-accelerated SVG layers to map normalized bounding boxes (0.0 to 1.0)
 * to rendered image pixel coordinates with high-contrast glassmorphism tooltips.
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Eye, Info, ZoomIn, ZoomOut, Maximize2, ShieldAlert } from 'lucide-react';
import { scaleBoundingBox, BoundingBoxInput } from '../utils/coordinateScaler';

interface DocumentViewerProps {
  imageUrl: string;
  dateBoundingBox?: BoundingBoxInput;
  amountBoundingBox?: BoundingBoxInput;
  additionalBoxes?: BoundingBoxInput[];
}

interface PixelBox {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  label: string;
  text: string;
  isDefect: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  imageUrl,
  dateBoundingBox,
  amountBoundingBox,
  additionalBoxes = [],
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [hoveredBox, setHoveredBox] = useState<PixelBox | null>(null);
  const [zoom, setZoom] = useState(1.0);

  const updateRenderedDimensions = () => {
    if (imgRef.current) {
      const renderedWidth = imgRef.current.clientWidth || imgRef.current.offsetWidth;
      const renderedHeight = imgRef.current.clientHeight || imgRef.current.offsetHeight;
      if (renderedWidth > 0 && renderedHeight > 0) {
        setImgDimensions({ width: renderedWidth, height: renderedHeight });
      }
    }
  };

  useEffect(() => {
    updateRenderedDimensions();

    const observer = new ResizeObserver(() => {
      updateRenderedDimensions();
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    window.addEventListener('resize', updateRenderedDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateRenderedDimensions);
    };
  }, [imageUrl, zoom]);

  // Recalculate pixel boxes using coordinateScaler utility
  const pixelBoxes: PixelBox[] = useMemo(() => {
    const { width, height } = imgDimensions;
    if (width === 0 || height === 0) return [];

    const result: PixelBox[] = [];

    if (dateBoundingBox) {
      const scaled = scaleBoundingBox(dateBoundingBox, width, height);
      result.push({
        id: 'box-date',
        ...scaled,
        label: dateBoundingBox.label || 'SERVICE_DATE',
        text: dateBoundingBox.text_content || 'Service Date Clause',
        isDefect: false,
      });
    }

    if (amountBoundingBox) {
      const scaled = scaleBoundingBox(amountBoundingBox, width, height);
      result.push({
        id: 'box-amount',
        ...scaled,
        label: amountBoundingBox.label || 'DEMANDED_AMOUNT',
        text: amountBoundingBox.text_content || 'Financial Demand Clause',
        isDefect: true,
      });
    }

    additionalBoxes.forEach((box, i) => {
      const scaled = scaleBoundingBox(box, width, height);
      result.push({
        id: `box-additional-${i}`,
        ...scaled,
        label: box.label || 'CLAUSE',
        text: box.text_content || 'Notice Clause',
        isDefect: false,
      });
    });

    return result;
  }, [imgDimensions, dateBoundingBox, amountBoundingBox, additionalBoxes]);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden gpu-accelerated">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Interactive Clause Inspection
          </span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {pixelBoxes.length} Overlays Active
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.15))}
            className="rounded p-1 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono font-medium text-slate-600 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="rounded p-1 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            className="rounded p-1 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Document Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-slate-900/5 p-4 flex items-center justify-center min-h-[480px] max-h-[700px]"
      >
        <div
          className="relative transition-transform duration-150 origin-top shadow-lg rounded-xl overflow-hidden bg-white"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Base Notice Image */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Eviction Notice"
            onLoad={updateRenderedDimensions}
            className="block max-w-full h-auto select-none pointer-events-none"
            style={{ maxHeight: '660px', objectFit: 'contain' }}
          />

          {/* SVG Overlay Absolutely Positioned Matching Image Pixel Dimensions */}
          {imgDimensions.width > 0 && imgDimensions.height > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                width: imgDimensions.width,
                height: imgDimensions.height,
              }}
            >
              {pixelBoxes.map((box) => {
                const isHovered = hoveredBox?.id === box.id;
                const strokeColor = box.isDefect ? '#DC2626' : '#2563EB';
                const fillColor = box.isDefect
                  ? 'rgba(220, 38, 38, 0.20)'
                  : 'rgba(37, 99, 235, 0.15)';

                return (
                  <g
                    key={box.id}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setHoveredBox(box)}
                    onMouseLeave={() => setHoveredBox(null)}
                  >
                    <rect
                      x={box.left}
                      y={box.top}
                      width={box.width}
                      height={box.height}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 3 : 2}
                      strokeDasharray={box.isDefect ? '4 2' : 'none'}
                      rx={4}
                      className="transition-all duration-150"
                    />

                    {/* Badge Label Tag */}
                    <rect
                      x={box.left}
                      y={Math.max(0, box.top - 20)}
                      width={Math.min(160, box.label.length * 8 + 16)}
                      height={18}
                      fill={box.isDefect ? '#DC2626' : '#2563EB'}
                      rx={3}
                    />
                    <text
                      x={box.left + 6}
                      y={Math.max(12, box.top - 6)}
                      fill="#FFFFFF"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {box.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Glassmorphic Interactive Hover Tooltip Bar */}
      <div className="border-t border-slate-200 bg-slate-50/90 backdrop-blur-md px-4 py-2.5 text-xs text-slate-700 min-h-[42px] flex items-center justify-between">
        {hoveredBox ? (
          <div className="flex items-center gap-2">
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase text-white ${
                hoveredBox.isDefect ? 'bg-rose-600' : 'bg-blue-600'
              }`}
            >
              {hoveredBox.label}
            </span>
            <span className="font-semibold text-slate-900">{hoveredBox.text}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Hover or click on highlighted bounding box overlays to inspect extracted notice clauses.</span>
          </div>
        )}
      </div>
    </div>
  );
};
