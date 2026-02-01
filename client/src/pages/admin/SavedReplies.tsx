import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function SavedReplies() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    replyType: "text" as "text" | "image" | "link",
    content: "",
    mediaUrl: "",
    linkUrl: "",
    linkText: "",
  });

  const { data: savedReplies, refetch } = trpc.savedReplies.list.useQuery({});

  const createMutation = trpc.savedReplies.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreating(false);
      resetForm();
    },
  });

  const updateMutation = trpc.savedReplies.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.savedReplies.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const reorderMutation = trpc.savedReplies.reorder.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      replyType: "text",
      content: "",
      mediaUrl: "",
      linkUrl: "",
      linkText: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate({
        adminId: typeof user.id === 'number' ? user.id : parseInt(user.id as string) || 1,
        ...formData,
        displayOrder: savedReplies?.length || 0,
      });
    }
  };

  const handleEdit = (reply: any) => {
    setEditingId(reply.id);
    setFormData({
      replyType: reply.replyType,
      content: reply.content,
      mediaUrl: reply.mediaUrl || "",
      linkUrl: reply.linkUrl || "",
      linkText: reply.linkText || "",
    });
    setIsCreating(true);
  };

  const handleReorder = (id: number, direction: "up" | "down") => {
    const currentIndex = savedReplies?.findIndex((r) => r.id === id);
    if (currentIndex === undefined || currentIndex === -1) return;

    const newOrder = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newOrder < 0 || newOrder >= (savedReplies?.length || 0)) return;

    reorderMutation.mutate({ id, newOrder });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Replies</h1>
          <p className="text-gray-600 mt-1">Manage quick response templates for live chat</p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            resetForm();
          }}
          className="gap-2"
        >
          {isCreating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isCreating ? "Cancel" : "New Reply"}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reply Type</label>
              <Select
                value={formData.replyType}
                onValueChange={(value: "text" | "image" | "link") =>
                  setFormData({ ...formData, replyType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter reply content..."
                rows={4}
                required
              />
            </div>

            {formData.replyType === "image" && (
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <Input
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            {formData.replyType === "link" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Link URL</label>
                  <Input
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link Text</label>
                  <Input
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="Click here"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Update" : "Create"} Reply
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {savedReplies && savedReplies.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            <p>No saved replies yet. Create your first quick response template!</p>
          </Card>
        )}

        {savedReplies?.map((reply, index) => (
          <Card key={reply.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-rose-100 text-rose-700 rounded">
                    {reply.replyType.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">Order: {index + 1}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                {reply.replyType === "image" && reply.mediaUrl && (
                  <img src={reply.mediaUrl} alt="Preview" className="mt-2 max-w-xs rounded" />
                )}
                {reply.replyType === "link" && reply.linkUrl && (
                  <a
                    href={reply.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:underline text-sm mt-2 inline-block"
                  >
                    {reply.linkText || reply.linkUrl}
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleReorder(reply.id, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleReorder(reply.id, "down")}
                  disabled={index === (savedReplies?.length || 0) - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(reply)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this saved reply?")) {
                      deleteMutation.mutate({ id: reply.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
