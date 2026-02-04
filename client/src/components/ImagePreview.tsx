import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileImage, Ruler, HardDrive } from "lucide-react";

interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}

interface ImagePreviewProps {
  file: File;
  onMetadataLoaded?: (metadata: ImageMetadata) => void;
}

export function ImagePreview({ file, onMetadataLoaded }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string>("");
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        const meta: ImageMetadata = {
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name,
        };
        setMetadata(meta);
        onMetadataLoaded?.(meta);
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  }, [file, onMetadataLoaded]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getAspectRatio = (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  };

  if (!metadata) {
    return <div className="text-center text-muted-foreground">Loading preview...</div>;
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Image Preview */}
        <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden">
          <img
            src={preview}
            alt={metadata.name}
            className="max-h-64 max-w-full object-contain"
          />
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">File Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{metadata.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatFileSize(metadata.size)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {metadata.width} × {metadata.height}px
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getAspectRatio(metadata.width, metadata.height)} Aspect Ratio
            </Badge>
            <Badge variant="secondary">
              {metadata.type.split("/")[1].toUpperCase()}
            </Badge>
            {metadata.width >= 1200 && metadata.height >= 1200 && (
              <Badge variant="default" className="bg-green-600">
                ✓ Optimal Size
              </Badge>
            )}
            {metadata.width < 100 || metadata.height < 100 ? (
              <Badge variant="destructive">Too Small</Badge>
            ) : metadata.width < 600 || metadata.height < 600 ? (
              <Badge variant="secondary">Small</Badge>
            ) : (
              <Badge variant="secondary">Good</Badge>
            )}
          </div>

          {/* Recommendations */}
          {(metadata.width < 1200 || metadata.height < 1200) && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">💡 Recommendation</p>
              <p>
                For best quality, use images that are at least 1200×1200 pixels.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
