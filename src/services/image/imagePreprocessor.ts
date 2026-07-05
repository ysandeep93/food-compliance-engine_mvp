/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessedImage {
  originalFile: File;
  uploadFile: File;
  wasResized: boolean;
  originalWidth: number;
  originalHeight: number;
  uploadWidth: number;
  uploadHeight: number;
}

/**
 * Interface representing a processor that can run as part of the preprocessing pipeline.
 * This makes it simple to extend the pipeline in the future (e.g., Blur detection,
 * Glare detection, Auto Crop) without changing any callers.
 */
export interface ImageProcessor {
  name: string;
  process: (context: PreprocessContext) => Promise<PreprocessContext>;
}

export interface PreprocessContext {
  file: File;
  width: number;
  height: number;
  wasResized: boolean;
  metadata: Record<string, any>;
}

export class ImagePreprocessorService {
  private processors: ImageProcessor[] = [];

  constructor() {
    // Register default processors in order.
    // Future processors (e.g. BlurDetector, PerspectiveCorrector) can be inserted here.
    this.processors.push(new ResizeAndCompressProcessor());
  }

  /**
   * Registers a new image processor to the pipeline.
   */
  public registerProcessor(processor: ImageProcessor) {
    this.processors.push(processor);
  }

  /**
   * Runs the preprocessing pipeline on the given image file.
   */
  public async preprocess(file: File): Promise<ProcessedImage> {
    // Safe bypass for non-images (e.g. PDF files, which some workflows might upload)
    if (!file.type.startsWith('image/')) {
      return {
        originalFile: file,
        uploadFile: file,
        wasResized: false,
        originalWidth: 0,
        originalHeight: 0,
        uploadWidth: 0,
        uploadHeight: 0,
      };
    }

    try {
      const { width: originalWidth, height: originalHeight } = await getImageDimensions(file);

      let context: PreprocessContext = {
        file,
        width: originalWidth,
        height: originalHeight,
        wasResized: false,
        metadata: {},
      };

      // Run registered processors sequentially
      for (const processor of this.processors) {
        context = await processor.process(context);
      }

      return {
        originalFile: file,
        uploadFile: context.file,
        wasResized: context.wasResized,
        originalWidth,
        originalHeight,
        uploadWidth: context.width,
        uploadHeight: context.height,
      };
    } catch (err) {
      console.error('Error during image preprocessing, fallback to original:', err);
      // Fallback: Return original file in case of any processing failure (highly resilient)
      return {
        originalFile: file,
        uploadFile: file,
        wasResized: false,
        originalWidth: 0,
        originalHeight: 0,
        uploadWidth: 0,
        uploadHeight: 0,
      };
    }
  }
}

/**
 * Loads image to retrieve its natural dimensions in a browser environment.
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for dimension extraction.'));
    };
    img.src = url;
  });
}

/**
 * Core processor that resizes images ONLY if their longest side exceeds 2560px,
 * preserving aspect ratio, and then encodes them to JPEG at 0.95 quality.
 */
class ResizeAndCompressProcessor implements ImageProcessor {
  public name = 'ResizeAndCompress';

  public async process(context: PreprocessContext): Promise<PreprocessContext> {
    const { file, width, height } = context;
    const maxDimension = 2560;

    const longestSide = Math.max(width, height);
    // If the image's longest dimension doesn't exceed 2560, do NOT resize or compress it.
    if (longestSide <= maxDimension) {
      return context;
    }

    // Calculate aspect-ratio-preserving dimensions
    let targetWidth = width;
    let targetHeight = height;

    if (width > height) {
      targetWidth = maxDimension;
      targetHeight = Math.round((height * maxDimension) / width);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((width * maxDimension) / height);
    }

    const processedFile = await new Promise<File>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create 2D canvas context.'));
          return;
        }

        // Apply high-quality rendering configuration for clean OCR text preservation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Compress and encode as JPEG at 0.95 quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(processed);
            } else {
              reject(new Error('Failed to convert canvas to blob.'));
            }
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image element inside processor.'));
      };
      img.src = url;
    });

    return {
      ...context,
      file: processedFile,
      width: targetWidth,
      height: targetHeight,
      wasResized: true,
    };
  }
}

export const preprocessor = new ImagePreprocessorService();
