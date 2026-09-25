/**
 * Project TenantPlus — Frontend Viewport Coordinate Scaler (FIX 6)
 * Module: frontend/utils/coordinateScaler.ts
 * 
 * Takes backend's normalized float coordinates (0.0 to 1.0) and dynamically
 * maps them against the rendered HTMLImageElement client dimensions (clientWidth / clientHeight)
 * to return absolute pixel coordinates for the SVG bounding box overlays.
 */

export interface BoundingBoxInput {
  ymin: number; // Normalized 0.0 to 1.0
  xmin: number; // Normalized 0.0 to 1.0
  ymax: number; // Normalized 0.0 to 1.0
  xmax: number; // Normalized 0.0 to 1.0
  label?: string;
  text_content?: string;
}

export interface ScaledPixelBox {
  left: number;
  top: number;
  width: number;
  height: number;
  label?: string;
  text_content?: string;
}

/**
 * Calculates absolute SVG pixel coordinates matching rendered image dimensions
 */
export function scaleBoundingBox(
  box: BoundingBoxInput,
  renderedWidth: number,
  renderedHeight: number
): ScaledPixelBox {
  if (!box || renderedWidth <= 0 || renderedHeight <= 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  // Handle coordinates scaled 0-1000 instead of 0.0-1.0
  const normYmin = box.ymin > 1.0 ? box.ymin / 1000.0 : box.ymin;
  const normXmin = box.xmin > 1.0 ? box.xmin / 1000.0 : box.xmin;
  const normYmax = box.ymax > 1.0 ? box.ymax / 1000.0 : box.ymax;
  const normXmax = box.xmax > 1.0 ? box.xmax / 1000.0 : box.xmax;

  // Clamp normalized bounds strictly to [0.0, 1.0]
  const clampedXmin = Math.max(0.0, Math.min(1.0, normXmin));
  const clampedXmax = Math.max(0.0, Math.min(1.0, normXmax));
  const clampedYmin = Math.max(0.0, Math.min(1.0, normYmin));
  const clampedYmax = Math.max(0.0, Math.min(1.0, normYmax));

  // Compute absolute viewport pixel positions
  const left = Math.round(clampedXmin * renderedWidth);
  const top = Math.round(clampedYmin * renderedHeight);
  const rawWidth = (clampedXmax - clampedXmin) * renderedWidth;
  const rawHeight = (clampedYmax - clampedYmin) * renderedHeight;

  // Ensure minimum dimensions so boxes are visible
  const width = Math.max(12, Math.round(rawWidth));
  const height = Math.max(12, Math.round(rawHeight));

  return {
    left,
    top,
    width,
    height,
    label: box.label,
    text_content: box.text_content,
  };
}
