import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Search, Trash2, FolderOpen, Image as ImageIcon, FileText, Video, HardDrive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedMedia, setSelectedMedia] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const { data: mediaAssets, isLoading, refetch } = trpc.media.list.useQuery();
  const deleteMediaMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Media deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete media: ${error.message}`);
    },
  });
  const deleteByUrlMutation = trpc.media.deleteByUrl.useMutation();

  // Filter and search
  const filteredMedia = mediaAssets?.filter((asset) => {
    const matchesSearch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || 
      (filterType === "image" && asset.mimeType?.startsWith("image/")) ||
      (filterType === "video" && asset.mimeType?.startsWith("video/")) ||
      (filterType === "document" && !asset.mimeType?.startsWith("image/") && !asset.mimeType?.startsWith("video/"));
    return matchesSearch && matchesType;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredMedia.length / pageSize);
  const paginatedMedia = filteredMedia.slice((page - 1) * pageSize, page * pageSize);

  // Calculate storage usage
  const totalSize = mediaAssets?.reduce((sum, asset) => sum + (asset.fileSize || 0), 0) || 0;
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMedia(new Set(paginatedMedia.map(m => m.id)));
    } else {
      setSelectedMedia(new Set());
    }
  };

  const handleSelectMedia = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedMedia);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedMedia(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedMedia.size === 0) {
      toast.error("No media selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedMedia.size} media file(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from S3 first
      const mediaToDelete = mediaAssets?.filter(m => selectedMedia.has(m.id)) || [];
      for (const media of mediaToDelete) {
        await deleteByUrlMutation.mutateAsync({ url: media.url });
      }

      // Delete from database
      for (const id of Array.from(selectedMedia)) {
        await deleteMediaMutation.mutateAsync({ id });
      }

      setSelectedMedia(new Set());
      toast.success(`Deleted ${selectedMedia.size} media file(s)`);
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast.error(error.message || "Failed to delete media");
    }
  };

  const handleDeleteSingle = async (media: any) => {
    try {
      // Simple confirmation without usage check (to avoid hook issues)
      if (!confirm(`Are you sure you want to delete "${media.fileName}"? This action cannot be undone.`)) {
        return;
      }

      // Delete from S3
      await deleteByUrlMutation.mutateAsync({ url: media.url });
      
      // Delete from database
      await deleteMediaMutation.mutateAsync({ id: media.id });
    } catch (error: any) {
      console.error("Delete error:", error);
      if (error.message?.includes("currently in use")) {
        toast.error("Cannot delete: Media is currently in use");
      } else {
        toast.error(error.message || "Failed to delete media");
      }
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-8 w-8 text-gray-400" />;
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-gray-400" />;
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
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">Manage all uploaded media files</p>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaAssets?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSizeMB} MB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedMedia.size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMedia.size > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedMedia.size} file(s) selected
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteMediaMutation.isPending || deleteByUrlMutation.isPending}
              >
                {deleteMediaMutation.isPending || deleteByUrlMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Media Files</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedMedia.size === paginatedMedia.length && paginatedMedia.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
          <CardDescription>
            Showing {paginatedMedia.length} of {filteredMedia.length} files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedMedia.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-36 w-12 mx-auto mb-4 opacity-50" />
              <p>No media files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginatedMedia.map((media) => (
                <div key={media.id} className="relative group">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedMedia.has(media.id)}
                      onCheckedChange={(checked) => handleSelectMedia(media.id, checked as boolean)}
                      className="bg-white"
                    />
                  </div>
                  <div className="aspect-square rounded-lg border bg-gray-50 overflow-hidden">
                    {media.mimeType?.startsWith("image/") ? (
                      <img
                        src={media.thumbnailUrl || media.url}
                        alt={media.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(media.mimeType || undefined)}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSingle(media)}
                      disabled={deleteMediaMutation.isPending || deleteByUrlMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs truncate mt-2" title={media.fileName}>
                    {media.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {media.createdAt && formatDistanceToNow(new Date(media.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
