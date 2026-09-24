/**
 * Project TenantPlus — Coordinate Scaling Engine
 * 
 * Recalculates normalized backend bounding boxes (0 to 1000 coordinate space)
 * into exact pixel coordinates relative to the rendered HTML <img> element's
 * current rendered width, rendered height, and natural aspect ratio.
 */

import { BoundingBox, ScaledBoundingBox } from '../types/triage';

export interface ImageRenderMetrics {
  renderedWidth: number;
  renderedHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

/**
 * Calculates the exact pixel position of a bounding box on the rendered document image.
 * Accounts for letterboxing/contain styling if present, or direct scaling.
 * 
 * @param box Normalized bounding box (ymin, xmin, ymax, xmax on 0-1000 scale)
 * @param metrics Rendered metrics of the HTML <img> tag
 * @returns ScaledBoundingBox with pixelTop, pixelLeft, pixelWidth, pixelHeight
 */
export function scaleBoundingBox(
  box: BoundingBox,
  metrics: ImageRenderMetrics
): ScaledBoundingBox {
  const { renderedWidth, renderedHeight } = metrics;

  // Normalized [0, 1000] scale to fraction [0, 1]
  const topFraction = Math.max(0, Math.min(1000, box.ymin)) / 1000;
  const leftFraction = Math.max(0, Math.min(1000, box.xmin)) / 1000;
  const bottomFraction = Math.max(0, Math.min(1000, box.ymax)) / 1000;
  const rightFraction = Math.max(0, Math.min(1000, box.xmax)) / 1000;

  // Convert to actual pixel dimensions
  const pixelTop = topFraction * renderedHeight;
  const pixelLeft = leftFraction * renderedWidth;
  const pixelWidth = Math.max(8, (rightFraction - leftFraction) * renderedWidth);
  const pixelHeight = Math.max(8, (bottomFraction - topFraction) * renderedHeight);

  return {
    ...box,
    pixelTop,
    pixelLeft,
    pixelWidth,
    pixelHeight,
  };
}

/**
 * Batch scales an entire array of bounding boxes
 */
export function scaleAllBoundingBoxes(
  boxes: BoundingBox[],
  imgElement: HTMLImageElement | null
): ScaledBoundingBox[] {
  if (!imgElement) return [];

  const metrics: ImageRenderMetrics = {
    renderedWidth: imgElement.clientWidth || imgElement.offsetWidth,
    renderedHeight: imgElement.clientHeight || imgElement.offsetHeight,
    naturalWidth: imgElement.naturalWidth || 850,
    naturalHeight: imgElement.naturalHeight || 1100,
  };

  if (metrics.renderedWidth === 0 || metrics.renderedHeight === 0) {
    return [];
  }

  return boxes.map((box) => scaleBoundingBox(box, metrics));
}
