import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export function TestimonialsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    rating: 5,
    title: "",
    content: "",
  });

  const { data: testimonials = [], refetch } = trpc.testimonials.getAll.useQuery();
  const createMutation = trpc.testimonials.create.useMutation();
  const updateMutation = trpc.testimonials.update.useMutation();
  const deleteMutation = trpc.testimonials.delete.useMutation();
  const approveMutation = trpc.testimonials.approve.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: formData.title,
          content: formData.content,
          rating: formData.rating,
        });
        toast.success("Testimonial updated successfully");
      } else {
        await createMutation.mutateAsync({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          rating: formData.rating,
          title: formData.title,
          content: formData.content,
        });
        toast.success("Testimonial created successfully");
      }

      setFormData({
        customerName: "",
        customerEmail: "",
        rating: 5,
        title: "",
        content: "",
      });
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save testimonial");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Testimonial deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Testimonial approved successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to approve testimonial");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Testimonials</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Testimonial"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
              />
              <Input
                placeholder="Customer Email"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <select
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseInt(e.target.value) })
                  }
                  className="w-full border rounded-md p-2"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              placeholder="Testimonial Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <Textarea
              placeholder="Testimonial Content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows={4}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Create"} Testimonial
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    customerName: "",
                    customerEmail: "",
                    rating: 5,
                    title: "",
                    content: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <h3 className="font-bold text-lg">{testimonial.title}</h3>
                <p className="text-sm text-gray-600">
                  By {testimonial.customerName}
                </p>
              </div>

              <div className="flex gap-2">
                {!testimonial.isApproved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(testimonial.id)}
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                )}
                {testimonial.isApproved && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Approved
                  </span>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(testimonial.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{testimonial.content}</p>

            <div className="flex gap-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  testimonial.isActive
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {testimonial.isActive ? "Active" : "Inactive"}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  testimonial.isApproved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {testimonial.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No testimonials yet. Create one to get started!</p>
        </Card>
      )}
    </div>
  );
}
