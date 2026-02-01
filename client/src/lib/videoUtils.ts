/**
 * Convert various YouTube URL formats to embed URL
 * Supports:
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID (already embed)
 * - VIDEO_ID (just the ID)
 */
export function convertToYouTubeEmbed(url: string): string {
  if (!url) return "";

  // If already an embed URL, return as is
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // Extract video ID from various formats
  let videoId = "";

  // Format: https://youtu.be/VIDEO_ID
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) {
    videoId = youtuBeMatch[1];
  }

  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // Format: just the VIDEO_ID
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    videoId = url;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // If it's a direct video file URL (MP4, WebM, etc), return as is
  if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
    return url;
  }

  // Return original URL if we can't convert
  return url;
}

/**
 * Determine if URL is a video file (not YouTube)
 */
export function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

/**
 * Determine if URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Get video type for HTML5 video element
 */
export function getVideoMimeType(url: string): string {
  if (url.endsWith(".mp4")) return "video/mp4";
  if (url.endsWith(".webm")) return "video/webm";
  if (url.endsWith(".ogg")) return "video/ogg";
  if (url.endsWith(".mov")) return "video/quicktime";
  if (url.endsWith(".avi")) return "video/x-msvideo";
  return "video/mp4"; // default
}
