/**
 * Project TenantPlus — SVG Bounding Box Document Viewer (PHASE 5)
 * Module: frontend/components/DocumentViewer.tsx
 * 
 * CRITICAL MATH IMPLEMENTATION:
 * Implements ResizeObserver & onLoad listener to dynamically scale normalized
 * bounding box coordinates (0.0 to 1.0) to the exact rendered pixel dimensions of the <img> tag.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Eye, Info, AlertOctagon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export interface BoundingBoxCoord {
  ymin: number; // 0.0 to 1.0
  xmin: number; // 0.0 to 1.0
  ymax: number; // 0.0 to 1.0
  xmax: number; // 0.0 to 1.0
  label?: string;
  text_content?: string;
}

interface DocumentViewerProps {
  imageUrl: string;
  dateBoundingBox?: BoundingBoxCoord;
  amountBoundingBox?: BoundingBoxCoord;
  additionalBoxes?: BoundingBoxCoord[];
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

  // CRITICAL MATH: Recalculate pixel coordinates based on rendered width & height
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

    // Listen for window resize and container resizing via ResizeObserver
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

  // Transform normalized (0.0 to 1.0) coordinates to screen pixels
  const pixelBoxes: PixelBox[] = useMemo(() => {
    const { width, height } = imgDimensions;
    if (width === 0 || height === 0) return [];

    const result: PixelBox[] = [];

    const mapBox = (box: BoundingBoxCoord, id: string, defaultLabel: string, defaultText: string, isDefect: boolean) => {
      // Normalize values in case they are scaled 0-1000 instead of 0.0-1.0
      const normYmin = box.ymin > 1.0 ? box.ymin / 1000 : box.ymin;
      const normXmin = box.xmin > 1.0 ? box.xmin / 1000 : box.xmin;
      const normYmax = box.ymax > 1.0 ? box.ymax / 1000 : box.ymax;
      const normXmax = box.xmax > 1.0 ? box.xmax / 1000 : box.xmax;

      const top = Math.max(0, normYmin * height);
      const left = Math.max(0, normXmin * width);
      const boxWidth = Math.max(12, (normXmax - normXmin) * width);
      const boxHeight = Math.max(12, (normYmax - normYmin) * height);

      return {
        id,
        top,
        left,
        width: boxWidth,
        height: boxHeight,
        label: box.label || defaultLabel,
        text: box.text_content || defaultText,
        isDefect,
      };
    };

    if (dateBoundingBox) {
      result.push(
        mapBox(dateBoundingBox, 'box-date', 'SERVICE_DATE', 'Service Date Clause', false)
      );
    }

    if (amountBoundingBox) {
      result.push(
        mapBox(amountBoundingBox, 'box-amount', 'DEMANDED_RENT', 'Financial Demand & Breakdown', true)
      );
    }

    additionalBoxes.forEach((box, i) => {
      result.push(
        mapBox(box, `box-additional-${i}`, box.label || 'CLAUSE', box.text_content || 'Notice Clause', false)
      );
    });

    return result;
  }, [imgDimensions, dateBoundingBox, amountBoundingBox, additionalBoxes]);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Interactive Clause Overlay
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
            className="rounded p-1 text-slate-600 hover:bg-slate-200"
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
            className="rounded p-1 text-slate-600 hover:bg-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            className="rounded p-1 text-slate-600 hover:bg-slate-200"
            title="Reset Zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Document Viewer Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-slate-900/5 p-4 flex items-center justify-center min-h-[500px] max-h-[720px]"
      >
        <div
          className="relative transition-transform duration-150 origin-top shadow-lg rounded-lg overflow-hidden bg-white"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Base Notice Image */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Eviction Notice"
            onLoad={updateRenderedDimensions}
            className="block max-w-full h-auto select-none pointer-events-none"
            style={{ maxHeight: '680px', objectFit: 'contain' }}
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
                  ? 'rgba(220, 38, 38, 0.18)'
                  : 'rgba(37, 99, 235, 0.12)';

                return (
                  <g key={box.id} className="pointer-events-auto cursor-pointer">
                    {/* Interactive Rect */}
                    <rect
                      x={box.left}
                      y={box.top}
                      width={box.width}
                      height={box.height}
                      fill={isHovered ? fillColor.replace('0.18', '0.35') : fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 3.5 : 2}
                      strokeDasharray={box.isDefect ? '4 2' : 'none'}
                      rx={3}
                      onMouseEnter={() => setHoveredBox(box)}
                      onMouseLeave={() => setHoveredBox(null)}
                      className="transition-all duration-150"
                    />

                    {/* Badge Label */}
                    <g transform={`translate(${box.left + 4}, ${box.top - 12})`}>
                      <rect
                        width={Math.min(180, box.label.length * 6.5 + 16)}
                        height={16}
                        rx={3}
                        fill={strokeColor}
                      />
                      <text
                        x={8}
                        y={11}
                        fill="#FFFFFF"
                        fontSize={8.5}
                        fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                      >
                        {box.label.replace(/_/g, ' ')}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Popover / Tooltip when Box is Hovered */}
          {hoveredBox && (
            <div
              className="absolute z-30 pointer-events-auto rounded-xl border border-slate-300 bg-white p-3.5 shadow-2xl transition-all duration-150 max-w-xs"
              style={{
                top: Math.max(10, Math.min(hoveredBox.top + 20, imgDimensions.height - 180)),
                left: Math.max(10, Math.min(hoveredBox.left, imgDimensions.width - 280)),
              }}
            >
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                {hoveredBox.isDefect ? (
                  <AlertOctagon className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                )}
                <span className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  {hoveredBox.label.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="mt-2 text-xs font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                &ldquo;{hoveredBox.text}&rdquo;
              </p>

              <p className="mt-1.5 text-[11px] text-slate-600 leading-normal">
                {hoveredBox.isDefect
                  ? 'Subject to strict statutory review. In California, non-rent fees (late charges) bundled into notice invalidate unlawful detainer.'
                  : 'Stated date on notice face used for zero-hallucination court-day counting.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
