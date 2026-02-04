import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSEO() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<any>(null);
  
  const { data: seoSettings, isLoading, refetch } = trpc.seo.listAll.useQuery();
  const upsertMutation = trpc.seo.upsert.useMutation();
  
  const [formData, setFormData] = useState({
    pagePath: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await upsertMutation.mutateAsync(formData);
      toast.success("SEO settings saved successfully");
      
      setIsDialogOpen(false);
      setEditingSettings(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save SEO settings");
    }
  };

  const handleEdit = (settings: any) => {
    setEditingSettings(settings);
    setFormData({
      pagePath: settings.pagePath,
      metaTitle: settings.metaTitle || "",
      metaDescription: settings.metaDescription || "",
      metaKeywords: settings.metaKeywords || "",
      ogTitle: settings.ogTitle || "",
      ogDescription: settings.ogDescription || "",
      ogImage: settings.ogImage || "",
      canonicalUrl: settings.canonicalUrl || "",
      noIndex: settings.noIndex,
      noFollow: settings.noFollow,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      pagePath: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
      noIndex: false,
      noFollow: false,
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingSettings(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Manager</h1>
          <p className="text-muted-foreground">Manage meta tags and SEO settings for each page</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Page SEO
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Path</TableHead>
              <TableHead>Meta Title</TableHead>
              <TableHead>No Index</TableHead>
              <TableHead>No Follow</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seoSettings?.map((settings: any) => (
              <TableRow key={settings.id}>
                <TableCell className="font-medium">{settings.pagePath}</TableCell>
                <TableCell>{settings.metaTitle || "-"}</TableCell>
                <TableCell>
                  {settings.noIndex && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                      No Index
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {settings.noFollow && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                      No Follow
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(settings)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSettings ? "Edit SEO Settings" : "Add SEO Settings"}
            </DialogTitle>
            <DialogDescription>
              Configure meta tags and SEO settings for a specific page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pagePath">Page Path *</Label>
              <Input
                id="pagePath"
                value={formData.pagePath}
                onChange={(e) =>
                  setFormData({ ...formData, pagePath: e.target.value })
                }
                placeholder="/about, /products, etc."
                required
                disabled={!!editingSettings}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="Page title for search engines"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                rows={3}
                placeholder="Brief description for search results"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={formData.metaKeywords}
                onChange={(e) =>
                  setFormData({ ...formData, metaKeywords: e.target.value })
                }
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogTitle">Open Graph Title</Label>
              <Input
                id="ogTitle"
                value={formData.ogTitle}
                onChange={(e) =>
                  setFormData({ ...formData, ogTitle: e.target.value })
                }
                placeholder="Title for social media sharing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogDescription">Open Graph Description</Label>
              <Textarea
                id="ogDescription"
                value={formData.ogDescription}
                onChange={(e) =>
                  setFormData({ ...formData, ogDescription: e.target.value })
                }
                rows={2}
                placeholder="Description for social media sharing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage">Open Graph Image URL</Label>
              <Input
                id="ogImage"
                value={formData.ogImage}
                onChange={(e) =>
                  setFormData({ ...formData, ogImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, canonicalUrl: e.target.value })
                }
                placeholder="https://example.com/page"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="noIndex">No Index</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent search engines from indexing this page
                  </p>
                </div>
                <Switch
                  id="noIndex"
                  checked={formData.noIndex}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, noIndex: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="noFollow">No Follow</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent search engines from following links on this page
                  </p>
                </div>
                <Switch
                  id="noFollow"
                  checked={formData.noFollow}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, noFollow: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
