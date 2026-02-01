import sharp from "sharp";

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "webp" | "png";
}

export interface CompressionResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 80,
  format: "webp",
};

/**
 * Compress and optimize image
 * Supports JPEG, PNG, WebP formats
 * Automatically resizes to max dimensions while maintaining aspect ratio
 */
export async function compressImage(
  imageBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = imageBuffer.length;

  try {
    let pipeline = sharp(imageBuffer);

    // Get metadata to check dimensions
    const metadata = await pipeline.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Resize if needed
    if (config.maxWidth || config.maxHeight) {
      pipeline = pipeline.resize(config.maxWidth, config.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Convert to specified format with compression
    let compressed: Buffer;
    let format = config.format || "webp";

    if (format === "jpeg") {
      compressed = await pipeline.jpeg({ quality: config.quality || 80 }).toBuffer();
    } else if (format === "png") {
      compressed = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    } else {
      // Default to WebP
      compressed = await pipeline.webp({ quality: config.quality || 80 }).toBuffer();
      format = "webp";
    }

    // Get final metadata
    const finalMetadata = await sharp(compressed).metadata();
    const finalWidth = finalMetadata.width || width;
    const finalHeight = finalMetadata.height || height;
    const compressedSize = compressed.length;

    return {
      buffer: compressed,
      format,
      width: finalWidth,
      height: finalHeight,
      size: compressedSize,
      originalSize,
      compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
    };
  } catch (error) {
    console.error("Image compression error:", error);
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  imageBuffer: Buffer,
  minWidth: number = 100,
  minHeight: number = 100
): Promise<{ valid: boolean; width: number; height: number; message?: string }> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < minWidth || height < minHeight) {
      return {
        valid: false,
        width,
        height,
        message: `Image dimensions (${width}x${height}) are too small. Minimum required: ${minWidth}x${minHeight}`,
      };
    }

    return { valid: true, width, height };
  } catch (error) {
    return {
      valid: false,
      width: 0,
      height: 0,
      message: `Failed to validate image: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  width: number = 300,
  height: number = 300
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 75 })
      .toBuffer();
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
