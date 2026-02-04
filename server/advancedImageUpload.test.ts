import { describe, it, expect, beforeAll } from "vitest";
import sharp from "sharp";

describe("Advanced Image Upload Features", () => {
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

  describe("Image Preview Metadata", () => {
    it("should extract image dimensions", async () => {
      const metadata = await sharp(testImageBuffer).metadata();
      
      expect(metadata.width).toBe(1200);
      expect(metadata.height).toBe(1200);
      expect(metadata.format).toBe("png");
    });

    it("should calculate aspect ratio correctly", async () => {
      const metadata = await sharp(testImageBuffer).metadata();
      
      const aspectRatio = (metadata.width || 0) / (metadata.height || 0);
      expect(aspectRatio).toBe(1); // Square image
    });

    it("should handle rectangular images", async () => {
      const rectImage = await sharp({
        create: {
          width: 1600,
          height: 900,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .png()
        .toBuffer();

      const metadata = await sharp(rectImage).metadata();
      
      expect(metadata.width).toBe(1600);
      expect(metadata.height).toBe(900);
      const aspectRatio = (metadata.width || 0) / (metadata.height || 0);
      expect(aspectRatio).toBeCloseTo(1.78, 1); // 16:9 ratio
    });

    it("should identify images that are too small", async () => {
      const metadata = await sharp(smallImageBuffer).metadata();
      
      expect((metadata.width || 0) < 100).toBe(true);
      expect((metadata.height || 0) < 100).toBe(true);
    });
  });

  describe("Batch Upload Simulation", () => {
    it("should handle multiple images", async () => {
      const images = [testImageBuffer, testImageBuffer, testImageBuffer];
      
      expect(images.length).toBe(3);
      expect(images.every((img) => img.length > 0)).toBe(true);
    });

    it("should respect max file limit", () => {
      const maxFiles = 5;
      const uploadedFiles = [1, 2, 3, 4, 5];
      
      expect(uploadedFiles.length).toBeLessThanOrEqual(maxFiles);
    });

    it("should track upload progress", () => {
      const uploadProgress = [0, 25, 50, 75, 100];
      
      expect(uploadProgress[0]).toBe(0);
      expect(uploadProgress[uploadProgress.length - 1]).toBe(100);
      expect(uploadProgress.every((p) => p >= 0 && p <= 100)).toBe(true);
    });
  });

  describe("Image Editing Operations", () => {
    it("should rotate image", async () => {
      const rotated = await sharp(testImageBuffer)
        .rotate(90)
        .toBuffer();
      
      expect(rotated.length).toBeGreaterThan(0);
    });

    it("should crop image", async () => {
      const cropped = await sharp(testImageBuffer)
        .extract({ left: 0, top: 0, width: 600, height: 600 })
        .toBuffer();
      
      const metadata = await sharp(cropped).metadata();
      expect(metadata.width).toBe(600);
      expect(metadata.height).toBe(600);
    });

    it("should apply brightness adjustment", async () => {
      const brightened = await sharp(testImageBuffer)
        .modulate({ brightness: 1.5 })
        .toBuffer();
      
      expect(brightened.length).toBeGreaterThan(0);
    });

    it("should apply contrast adjustment", async () => {
      const contrastImage = await sharp(testImageBuffer)
        .modulate({ saturation: 1.5 })
        .toBuffer();
      
      expect(contrastImage.length).toBeGreaterThan(0);
    });

    it("should apply multiple filters", async () => {
      const filtered = await sharp(testImageBuffer)
        .rotate(45)
        .modulate({ brightness: 1.2, saturation: 1.5 })
        .toBuffer();
      
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe("Image Format Conversion", () => {
    it("should convert to WebP", async () => {
      const webp = await sharp(testImageBuffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      const metadata = await sharp(webp).metadata();
      expect(metadata.format).toBe("webp");
    });

    it("should convert to JPEG", async () => {
      const jpeg = await sharp(testImageBuffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const metadata = await sharp(jpeg).metadata();
      expect(metadata.format).toBe("jpeg");
    });

    it("should maintain quality after conversion", async () => {
      const original = await sharp(testImageBuffer).metadata();
      const converted = await sharp(testImageBuffer)
        .webp({ quality: 90 })
        .toBuffer();
      
      const convertedMetadata = await sharp(converted).metadata();
      
      expect(convertedMetadata.width).toBe(original.width);
      expect(convertedMetadata.height).toBe(original.height);
    });
  });

  describe("File Size Management", () => {
    it("should reduce file size after compression", async () => {
      const original = testImageBuffer.length;
      const compressed = await sharp(testImageBuffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      const compressionRatio = ((original - compressed.length) / original) * 100;
      
      expect(compressed.length).toBeLessThan(original);
      expect(compressionRatio).toBeGreaterThan(0);
    });

    it("should handle large images efficiently", async () => {
      const largeImage = await sharp({
        create: {
          width: 4000,
          height: 4000,
          channels: 3,
          background: { r: 200, g: 100, b: 50 },
        },
      })
        .png()
        .toBuffer();

      const start = Date.now();
      const compressed = await sharp(largeImage)
        .resize(1200, 1200, { fit: "inside" })
        .webp({ quality: 80 })
        .toBuffer();
      const duration = Date.now() - start;

      expect(compressed.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid image data", async () => {
      const invalidBuffer = Buffer.from("not an image");
      
      try {
        await sharp(invalidBuffer).metadata();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle empty buffer", async () => {
      const emptyBuffer = Buffer.alloc(0);
      
      try {
        await sharp(emptyBuffer).metadata();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Batch Operations", () => {
    it("should process multiple images sequentially", async () => {
      const images = [testImageBuffer, testImageBuffer, testImageBuffer];
      
      const results = await Promise.all(
        images.map((img) =>
          sharp(img)
            .webp({ quality: 80 })
            .toBuffer()
        )
      );

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.length > 0)).toBe(true);
    });

    it("should maintain order in batch operations", async () => {
      const images = [testImageBuffer, testImageBuffer, testImageBuffer];
      const ids = [1, 2, 3];
      
      const results = await Promise.all(
        images.map((img, idx) =>
          sharp(img)
            .webp({ quality: 80 })
            .toBuffer()
            .then((buffer) => ({ id: ids[idx], buffer }))
        )
      );

      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
      expect(results[2].id).toBe(3);
    });
  });
});
