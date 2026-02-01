import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { ImagePreview } from "./ImagePreview";
import { BatchImageUpload } from "./BatchImageUpload";
import { ImageEditor } from "./ImageEditor";

interface AdvancedImageUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function AdvancedImageUpload({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10,
}: AdvancedImageUploadProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingPreview, setEditingPreview] = useState<string>("");

  const handleEditImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingPreview(e.target?.result as string);
      setEditingFile(file);
      setShowEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleEditorSave = async (blob: Blob) => {
    try {
      // Convert blob to File
      const editedFile = new File([blob], editingFile?.name || "edited-image.webp", {
        type: "image/webp",
      });

      // Upload the edited file
      const formData = new FormData();
      formData.append("file", editedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.url) {
        onUploadComplete?.([data.url]);
        toast.success("Image edited and uploaded successfully");
        setShowEditor(false);
        setEditingFile(null);
        setEditingPreview("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload edited image");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5" />
          <h3 className="font-semibold">Upload Product Images</h3>
        </div>

        <BatchImageUpload
          onUploadComplete={onUploadComplete}
          maxFiles={maxFiles}
          maxSizeMB={maxSizeMB}
        />

        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">💡 Tips</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload up to {maxFiles} images at once</li>
            <li>Recommended size: 1200×1200 pixels or larger</li>
            <li>Images are automatically compressed to WebP format</li>
            <li>Use the editor to crop, rotate, or adjust brightness/contrast</li>
          </ul>
        </div>
      </div>

      {/* Image Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editingPreview && (
            <ImageEditor
              src={editingPreview}
              onSave={handleEditorSave}
              onCancel={() => setShowEditor(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
