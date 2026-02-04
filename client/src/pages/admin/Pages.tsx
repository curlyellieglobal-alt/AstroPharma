import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export function PagesManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    titleAr: "",
    content: "",
    contentAr: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
  });

  const { data: pages, refetch } = trpc.pages.list.useQuery();
  const createPage = trpc.pages.create.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });
  const updatePage = trpc.pages.update.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });
  const deletePage = trpc.pages.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      titleAr: "",
      content: "",
      contentAr: "",
      metaTitle: "",
      metaDescription: "",
      isPublished: false,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePage.mutate({ id: editingId, ...formData });
    } else {
      createPage.mutate(formData);
    }
  };

  const handleEdit = (page: any) => {
    setFormData({
      slug: page.slug,
      title: page.title,
      titleAr: page.titleAr || "",
      content: page.content,
      contentAr: page.contentAr || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished,
    });
    setEditingId(page.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deletePage.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Page Builder</h1>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "New Page"}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Page" : "Create New Page"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug (URL) *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="about-us"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be accessible at /page/{formData.slug || "slug"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Title
                </label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="SEO title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title (English) *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="About Us"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title (Arabic)
                </label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) =>
                    setFormData({ ...formData, titleAr: e.target.value })
                  }
                  placeholder="عن الشركة"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Description
              </label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="SEO description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content (English) *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Page content in English..."
                  rows={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports HTML and Markdown
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content (Arabic)
                </label>
                <Textarea
                  value={formData.contentAr}
                  onChange={(e) =>
                    setFormData({ ...formData, contentAr: e.target.value })
                  }
                  placeholder="محتوى الصفحة بالعربية..."
                  rows={10}
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports HTML and Markdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">
                Publish page (make it visible to public)
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700"
                disabled={createPage.isPending || updatePage.isPending}
              >
                {editingId ? "Update Page" : "Create Page"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {pages?.map((page: any) => (
          <Card key={page.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{page.title}</h3>
                  {page.isPublished ? (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      <Eye className="h-3 w-3" />
                      Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <EyeOff className="h-3 w-3" />
                      Draft
                    </span>
                  )}
                </div>
                {page.titleAr && (
                  <p className="text-sm text-gray-600 mb-2" dir="rtl">
                    {page.titleAr}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    /page/{page.slug}
                  </span>
                </p>
                {page.metaDescription && (
                  <p className="text-xs text-gray-500 mt-2">
                    {page.metaDescription}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(page.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(page)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(page.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!pages || pages.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No pages created yet. Click "New Page" to get started.</p>
        </Card>
      ) : null}
    </div>
  );
}
