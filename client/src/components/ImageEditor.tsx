import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crop,
  RotateCw,
  Palette,
  Download,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";

interface ImageEditorProps {
  src: string;
  onSave?: (blob: Blob) => void;
  onCancel?: () => void;
}

export function ImageEditor({ src, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyFilters = async () => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Apply rotation
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.drawImage(img, 0, 0);

      // Apply filters
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = Math.min(255, (data[i] * brightness) / 100);
        data[i + 1] = Math.min(255, (data[i + 1] * brightness) / 100);
        data[i + 2] = Math.min(255, (data[i + 2] * brightness) / 100);

        // Contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        data[i] = Math.min(255, factor * (data[i] - 128) + 128);
        data[i + 1] = Math.min(255, factor * (data[i + 1] - 128) + 128);
        data[i + 2] = Math.min(255, factor * (data[i + 2] - 128) + 128);

        // Saturation (simplified)
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = Math.min(255, gray + (data[i] - gray) * (saturation / 100));
        data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * (saturation / 100));
        data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * (saturation / 100));
      }

      ctx.putImageData(imageData, 0, 0);
    };
  };

  const handleSave = async () => {
    try {
      applyFilters();

      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error("Failed to save image");
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          onSave?.(blob);
          toast.success("Image edited successfully");
        }
      }, "image/webp", 0.8);
    } catch (error) {
      toast.error("Failed to save image");
    }
  };

  const resetFilters = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4">
      <Tabs defaultValue="crop" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crop" className="flex items-center gap-2">
            <Crop className="h-4 w-4" />
            Crop
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Filters
          </TabsTrigger>
        </TabsList>

        {/* Crop Tab */}
        <TabsContent value="crop" className="space-y-4">
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height: "300px" }}>
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Zoom Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Zoom: {(zoom * 100).toFixed(0)}%
            </div>
          </div>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4">
          <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ height: "300px" }}>
            <img
              src={src}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Rotation
            </label>
            <div className="flex items-center gap-2">
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={0}
                max={360}
                step={15}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{rotation}°</span>
            </div>
          </div>

          {/* Brightness */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Brightness</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                min={50}
                max={150}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{brightness}%</span>
            </div>
          </div>

          {/* Contrast */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Contrast</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0])}
                min={50}
                max={150}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{contrast}%</span>
            </div>
          </div>

          {/* Saturation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Saturation</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[saturation]}
                onValueChange={(value) => setSaturation(value[0])}
                min={0}
                max={200}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">{saturation}%</span>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetFilters}
            variant="outline"
            className="w-full"
          >
            Reset Filters
          </Button>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleSave} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
