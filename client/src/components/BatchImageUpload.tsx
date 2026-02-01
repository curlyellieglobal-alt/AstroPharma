import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImagePreview } from "./ImagePreview";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

interface BatchImageUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function BatchImageUpload({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10,
}: BatchImageUploadProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (uploads.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newUploads: UploadItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: "pending",
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (item: UploadItem) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === item.id ? { ...u, status: "uploading", progress: 0 } : u
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", item.file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id ? { ...u, progress: Math.round(progress) } : u
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: "success",
                    progress: 100,
                    url: data.url,
                  }
                : u
            )
          );
        } else {
          throw new Error("Upload failed");
        }
      });

      xhr.addEventListener("error", () => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? {
                  ...u,
                  status: "error",
                  error: "Upload failed",
                }
              : u
          )
        );
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error: any) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === item.id
            ? {
                ...u,
                status: "error",
                error: error.message || "Upload failed",
              }
            : u
        )
      );
    }
  };

  const handleUploadAll = async () => {
    const pendingUploads = uploads.filter((u) => u.status === "pending");
    if (pendingUploads.length === 0) {
      toast.error("No files to upload");
      return;
    }

    setIsUploading(true);

    try {
      await Promise.all(pendingUploads.map((u) => uploadFile(u)));

      const successUrls = uploads
        .filter((u) => u.status === "success")
        .map((u) => u.url!)
        .filter(Boolean);

      if (successUrls.length > 0) {
        onUploadComplete?.(successUrls);
        toast.success(`${successUrls.length} file(s) uploaded successfully`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const clearAll = () => {
    setUploads([]);
  };

  const completedCount = uploads.filter((u) => u.status === "success").length;
  const totalProgress =
    uploads.length > 0
      ? Math.round(
          uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length
        )
      : 0;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />

      {uploads.length === 0 ? (
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs">Max {maxFiles} files, {maxSizeMB}MB each</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Overall Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Uploading...</span>
                <span className="text-muted-foreground">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          )}

          {/* File List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploads.map((upload) => (
              <Card key={upload.id} className="p-3">
                <div className="space-y-2">
                  {/* File Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {upload.status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      )}
                      {upload.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {upload.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{upload.file.name}</span>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={() => removeUpload(upload.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Preview */}
                  {upload.status === "pending" && (
                    <div className="text-xs text-muted-foreground">
                      <ImagePreview file={upload.file} />
                    </div>
                  )}

                  {/* Progress Bar */}
                  {upload.status === "uploading" && (
                    <div className="space-y-1">
                      <Progress value={upload.progress} className="h-1" />
                      <div className="text-xs text-muted-foreground">
                        {upload.progress}%
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {upload.status === "error" && (
                    <div className="text-xs text-red-600">{upload.error}</div>
                  )}

                  {/* Success Message */}
                  {upload.status === "success" && (
                    <div className="text-xs text-green-600">Uploaded successfully</div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleUploadAll}
              disabled={isUploading || uploads.every((u) => u.status !== "pending")}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {uploads.filter((u) => u.status === "pending").length} File(s)
            </Button>
            <Button
              onClick={clearAll}
              disabled={isUploading}
              variant="outline"
            >
              Clear
            </Button>
          </div>

          {/* Summary */}
          {completedCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount} of {uploads.length} files uploaded
            </div>
          )}
        </>
      )}
    </div>
  );
}
