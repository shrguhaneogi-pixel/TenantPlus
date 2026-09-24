/**
 * Project TenantPlus — Client-side Image Compression Engine
 * Compresses uploaded eviction notice images or photos to WebP format using HTML5 Canvas.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<{ base64Data: string; mimeType: string; originalSize: number; compressedSize: number }> {
  const { maxWidth = 2000, maxHeight = 2600, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Crisp document rendering smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export to WebP format
        let webpDataUri = canvas.toDataURL('image/webp', quality);
        let mimeType = 'image/webp';

        // Fallback to JPEG if browser does not support WebP canvas export
        if (!webpDataUri.startsWith('data:image/webp')) {
          webpDataUri = canvas.toDataURL('image/jpeg', quality);
          mimeType = 'image/jpeg';
        }

        const originalSize = file.size;
        // Calculate rough byte size of base64
        const compressedSize = Math.round((webpDataUri.length * 3) / 4);

        resolve({
          base64Data: webpDataUri,
          mimeType,
          originalSize,
          compressedSize,
        });
      };

      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read uploaded file'));
    reader.readAsDataURL(file);
  });
}
