/**
 * Media utilities for file hashing, compression, and optimization
 */

/**
 * Calculate SHA-256 hash of a Blob
 * Used for file deduplication
 */
export async function calculateFileHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Compress image using canvas
 * Reduces file size while maintaining reasonable quality
 */
export async function compressImage(blob: Blob, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and compress
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (compressedBlob) => {
          if (!compressedBlob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          
          // Only use compressed version if it's actually smaller
          if (compressedBlob.size < blob.size) {
            console.log(`Image compressed: ${(blob.size / 1024).toFixed(2)}KB → ${(compressedBlob.size / 1024).toFixed(2)}KB (${Math.round((1 - compressedBlob.size / blob.size) * 100)}% reduction)`);
            resolve(compressedBlob);
          } else {
            console.log('Compression did not reduce size, using original');
            resolve(blob);
          }
        },
        blob.type || 'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Compress video by reducing resolution and bitrate
 * Note: This is a placeholder - true video compression requires WebCodecs API or server-side processing
 * For now, we'll just validate size and suggest re-recording if too large
 */
export async function compressVideo(blob: Blob, maxSizeMB = 10): Promise<{ blob: Blob; needsRerecording: boolean }> {
  const sizeMB = blob.size / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    console.warn(`Video size (${sizeMB.toFixed(2)}MB) exceeds recommended ${maxSizeMB}MB`);
    return {
      blob,
      needsRerecording: true
    };
  }
  
  return {
    blob,
    needsRerecording: false
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
