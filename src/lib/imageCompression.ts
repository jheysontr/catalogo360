/**
 * Compresses an image file using Canvas API before uploading to storage.
 * - Resizes to max dimensions while maintaining aspect ratio
 * - Converts to WebP for optimal compression
 * - Returns a compressed File ready for upload
 */

interface CompressOptions {
  /** Max width in pixels (default: 1200) */
  maxWidth?: number;
  /** Max height in pixels (default: 1200) */
  maxHeight?: number;
  /** Quality 0-1 (default: 0.82) */
  quality?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // Skip non-image files or very small files (< 50KB)
  if (!file.type.startsWith("image/") || file.size < 50 * 1024) {
    return file;
  }

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compressed is larger, use original
            resolve(file);
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp", lastModified: Date.now() }
          );

          console.log(
            `Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
          );

          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}
