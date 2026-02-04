import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { createMsw } from "@mswjs/core";

describe("chat.uploadMedia", () => {
  let caller: any;

  beforeAll(async () => {
    // Create a mock context
    const mockContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    // Get the tRPC caller
    caller = appRouter.createCaller(mockContext);
  });

  it("should upload image media successfully", async () => {
    // Create a simple PNG image (1x1 pixel)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, // IHDR chunk size
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, etc.
      0x90, 0x77, 0x53, 0xde, // CRC
      0x00, 0x00, 0x00, 0x0c, // IDAT chunk size
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xfe, 0xff,
      0x00, 0x00, 0x00, 0x02,
      0x00, 0x01, // CRC
      0x49, 0x45, 0x4e, 0x44, // IEND
      0xae, 0x42, 0x60, 0x82, // CRC
    ]);

    const base64Image = pngBuffer.toString("base64");

    try {
      const result = await caller.chat.uploadMedia({
        conversationId: 1,
        fileData: `data:image/png;base64,${base64Image}`,
        fileName: "test.png",
        mimeType: "image/png",
        messageType: "image",
      });

      expect(result).toBeDefined();
      expect(result.mediaUrl).toBeDefined();
      expect(result.deduplicated).toBe(false);
      expect(result.mediaUrl).toContain("http");
    } catch (error: any) {
      console.error("Upload error:", error);
      throw error;
    }
  });

  it("should reject invalid messageType", async () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00,
      0x90, 0x77, 0x53, 0xde,
    ]);

    const base64Image = pngBuffer.toString("base64");

    try {
      await caller.chat.uploadMedia({
        conversationId: 1,
        fileData: `data:image/png;base64,${base64Image}`,
        fileName: "test.png",
        mimeType: "image/png",
        messageType: "invalid" as any,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid");
    }
  });

  it("should reject mismatched MIME type", async () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00,
      0x90, 0x77, 0x53, 0xde,
    ]);

    const base64Image = pngBuffer.toString("base64");

    try {
      await caller.chat.uploadMedia({
        conversationId: 1,
        fileData: `data:image/png;base64,${base64Image}`,
        fileName: "test.png",
        mimeType: "audio/webm", // Wrong MIME type for image
        messageType: "image",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid file type");
    }
  });

  it("should handle base64 data with and without data URL prefix", async () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00,
      0x90, 0x77, 0x53, 0xde,
    ]);

    const base64Image = pngBuffer.toString("base64");

    // Test with data URL prefix
    try {
      const result1 = await caller.chat.uploadMedia({
        conversationId: 1,
        fileData: `data:image/png;base64,${base64Image}`,
        fileName: "test1.png",
        mimeType: "image/png",
        messageType: "image",
      });
      expect(result1.mediaUrl).toBeDefined();
    } catch (error) {
      console.error("Error with data URL prefix:", error);
      throw error;
    }

    // Test without data URL prefix
    try {
      const result2 = await caller.chat.uploadMedia({
        conversationId: 1,
        fileData: base64Image,
        fileName: "test2.png",
        mimeType: "image/png",
        messageType: "image",
      });
      expect(result2.mediaUrl).toBeDefined();
    } catch (error) {
      console.error("Error without data URL prefix:", error);
      throw error;
    }
  });
});
