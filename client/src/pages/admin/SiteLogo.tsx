import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Upload, X } from "lucide-react";

export default function SiteLogoManager() {
  const utils = trpc.useUtils();
  const { data: logoSetting, isLoading } = trpc.siteSettings.get.useQuery({ key: "site_logo" });
  const updateSettingMutation = trpc.siteSettings.update.useMutation({
    onSuccess: () => {
      utils.siteSettings.invalidate();
      toast.success("Logo updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update logo: ${error.message}`);
    },
  });
  const deleteMediaMutation = trpc.media.deleteByUrl.useMutation();

  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (logoSetting) {
      setLogoUrl(logoSetting.settingValue || "");
    }
  }, [logoSetting]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 2) {
      toast.error("Logo size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setLogoUrl(data.url);
      toast.success("Logo uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    try {
      await updateSettingMutation.mutateAsync({
        key: "site_logo",
        value: logoUrl || null,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to save logo");
    }
  };

  const handleDelete = async () => {
    if (!logoUrl) return;

    if (!confirm("Are you sure you want to delete the site logo? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete from S3 storage
      await deleteMediaMutation.mutateAsync({ url: logoUrl });

      // Update setting to empty
      await updateSettingMutation.mutateAsync({
        key: "site_logo",
        value: null,
      });

      setLogoUrl("");
      toast.success("Logo deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete logo");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Logo</h1>
        <p className="text-muted-foreground">Upload, replace, or delete your site logo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo Management</CardTitle>
          <CardDescription>
            Your logo will appear in the header of your website. Recommended size: 200x50px (PNG or SVG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Current Logo</Label>
            {logoUrl ? (
              <div className="relative group">
                <div className="relative w-full max-w-md p-8 bg-gray-50 rounded-lg border">
                  <img
                    src={logoUrl}
                    alt="Site logo"
                    className="max-h-24 w-auto mx-auto object-contain"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || updateSettingMutation.isPending}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Delete Logo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md p-12 bg-gray-50 rounded-lg border-2 border-dashed text-center text-muted-foreground">
                <Upload className="h-36 w-12 mx-auto mb-4 opacity-50" />
                <p>No logo uploaded</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="logo-upload">
              {logoUrl ? "Replace Logo" : "Upload Logo"}
            </Label>
            <div className="flex gap-2">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("logo-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Accepted formats: PNG, JPG, SVG. Max size: 2MB
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!logoUrl || updateSettingMutation.isPending}
          >
            {updateSettingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Logo
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
