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
import { Star, ThumbsUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const { user } = useAuth();
  
  const { data: reviews, isLoading, refetch } = trpc.reviews.list.useQuery({ productId });
  const createMutation = trpc.reviews.create.useMutation();
  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();
  
  const [formData, setFormData] = useState({
    authorName: user?.name || "",
    authorEmail: user?.email || "",
    title: "",
    comment: "",
  });

  const handleSubmit = async () => {
    if (!formData.authorName) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await createMutation.mutateAsync({
        productId,
        userId: typeof user?.id === 'number' ? user.id : parseInt(user?.id as string) || 1,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail || undefined,
        rating,
        title: formData.title || undefined,
        comment: formData.comment || undefined,
      });

      toast.success("Review submitted! It will appear after approval.");
      setIsDialogOpen(false);
      setFormData({ authorName: user?.name || "", authorEmail: user?.email || "", title: "", comment: "" });
      setRating(5);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      await markHelpfulMutation.mutateAsync({ id: reviewId });
      toast.success("Thank you for your feedback!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as helpful");
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? (hoverRating || rating) : count)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            {renderStars(Math.round(parseFloat(averageRating)))}
            <span className="text-lg font-semibold">{averageRating}</span>
            <span className="text-muted-foreground">({reviews?.length || 0} reviews)</span>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          Write a Review
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="border rounded-lg p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{review.authorName}</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {review.title && (
                <h3 className="font-semibold text-lg">{review.title}</h3>
              )}

              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-60 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkHelpful(review.id)}
                  disabled={markHelpfulMutation.isPending}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpfulCount})
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your thoughts about this product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              {renderStars(rating, true)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Your Name *</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorEmail">Email (optional)</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Review Title (optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Great product!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review (optional)</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Tell us what you think..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.authorName || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
