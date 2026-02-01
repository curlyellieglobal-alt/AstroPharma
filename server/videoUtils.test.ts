import { describe, it, expect } from "vitest";

// Video utility functions (inline for testing)
function convertToYouTubeEmbed(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  let videoId = "";
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) videoId = youtuBeMatch[1];
  const watchMatch = url.match(/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) videoId = watchMatch[1];
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(url)) videoId = url;
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) return url;
  return url;
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getVideoMimeType(url: string): string {
  if (url.endsWith(".mp4")) return "video/mp4";
  if (url.endsWith(".webm")) return "video/webm";
  if (url.endsWith(".ogg")) return "video/ogg";
  if (url.endsWith(".mov")) return "video/quicktime";
  if (url.endsWith(".avi")) return "video/x-msvideo";
  return "video/mp4";
}

describe("Video Utilities", () => {
  describe("convertToYouTubeEmbed", () => {
    it("should convert youtu.be short URL to embed format", () => {
      const result = convertToYouTubeEmbed("https://youtu.be/62U5bsiUX7o");
      expect(result).toBe("https://www.youtube.com/embed/62U5bsiUX7o");
    });

    it("should convert youtube.com/watch URL to embed format", () => {
      const result = convertToYouTubeEmbed(
        "https://www.youtube.com/watch?v=62U5bsiUX7o"
      );
      expect(result).toBe("https://www.youtube.com/embed/62U5bsiUX7o");
    });

    it("should handle already embed URL", () => {
      const embedUrl = "https://www.youtube.com/embed/62U5bsiUX7o";
      const result = convertToYouTubeEmbed(embedUrl);
      expect(result).toBe(embedUrl);
    });

    it("should handle video ID directly", () => {
      const result = convertToYouTubeEmbed("62U5bsiUX7o");
      expect(result).toBe("https://www.youtube.com/embed/62U5bsiUX7o");
    });

    it("should handle MP4 video file URL", () => {
      const url = "https://example.com/video.mp4";
      const result = convertToYouTubeEmbed(url);
      expect(result).toBe(url);
    });

    it("should handle WebM video file URL", () => {
      const url = "https://example.com/video.webm";
      const result = convertToYouTubeEmbed(url);
      expect(result).toBe(url);
    });

    it("should return empty string for empty input", () => {
      const result = convertToYouTubeEmbed("");
      expect(result).toBe("");
    });
  });

  describe("isVideoFile", () => {
    it("should detect MP4 files", () => {
      expect(isVideoFile("https://example.com/video.mp4")).toBe(true);
      expect(isVideoFile("video.mp4")).toBe(true);
    });

    it("should detect WebM files", () => {
      expect(isVideoFile("https://example.com/video.webm")).toBe(true);
      expect(isVideoFile("video.webm")).toBe(true);
    });

    it("should detect OGG files", () => {
      expect(isVideoFile("https://example.com/video.ogg")).toBe(true);
      expect(isVideoFile("video.ogg")).toBe(true);
    });

    it("should detect MOV files", () => {
      expect(isVideoFile("https://example.com/video.mov")).toBe(true);
      expect(isVideoFile("video.mov")).toBe(true);
    });

    it("should detect AVI files", () => {
      expect(isVideoFile("https://example.com/video.avi")).toBe(true);
      expect(isVideoFile("video.avi")).toBe(true);
    });

    it("should not detect YouTube URLs as video files", () => {
      expect(isVideoFile("https://youtu.be/62U5bsiUX7o")).toBe(false);
      expect(isVideoFile("https://www.youtube.com/watch?v=62U5bsiUX7o")).toBe(
        false
      );
    });

    it("should not detect regular URLs as video files", () => {
      expect(isVideoFile("https://example.com")).toBe(false);
    });
  });

  describe("isYouTubeUrl", () => {
    it("should detect youtube.com URLs", () => {
      expect(isYouTubeUrl("https://www.youtube.com/watch?v=62U5bsiUX7o")).toBe(
        true
      );
    });

    it("should detect youtu.be URLs", () => {
      expect(isYouTubeUrl("https://youtu.be/62U5bsiUX7o")).toBe(true);
    });

    it("should not detect non-YouTube URLs", () => {
      expect(isYouTubeUrl("https://example.com/video.mp4")).toBe(false);
      expect(isYouTubeUrl("https://vimeo.com/123456")).toBe(false);
    });
  });

  describe("getVideoMimeType", () => {
    it("should return correct MIME type for MP4", () => {
      expect(getVideoMimeType("video.mp4")).toBe("video/mp4");
    });

    it("should return correct MIME type for WebM", () => {
      expect(getVideoMimeType("video.webm")).toBe("video/webm");
    });

    it("should return correct MIME type for OGG", () => {
      expect(getVideoMimeType("video.ogg")).toBe("video/ogg");
    });

    it("should return correct MIME type for MOV", () => {
      expect(getVideoMimeType("video.mov")).toBe("video/quicktime");
    });

    it("should return correct MIME type for AVI", () => {
      expect(getVideoMimeType("video.avi")).toBe("video/x-msvideo");
    });

    it("should return default MIME type for unknown format", () => {
      expect(getVideoMimeType("video.unknown")).toBe("video/mp4");
    });
  });
});
