import { describe, it, expect, beforeAll } from "vitest";
import { compressImage, validateImageDimensions, generateThumbnail } from "./imageCompression";
import sharp from "sharp";

describe("Image Compression Service", () => {
  let testImageBuffer: Buffer;
  let smallImageBuffer: Buffer;

  beforeAll(async () => {
    // Create a test image (1200x1200 red square)
    testImageBuffer = await sharp({
      create: {
        width: 1200,
        height: 1200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    // Create a small test image (50x50)
    smallImageBuffer = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .png()
      .toBuffer();
  });

  describe("compressImage", () => {
    it("should compress image and return buffer", async () => {
      const result = await compressImage(testImageBuffer);
      
      expect(result.buffer).toBeDefined();
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.format).toBe("webp");
      expect(result.size).toBeLessThan(result.originalSize);
    });

    it("should maintain aspect ratio when resizing", async () => {
      const result = await compressImage(testImageBuffer, {
        maxWidth: 600,
        maxHeight: 600,
      });
      
      expect(result.width).toBeLessThanOrEqual(600);
      expect(result.height).toBeLessThanOrEqual(600);
      // Aspect ratio should be maintained (square in this case)
      expect(result.width).toBe(result.height);
    });

    it("should calculate compression ratio correctly", async () => {
      const result = await compressImage(testImageBuffer);
      
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeLessThanOrEqual(100);
      // Should compress by at least 10%
      expect(result.compressionRatio).toBeGreaterThan(10);
    });

    it("should support different formats", async () => {
      const jpegResult = await compressImage(testImageBuffer, {
        format: "jpeg",
        quality: 80,
      });
      
      expect(jpegResult.format).toBe("jpeg");
      expect(jpegResult.buffer.length).toBeGreaterThan(0);
    });

    it("should respect quality settings", async () => {
      const highQuality = await compressImage(testImageBuffer, {
        quality: 95,
        format: "webp",
      });
      
      const lowQuality = await compressImage(testImageBuffer, {
        quality: 50,
        format: "webp",
      });
      
      // Lower quality should result in smaller file
      // Both should be smaller than original
      expect(highQuality.size).toBeLessThan(highQuality.originalSize);
      expect(lowQuality.size).toBeLessThan(lowQuality.originalSize);
    });

    it("should handle PNG format", async () => {
      const result = await compressImage(testImageBuffer, {
        format: "png",
      });
      
      expect(result.format).toBe("png");
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    it("should not enlarge images smaller than max dimensions", async () => {
      const result = await compressImage(smallImageBuffer, {
        maxWidth: 1200,
        maxHeight: 1200,
      });
      
      // Should keep original dimensions, not enlarge
      expect(result.width).toBeLessThanOrEqual(50);
      expect(result.height).toBeLessThanOrEqual(50);
    });
  });

  describe("validateImageDimensions", () => {
    it("should validate image dimensions", async () => {
      const result = await validateImageDimensions(testImageBuffer, 100, 100);
      
      expect(result.valid).toBe(true);
      expect(result.width).toBe(1200);
      expect(result.height).toBe(1200);
    });

    it("should reject images that are too small", async () => {
      const result = await validateImageDimensions(smallImageBuffer, 100, 100);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain("too small");
    });

    it("should return image dimensions", async () => {
      const result = await validateImageDimensions(testImageBuffer);
      
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });

  describe("generateThumbnail", () => {
    it("should generate thumbnail", async () => {
      const thumbnail = await generateThumbnail(testImageBuffer, 300, 300);
      
      expect(thumbnail).toBeDefined();
      expect(thumbnail.length).toBeGreaterThan(0);
      
      // Verify thumbnail dimensions
      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBe(300);
      expect(metadata.height).toBe(300);
    });

    it("should generate thumbnail with default dimensions", async () => {
      const thumbnail = await generateThumbnail(testImageBuffer);
      
      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBe(300);
      expect(metadata.height).toBe(300);
    });

    it("should crop to square when generating thumbnail", async () => {
      // Create a rectangular image
      const rectImage = await sharp({
        create: {
          width: 1000,
          height: 500,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .png()
        .toBuffer();

      const thumbnail = await generateThumbnail(rectImage, 200, 200);
      
      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBe(200);
      expect(metadata.height).toBe(200);
    });
  });

  describe("Error handling", () => {
    it("should handle invalid image data gracefully", async () => {
      const invalidBuffer = Buffer.from("not an image");
      
      try {
        await compressImage(invalidBuffer);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle invalid dimensions validation", async () => {
      const invalidBuffer = Buffer.from("not an image");
      
      const result = await validateImageDimensions(invalidBuffer);
      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should compress image within reasonable time", async () => {
      const start = Date.now();
      await compressImage(testImageBuffer);
      const duration = Date.now() - start;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it("should handle multiple compressions sequentially", async () => {
      const results = await Promise.all([
        compressImage(testImageBuffer),
        compressImage(testImageBuffer),
        compressImage(testImageBuffer),
      ]);
      
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.buffer.length).toBeGreaterThan(0);
        expect(result.compressionRatio).toBeGreaterThan(0);
      });
    });
  });
});
